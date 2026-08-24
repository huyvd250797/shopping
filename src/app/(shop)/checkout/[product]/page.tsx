import { PlaceholderPage } from "@/components/placeholder-page";

export default async function CheckoutPage({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  return <PlaceholderPage title="Checkout trực tiếp" route={`/checkout/${product}`} targetVersion="V0.5.0 – Direct Checkout" description="Guest checkout sẽ được phép theo cấu hình mặc định. V0.5.0 mới tạo order thật và lưu history trên thiết bị." />;
}
