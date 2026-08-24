import { PlaceholderPage } from "@/components/placeholder-page";

export default function MyOrdersPage() {
  return <PlaceholderPage title="Đơn hàng của tôi" route="/account/orders" targetVersion="V0.8.0 – Customer Account" description="Đơn của khách đăng nhập sẽ đọc từ database theo user_id. Guest history trên trình duyệt sẽ bắt đầu từ V0.5.0." />;
}
