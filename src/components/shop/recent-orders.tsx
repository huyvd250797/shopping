"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatVnd } from "@/lib/catalog/format";
import type { RecentOrder } from "@/types/checkout";

const HISTORY_KEY = "myshop_recent_orders_v1";

export function RecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[] | null>(null);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as RecentOrder[];
      setOrders(Array.isArray(parsed) ? parsed : []);
    } catch {
      setOrders([]);
    }
  }, []);

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    setOrders([]);
  }

  if (orders === null) return <div className="catalog-empty">Đang đọc lịch sử trên thiết bị...</div>;
  if (orders.length === 0) return <div className="catalog-empty"><div><strong>Chưa có đơn hàng trên thiết bị này.</strong><p>Đơn Guest sau khi đặt thành công sẽ xuất hiện tại đây.</p><Link className="secondary-link-button" href="/">Khám phá sản phẩm</Link></div></div>;

  return (
    <div className="recent-orders-wrap">
      <div className="recent-orders-toolbar"><span>{orders.length} đơn gần đây trên trình duyệt</span><button type="button" onClick={clearHistory}>Xóa lịch sử thiết bị</button></div>
      <div className="recent-orders-list">
        {orders.map((order) => (
          <Link className="recent-order-card" key={order.orderCode} href={`/order/success/${encodeURIComponent(order.orderCode)}?token=${encodeURIComponent(order.accessToken)}`}>
            <div><span>Mã đơn</span><strong>{order.orderCode}</strong><small>{order.productName}</small></div>
            <div><span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span><strong>{formatVnd(order.total)}</strong><small>Xem chi tiết →</small></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
