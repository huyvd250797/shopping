"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncRecentOrders } from "@/app/(shop)/account/orders/actions";
import type { RecentOrder } from "@/types/checkout";

const HISTORY_KEY = "myshop_recent_orders_v1";

export function SyncRecentOrders({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const guardKey = `myshop_account_sync_v080:${userId}`;
    try {
      if (sessionStorage.getItem(guardKey) === "done") return;
      sessionStorage.setItem(guardKey, "done");
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as RecentOrder[];
      const entries = parsed
        .filter((item) => item?.orderCode && item?.accessToken)
        .slice(0, 20)
        .map((item) => ({ orderCode: item.orderCode, accessToken: item.accessToken }));
      if (entries.length === 0) return;

      startTransition(async () => {
        const result = await syncRecentOrders(entries);
        if (!result.ok) return;
        if (result.claimed > 0) {
          setMessage(result.message);
          router.refresh();
        }
      });
    } catch {
      // Browser storage is convenience only. Account history still works from database.
    }
  }, [router, userId]);

  if (!isPending && !message) return null;
  return <div className="account-sync-banner">{isPending ? "Đang đồng bộ đơn gần đây trên thiết bị..." : message}</div>;
}
