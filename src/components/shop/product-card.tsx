import Link from "next/link";
import { formatVnd, purchaseModeLabel } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/types/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.thumbnail_url || product.product_images?.[0]?.image_url || null;
  const discount = product.price && product.compare_at_price && product.compare_at_price > product.price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;
  const stockText = product.track_stock ? ((product.stock_qty ?? 0) > 0 ? `Còn ${product.stock_qty}` : "Tạm hết") : null;

  return (
    <Link href={`/product/${product.slug}`} className="product-card catalog-product-card marketplace-product-card">
      <div className="product-image catalog-product-image">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" />
        ) : <span className="product-image-fallback" aria-hidden>🛍️</span>}
        <div className="product-card-toplabels">
          {product.badge && <span className="product-card-badge">{product.badge}</span>}
          {discount && <span className="product-discount">-{discount}%</span>}
        </div>
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        {product.short_description && <div className="product-card-description">{product.short_description}</div>}
        <div className="product-price-row">
          <span className="price">{formatVnd(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > (product.price ?? 0) && <span className="compare-price">{formatVnd(product.compare_at_price)}</span>}
        </div>
        <div className="product-meta">
          <span className={`mode-pill mode-${product.purchase_mode.toLowerCase()}`}>{purchaseModeLabel(product.purchase_mode)}</span>
          {stockText ? <span className={`product-stock-text ${(product.stock_qty ?? 0) <= 0 ? "out" : ""}`}>{stockText}</span> : product.category?.name && <span className="product-category-text">{product.category.name}</span>}
        </div>
        <div className="product-card-foot"><span>{product.category?.name || "MyShop"}</span><strong>Xem →</strong></div>
      </div>
    </Link>
  );
}
