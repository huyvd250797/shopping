import Link from "next/link";
import { isHttpUrl } from "@/lib/catalog/format";
import type { CatalogProduct } from "@/types/catalog";

export function PurchaseCta({ product }: { product: CatalogProduct }) {
  const affiliateValid = isHttpUrl(product.affiliate_url);
  const directHref = `/checkout/${product.slug}`;
  const directSoldOut = product.track_stock && (product.stock_qty ?? 0) <= 0;

  if (directSoldOut && product.purchase_mode === "DIRECT") {
    return <div className="catalog-warning">Sản phẩm đang hết hàng. Vui lòng quay lại sau.</div>;
  }

  if (directSoldOut && product.purchase_mode === "HYBRID" && !affiliateValid) {
    return <div className="catalog-warning">Sản phẩm đang hết hàng và liên kết đối tác chưa khả dụng.</div>;
  }

  if (product.purchase_mode === "AFFILIATE") {
    if (!affiliateValid) {
      return <div className="catalog-warning">Liên kết mua hàng đang được cập nhật. Vui lòng quay lại sau.</div>;
    }
    return (
      <a className="catalog-cta catalog-cta-primary" href={`/go/${product.slug}?src=product_detail`} target="_blank" rel="noopener noreferrer sponsored">
        {product.button_label || "Xem ưu đãi"}
      </a>
    );
  }

  if (product.purchase_mode === "HYBRID") {
    return (
      <div className="catalog-cta-group">
        {!directSoldOut && <Link className="catalog-cta catalog-cta-primary" href={directHref}>
          {product.button_label || "Đặt hàng"}
        </Link>}
        {affiliateValid && (
          <a className="catalog-cta catalog-cta-secondary" href={`/go/${product.slug}?src=product_detail`} target="_blank" rel="noopener noreferrer sponsored">
            {product.secondary_button_label || "Xem ưu đãi"}
          </a>
        )}
      </div>
    );
  }

  return (
    <Link className="catalog-cta catalog-cta-primary" href={directHref}>
      {product.button_label || "Mua ngay"}
    </Link>
  );
}
