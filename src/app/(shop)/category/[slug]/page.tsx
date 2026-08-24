import { PlaceholderPage } from "@/components/placeholder-page";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PlaceholderPage title="Danh mục sản phẩm" route={`/category/${slug}`} targetVersion="V0.3.0 → V0.4.0" description="Route động đã sẵn sàng cho dữ liệu category và product grid từ Supabase." />;
}
