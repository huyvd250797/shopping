import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCategoryBySlug, getPublicProducts } from "@/features/catalog/queries";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getPublicCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getPublicProducts({ categoryId: category.id });

  return (
    <div className="container-app catalog-list-page">
      <div className="catalog-breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>{category.name}</span></div>
      <div className="catalog-page-head"><div><span className="route-chip">Danh mục</span><h1>{category.name}</h1><p>{products.length} sản phẩm đang hiển thị.</p></div></div>
      {products.length ? <div className="product-grid catalog-list-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty">Danh mục này chưa có sản phẩm Active.</div>}
    </div>
  );
}
