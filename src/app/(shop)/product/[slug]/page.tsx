import { PlaceholderPage } from "@/components/placeholder-page";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlaceholderPage title="Chi tiết sản phẩm" route={`/product/${slug}`} targetVersion="V0.3.0 – Catalog & CMS Core" description="Trang chi tiết sẽ dùng dữ liệu thật, gallery, giá và CTA theo purchase mode Affiliate / Direct / Hybrid." />;
}
