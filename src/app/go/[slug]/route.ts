import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isHttpUrl } from "@/lib/catalog/format";

const SESSION_COOKIE = "myshop_aff_session";
const SESSION_RE = /^[A-Za-z0-9_-]{16,96}$/;

function sourceFrom(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("src") || "product_detail";
  return /^[A-Za-z0-9_./?-]{1,160}$/.test(raw) ? raw : "product_detail";
}

function unavailable(request: NextRequest, slug: string) {
  const url = new URL(`/product/${encodeURIComponent(slug)}`, request.url);
  url.searchParams.set("affiliate", "unavailable");
  return NextResponse.redirect(url, 303);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug || slug.length > 120) return unavailable(request, slug || "unknown");

  const existingSession = request.cookies.get(SESSION_COOKIE)?.value || "";
  const sessionId = SESSION_RE.test(existingSession) ? existingSession : crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("record_affiliate_click", {
      p_product_slug: slug,
      p_session_id: sessionId,
      p_source_path: sourceFrom(request),
    });

    const row = Array.isArray(data) ? (data[0] as { target_url?: unknown; recorded?: unknown } | undefined) : undefined;
    const target = typeof row?.target_url === "string" ? row.target_url : null;
    if (error || target === null || !isHttpUrl(target)) return unavailable(request, slug);

    const targetUrl = new URL(target);
    const response = NextResponse.redirect(targetUrl, 303);
    response.headers.set("Cache-Control", "no-store, max-age=0");
    if (!SESSION_RE.test(existingSession)) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch {
    return unavailable(request, slug);
  }
}
