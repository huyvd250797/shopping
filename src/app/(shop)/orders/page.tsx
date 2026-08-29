import Link from "next/link";
import { RecentOrders } from "@/components/shop/recent-orders";
import { getCurrentUser } from "@/lib/auth/user";

export default async function DeviceOrdersPage() {
  const current = await getCurrentUser();
  return (
    <div className="container-app account-page">
      <div className="account-head"><div><span className="route-chip">Lịch sử trên thiết bị</span><h1>Đơn hàng gần đây</h1><p>Guest vẫn xem lại được đơn trên đúng trình duyệt đã đặt. Database là nguồn dữ liệu chính; localStorage chỉ giữ mã đơn và token truy cập.</p></div></div>
      <RecentOrders />
      <div className="device-orders-footnote">
        {current ? <><span>Bạn đang đăng nhập.</span><Link href="/account/orders">Đơn đồng bộ theo tài khoản →</Link></> : <><span>Đăng nhập để các phiên bản sau đồng bộ lịch sử theo tài khoản.</span><Link href="/login?next=/orders">Đăng nhập →</Link></>}
      </div>
    </div>
  );
}
