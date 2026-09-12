"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type RecentOrderClaimInput = { orderCode: string; accessToken: string };
export type RecentOrderSyncResult = { ok: boolean; claimed: number; alreadyOwned: number; skipped: number; message: string };

function validOrderCode(value: string) {
  return /^ORD-[A-Z0-9-]{8,40}$/i.test(value.trim());
}

function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function syncRecentOrders(entries: RecentOrderClaimInput[]): Promise<RecentOrderSyncResult> {
  if (!isSupabaseConfigured()) return { ok: false, claimed: 0, alreadyOwned: 0, skipped: 0, message: "Supabase chưa được cấu hình." };
  if (!Array.isArray(entries)) return { ok: false, claimed: 0, alreadyOwned: 0, skipped: 0, message: "Dữ liệu đồng bộ không hợp lệ." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, claimed: 0, alreadyOwned: 0, skipped: entries.length, message: "Phiên đăng nhập đã hết hạn." };

  let claimed = 0;
  let alreadyOwned = 0;
  let skipped = 0;
  const safeEntries = entries.slice(0, 20);

  for (const entry of safeEntries) {
    const orderCode = String(entry?.orderCode ?? "").trim();
    const accessToken = String(entry?.accessToken ?? "").trim();
    if (!validOrderCode(orderCode) || !validUuid(accessToken)) {
      skipped += 1;
      continue;
    }

    const { data, error } = await supabase.rpc("claim_recent_order", {
      p_order_code: orderCode,
      p_access_token: accessToken,
    });

    if (error) {
      skipped += 1;
      continue;
    }

    if (data === "CLAIMED") claimed += 1;
    else if (data === "ALREADY_OWNED") alreadyOwned += 1;
    else skipped += 1;
  }

  return {
    ok: true,
    claimed,
    alreadyOwned,
    skipped,
    message: claimed > 0 ? `Đã đồng bộ ${claimed} đơn từ lịch sử trình duyệt vào tài khoản.` : "Lịch sử trình duyệt đã được kiểm tra.",
  };
}
