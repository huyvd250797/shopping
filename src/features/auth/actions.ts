"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { safeInternalPath } from "@/lib/auth/redirect";

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function emailField(formData: FormData) {
  return field(formData, "email").toLowerCase();
}

function toQuery(path: string, key: "error" | "message", value: string, next?: string) {
  const params = new URLSearchParams({ [key]: value });
  if (next) params.set("next", next);
  return `${path}?${params.toString()}`;
}

export async function loginCustomer(formData: FormData) {
  const email = emailField(formData);
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(formData.get("next"), "/account");

  if (!email || !password) redirect(toQuery("/login", "error", "missing_fields", next));
  if (!isSupabaseConfigured()) redirect(toQuery("/login", "error", "supabase_not_configured", next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(toQuery("/login", "error", "invalid_credentials", next));

  redirect(next);
}

export async function registerCustomer(formData: FormData) {
  const fullName = field(formData, "full_name");
  const phone = field(formData, "phone");
  const email = emailField(formData);
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!fullName || !email || !password) redirect(toQuery("/register", "error", "missing_fields"));
  if (password.length < 8) redirect(toQuery("/register", "error", "weak_password"));
  if (password !== confirmPassword) redirect(toQuery("/register", "error", "password_mismatch"));
  if (!isSupabaseConfigured()) redirect(toQuery("/register", "error", "supabase_not_configured"));

  const supabase = await createClient();
  const callback = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/account")}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callback,
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    const code = error.message.toLowerCase().includes("already") ? "email_exists" : "signup_failed";
    redirect(toQuery("/register", "error", code));
  }

  if (data.session) redirect("/account?message=registered");
  redirect("/login?message=confirm_email");
}

export async function logoutCustomer() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/?message=signed_out");
}

export async function requestPasswordReset(formData: FormData) {
  const email = emailField(formData);
  if (!email) redirect(toQuery("/forgot-password", "error", "missing_email"));
  if (!isSupabaseConfigured()) redirect(toQuery("/forgot-password", "error", "supabase_not_configured"));

  const supabase = await createClient();
  const redirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) redirect(toQuery("/forgot-password", "error", "reset_failed"));
  redirect("/forgot-password?message=reset_sent");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) redirect(toQuery("/auth/update-password", "error", "weak_password"));
  if (password !== confirmPassword) redirect(toQuery("/auth/update-password", "error", "password_mismatch"));
  if (!isSupabaseConfigured()) redirect(toQuery("/auth/update-password", "error", "supabase_not_configured"));

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=recovery_session_required");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(toQuery("/auth/update-password", "error", "update_failed"));

  redirect("/account?message=password_updated");
}
