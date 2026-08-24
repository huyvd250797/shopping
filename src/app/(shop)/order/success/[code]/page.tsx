import { PlaceholderPage } from "@/components/placeholder-page";

export default async function OrderSuccessPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PlaceholderPage title="Đặt hàng thành công" route={`/order/success/${code}`} targetVersion="V0.5.0 – Direct Checkout" description="Route success đã dựng sẵn cho mã đơn, tóm tắt đơn và hướng dẫn tiếp theo." />;
}
