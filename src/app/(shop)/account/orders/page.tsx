import Link from "next/link";
import { requireUser } from "@/lib/auth/user";

export default async function MyOrdersPage() {
  await requireUser("/account/orders");
  return (
    <div className="container-app placeholder-page">
      <div className="placeholder-box">
        <span className="route-chip">Protected • RLS Ready</span>
        <h1>Đơn hàng của tôi</h1>
        <p>V0.2.0 đã bảo vệ route và thêm policy để customer chỉ được đọc order/order item/status history thuộc chính `user_id` của mình. Giao diện danh sách đơn hoàn chỉnh vẫn giữ đúng roadmap V0.8.0.</p>
        <Link className="secondary-link-button" href="/account">← Quay lại tài khoản</Link>
      </div>
    </div>
  );
}
