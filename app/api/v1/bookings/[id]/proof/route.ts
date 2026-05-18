import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from "@/lib/utils/api";
import { validateFileUpload } from "@/lib/utils/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, user_id, vendor_id, dp_proof_url, clarification_message")
      .eq("id", id)
      .single();

    if (!booking) return notFound("Booking tidak ditemukan.");

    if (booking.user_id !== user.id) {
      return forbidden("Kamu bukan pemohon booking ini.");
    }

    const isFirstUpload  = booking.status === "confirmed";
    const isReupload     = booking.status === "waiting_payment" && !!booking.clarification_message;

    if (!isFirstUpload && !isReupload) {
      if (booking.status === "waiting_payment") {
        return conflict(
          "Bukti DP sudah diupload dan sedang menunggu verifikasi vendor. Upload ulang hanya bisa dilakukan setelah vendor meminta klarifikasi."
        );
      }
      return conflict(
        `Bukti DP hanya bisa diupload setelah vendor konfirmasi booking. Status saat ini: ${booking.status}.`
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return badRequest("File bukti DP wajib dilampirkan.");

    const fileError = validateFileUpload(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    if (fileError) return badRequest(fileError);

    if (booking.dp_proof_url) {
      const oldPath = booking.dp_proof_url.replace("booking-proofs/", "");
      await supabase.storage.from("booking-proofs").remove([oldPath]);
    }

    const ext      = file.name.split(".").pop();
    const filePath = `${booking.vendor_id}/${id}/dp-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("booking-proofs")
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return serverError(`Gagal upload file: ${uploadError.message}`);
    }

    const dp_proof_url  = `booking-proofs/${filePath}`;
    const adminSupabase = createAdminClient();

    const updatePayload: Record<string, unknown> = {
      dp_proof_url,
      status:     "waiting_payment",
      updated_at: new Date().toISOString(),
    };

    if (isReupload) {
      updatePayload.clarification_message = null;
      updatePayload.clarification_at      = null;
    }

    const { data: updated, error: updateError } = await adminSupabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, status, dp_proof_url, clarification_message, updated_at")
      .single();

    if (updateError) {
      await supabase.storage.from("booking-proofs").remove([filePath]);
      return serverError(updateError.message);
    }

    if (!updated) {
      await supabase.storage.from("booking-proofs").remove([filePath]);
      return forbidden("Gagal memperbarui booking. Pastikan kamu adalah pemilik booking ini.");
    }

    const message = isReupload
      ? "Bukti DP berhasil diupload ulang. Vendor akan mereview kembali."
      : "Bukti DP berhasil diupload. Tunggu verifikasi dari vendor.";

    return ok({ booking: updated, message });
  } catch {
    return serverError();
  }
}