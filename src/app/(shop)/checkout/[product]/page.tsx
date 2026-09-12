import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { getPublicProductBySlug } from "@/features/catalog/queries";
import { getCheckoutSettings } from "@/features/checkout/queries";
import { getCurrentUser } from "@/lib/auth/user";

export default async function CheckoutPage({ params }: { params: Promise<{ product: string }> }) {
  const { product: slug } = await params;
  const [product, current, settings] = await Promise.all([
    getPublicProductBySlug(slug),
    getCurrentUser(),
    getCheckoutSettings(),
  ]);

  if (!product) notFound();
  if (!['DIRECT', 'HYBRID'].includes(product.purchase_mode)) redirect(`/product/${encodeURIComponent(product.slug)}`);
  if (settings.requireLogin && !current) redirect(`/login?next=${encodeURIComponent(`/checkout/${product.slug}`)}&message=checkout_login_required`);

  if (product.price === null) {
    return (
      <div className="container-app checkout-page">
        <div className="checkout-unavailable-card">
          <span className="route-chip">Direct Checkout</span>
          <h1>Chưa thể đặt sản phẩm này</h1>
          <p>Giá bán trực tiếp chưa được cấu hình. Vui lòng quay lại trang sản phẩm hoặc liên hệ cửa hàng.</p>
          <Link className="secondary-link-button" href={`/product/${product.slug}`}>← Quay lại sản phẩm</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app checkout-page">
      <div className="catalog-breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href={`/product/${product.slug}`}>{product.name}</Link><span>/</span><span>Đặt hàng</span></div>
      <CheckoutForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          thumbnailUrl: product.thumbnail_url,
          price: product.price,
          compareAtPrice: product.compare_at_price,
          trackStock: product.track_stock,
          stockQty: product.stock_qty,
        }}
        defaults={{
          customerName: current?.profile?.full_name || "",
          phone: current?.profile?.phone || "",
          email: current?.user.email || "",
          province: current?.profile?.province || "",
          district: current?.profile?.district || "",
          ward: current?.profile?.ward || "",
          addressLine: current?.profile?.address_line || "",
        }}
        requireLogin={settings.requireLogin}
        isAuthenticated={Boolean(current)}
      />
    </div>
  );
}
