"use client";

import { useEffect } from "react";
import type { RecentOrder } from "@/types/checkout";

const HISTORY_KEY = "myshop_recent_orders_v1";

export function OrderSuccessLocal({ order }: { order: RecentOrder }) {
  useEffect(() => {
    try {
      const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as RecentOrder[];
      const next = [order, ...current.filter((item) => item.orderCode !== order.orderCode)].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {
      // Database is the source of truth. Local history is convenience only.
    }
  }, [order]);

  return null;
}
