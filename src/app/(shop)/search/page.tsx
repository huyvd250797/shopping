import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicProducts } from "@/features/catalog/queries";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const products = q ? await getPublicProducts({ search: q, limit: 48 }) : await getPublicProducts({ limit: 48 });

  return (
    <div className="container-app catalog-list-page">
      <div className="catalog-breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Tìm kiếm</span></div>
      <div className="catalog-page-head">
        <div><span className="route-chip">Basic Search • V0.3.0</span><h1>{q ? `Kết quả cho “${q}”` : "Tất cả sản phẩm"}</h1><p>{products.length} kết quả. Bộ lọc/sắp xếp nâng cao sẽ vào V0.4.0.</p></div>
      </div>
      {products.length ? <div className="product-grid catalog-list-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty">Không tìm thấy sản phẩm phù hợp.</div>}
    </div>
  );
}
