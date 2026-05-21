import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RegisterSchema } from "@/lib/validators";
import {
  badRequest,
  conflict,
  created,
  formatZodErrors,
  serverError,
} from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(formatZodErrors(parsed.error.flatten().fieldErrors));
    }

    const { email, password, full_name } = parsed.data;

    const supabase = await createClient();

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
      new URL(request.url).origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });

    if (error) {
      if (error.code === "user_already_exists" || error.status === 422) {
        return conflict("Email sudah terdaftar. Silakan login.");
      }
      return badRequest(error.message);
    }

    if (!data.user) {
      return serverError("Gagal membuat akun. Coba lagi.");
    }

    const adminClient = createAdminClient();
    const { error: profileError } = await adminClient
      .from("user_profiles")
      .upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: full_name.trim(),
          role: "user",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: true,
        }
      );

    if (profileError) {
      console.error("[register] upsert user_profiles failed:", profileError.message);
    }

    return created({
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name,
      },
      session: data.session ?? null,
      message:
        data.session === null
          ? "Registrasi berhasil. Cek email kamu untuk verifikasi akun."
          : "Registrasi berhasil.",
    });
  } catch {
    return serverError();
  }
}