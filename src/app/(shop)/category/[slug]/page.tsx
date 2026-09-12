import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCategoryBySlug, searchPublicProducts, type CatalogSort } from "@/features/catalog/queries";
import { getSiteUrl } from "@/lib/supabase/env";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) return { title: "Danh mục không tồn tại", robots: { index: false, follow: true } };
  const canonical = `${getSiteUrl()}/category/${encodeURIComponent(category.slug)}`;
  return {
    title: category.name,
    description: `Khám phá sản phẩm trong danh mục ${category.name} tại MyShop.`,
    alternates: { canonical },
    openGraph: { title: category.name, description: `Sản phẩm ${category.name} tại MyShop.`, url: canonical },
  };
}

function validSort(value?: string): CatalogSort {
  return value && ["relevant", "newest", "price_asc", "price_desc"].includes(value) ? value as CatalogSort : "relevant";
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string; page?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) notFound();
  const sort = validSort(query.sort);
  const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const { products, total } = await searchPublicProducts({ categoryId: category.id, sort, page, pageSize: 24 });
  const totalPages = Math.max(1, Math.ceil(total / 24));

  return (
    <div className="container-app catalog-list-page">
      <div className="catalog-breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>{category.name}</span></div>
      <div className="category-public-head">
        <div><span className="route-chip">Danh mục</span><h1>{category.name}</h1><p>{total} sản phẩm đang hiển thị.</p></div>
        <form action={`/category/${category.slug}`} className="category-sort-form"><label>Sắp xếp<select name="sort" defaultValue={sort}><option value="relevant">Mặc định</option><option value="newest">Mới nhất</option><option value="price_asc">Giá tăng</option><option value="price_desc">Giá giảm</option></select></label><button type="submit">Áp dụng</button></form>
      </div>
      {products.length ? <div className="product-grid catalog-list-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty">Danh mục này chưa có sản phẩm đang bán.</div>}
      {totalPages > 1 && <nav className="catalog-pagination" aria-label="Phân trang danh mục"><span>{page > 1 ? <Link href={`/category/${category.slug}?sort=${sort}&page=${page - 1}`}>← Trước</Link> : <span className="pagination-disabled">← Trước</span>}</span><span>Trang <strong>{page}</strong> / {totalPages}</span><span>{page < totalPages ? <Link href={`/category/${category.slug}?sort=${sort}&page=${page + 1}`}>Sau →</Link> : <span className="pagination-disabled">Sau →</span>}</span></nav>}
    </div>
  );
}
