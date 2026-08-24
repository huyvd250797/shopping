import Link from "next/link";
import { formatVnd, purchaseModeLabel } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.thumbnail_url || product.product_images?.[0]?.image_url || null;
  const discount = product.price && product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <Link href={`/product/${product.slug}`} className="product-card catalog-product-card">
      <div className="product-image catalog-product-image">
        {image ? (
          // Dynamic Supabase/remote URLs are intentionally rendered as regular images.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <span className="product-image-fallback" aria-hidden>🛍️</span>
        )}
        {product.badge && <span className="product-card-badge">{product.badge}</span>}
        {discount && <span className="product-discount">-{discount}%</span>}
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-price-row">
          <span className="price">{formatVnd(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > (product.price ?? 0) && (
            <span className="compare-price">{formatVnd(product.compare_at_price)}</span>
          )}
        </div>
        <div className="product-meta">
          <span className={`mode-pill mode-${product.purchase_mode.toLowerCase()}`}>{purchaseModeLabel(product.purchase_mode)}</span>
          {product.category?.name && <span className="product-category-text">{product.category.name}</span>}
        </div>
      </div>
    </Link>
  );
}
