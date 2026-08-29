/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { PurchaseCta } from "@/components/shop/purchase-cta";
import { getPublicProductBySlug, getPublicProducts } from "@/features/catalog/queries";
import { formatVnd, purchaseModeLabel } from "@/lib/catalog/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Sản phẩm không tồn tại" };
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description || undefined,
  };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ affiliate?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const related = product.category_id
    ? (await getPublicProducts({ categoryId: product.category_id, limit: 5 })).filter((item) => item.id !== product.id).slice(0, 4)
    : [];
  const gallery = Array.from(new Set([product.thumbnail_url, ...(product.product_images || []).map((image) => image.image_url)].filter((value): value is string => Boolean(value))));
  const mainImage = gallery[0] || null;

  return (
    <div className="container-app product-detail-page">
      <div className="catalog-breadcrumb">
        <Link href="/">Trang chủ</Link><span>/</span>
        {product.category && <><Link href={`/category/${product.category.slug}`}>{product.category.name}</Link><span>/</span></>}
        <span>{product.name}</span>
      </div>

      {query.affiliate === "unavailable" && <div className="affiliate-unavailable-message">Liên kết đối tác hiện không khả dụng hoặc cấu hình chưa hợp lệ. Vui lòng thử lại sau.</div>}

      <section className="product-detail-shell">
        <div className="product-gallery-public">
          <div className="product-main-image">
            {mainImage ? <img src={mainImage} alt={product.name} /> : <span className="product-detail-fallback">🛍️</span>}
          </div>
          {gallery.length > 1 && <div className="product-thumb-strip">{gallery.slice(0, 6).map((image, index) => <div className="product-thumb" key={image}><img src={image} alt={`${product.name} ${index + 1}`} /></div>)}</div>}
        </div>

        <div className="product-detail-info">
          <div className="product-detail-badges">
            <span className={`mode-pill mode-${product.purchase_mode.toLowerCase()}`}>{purchaseModeLabel(product.purchase_mode)}</span>
            {product.badge && <span className="badge">{product.badge}</span>}
          </div>
          <h1>{product.name}</h1>
          {product.short_description && <p className="product-short-description">{product.short_description}</p>}
          <div className="product-detail-price">
            <strong>{formatVnd(product.price)}</strong>
            {product.compare_at_price && product.compare_at_price > (product.price ?? 0) && <span>{formatVnd(product.compare_at_price)}</span>}
          </div>
          {product.sku && <div className="product-sku">Mã sản phẩm: <strong>{product.sku}</strong></div>}
          <PurchaseCta product={product} />
          {product.purchase_mode !== "DIRECT" && <p className="affiliate-disclosure">Liên kết Affiliate sẽ chuyển bạn sang website đối tác để hoàn tất giao dịch. Giá tại đối tác có thể thay đổi.</p>}
          {product.track_stock && <div className="stock-note">Tồn kho tham khảo: {product.stock_qty ?? 0}</div>}
        </div>
      </section>

      <section className="product-description-card">
        <h2>Chi tiết sản phẩm</h2>
        <div className="product-description-text">{product.description || product.short_description || "Thông tin chi tiết đang được cập nhật."}</div>
        {product.tags.length > 0 && <div className="product-tags">{product.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
      </section>

      {related.length > 0 && (
        <section className="section related-products">
          <div className="section-head"><div><h2>Sản phẩm liên quan</h2><p>Cùng danh mục {product.category?.name || ""}.</p></div></div>
          <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  );
}
