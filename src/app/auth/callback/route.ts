import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeInternalPath(url.searchParams.get("next"), "/account");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", request.url));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
