import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from "@/lib/utils/api";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: result, error: rpcError } = await supabase.rpc(
      "confirm_booking_atomic",
      {
        p_booking_id:      id,
        p_vendor_user_id:  user.id,
      }
    );

    if (!rpcError && result?.success) {
      return ok({
        booking: result.booking,
        message:
          "Booking dikonfirmasi dan tanggal telah dikunci. User perlu mengupload bukti DP.",
      });
    }

    if (rpcError || (result && !result.success && result.code === "DATE_CONFLICT")) {
      const adminSupabase = createAdminClient();

      const { data: booking } = await supabase
        .from("bookings")
        .select("id, status, event_date, vendor_id, vendor:vendor_profiles!vendor_id(id, user_id)")
        .eq("id", id)
        .single();

      if (!booking) return notFound("Booking tidak ditemukan.");

      const vendorProfile = Array.isArray(booking.vendor) ? booking.vendor[0] : booking.vendor;
      if (!vendorProfile || vendorProfile.user_id !== user.id) {
        return forbidden("Kamu bukan pemilik vendor ini.");
      }

      if (booking.status !== "pending") {
        return conflict(`Status booking tidak bisa dikonfirmasi. Status saat ini: ${booking.status}.`);
      }

      const { data: updated, error: updateError } = await adminSupabase
        .from("bookings")
        .update({ status: "confirmed", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, status, event_date, updated_at")
        .single();

      if (updateError) return serverError(updateError.message);

      await adminSupabase
        .from("availability_blocks")
        .upsert(
          { vendor_id: vendorProfile.id, date: booking.event_date, status: "booked", booking_id: id },
          { onConflict: "vendor_id,date" }
        );

      return ok({
        booking: updated,
        message: "Booking dikonfirmasi dan tanggal telah dikunci. User perlu mengupload bukti DP.",
      });
    }

    if (!result.success) {
      switch (result.code) {
        case "NOT_FOUND":
          return notFound(result.message);
        case "FORBIDDEN":
          return forbidden(result.message);
        case "INVALID_STATUS":
          return conflict(result.message);
        default:
          return serverError(result.message);
      }
    }

    return serverError();
  } catch {
    return serverError();
  }
}