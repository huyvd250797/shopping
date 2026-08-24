export default function ShopLoading() {
  return (
    <div className="container-app shop-loading-shell" aria-label="Đang tải nội dung">
      <div className="skeleton skeleton-banner" />
      <div className="skeleton-row">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton skeleton-category" key={index} />)}</div>
      <div className="skeleton-products">{Array.from({ length: 10 }).map((_, index) => <div className="skeleton skeleton-product" key={index} />)}</div>
    </div>
  );
}
