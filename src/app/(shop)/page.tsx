import Link from "next/link";
import { previewCategories, previewProducts } from "@/data/foundation-preview";

export default function HomePage() {
  return (
    <div className="container-app">
      <section className="hero">
        <div>
          <span className="hero-kicker">V0.2.0 Auth & Roles</span>
          <h1>Một nền bán hàng gọn, nhanh và dễ vận hành.</h1>
          <p>
            Giao diện marketplace-inspired với nền móng sẵn cho Affiliate, Direct Order và Hybrid.
            Ở phiên bản này, các khối bên dưới là preview UI; dữ liệu sản phẩm thật sẽ vào V0.3.0.
          </p>
        </div>
        <div className="hero-card">
          <strong>2 luồng</strong>
          <small>Affiliate outbound + đặt hàng nội bộ, dùng chung một nền tảng quản trị.</small>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Danh mục</h2>
            <p>Skeleton responsive cho catalog.</p>
          </div>
          <span className="section-note">DB ở V0.3.0</span>
        </div>
        <div className="category-grid">
          {previewCategories.map((item) => (
            <Link key={item.name} href={`/category/${encodeURIComponent(item.name.toLowerCase().replaceAll(" ", "-"))}`} className="category-card">
              <span className="category-icon" aria-hidden>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Gợi ý sản phẩm</h2>
            <p>Card preview để khóa design foundation trước khi nối CRUD.</p>
          </div>
          <Link className="section-note" href="/search">Xem route tìm kiếm →</Link>
        </div>
        <div className="product-grid">
          {previewProducts.map((product, index) => (
            <Link key={product.name} href={`/product/preview-${index + 1}`} className="product-card">
              <div className="product-image" aria-hidden>{product.icon}</div>
              <div className="product-body">
                <div className="product-name">{product.name}</div>
                <div className="product-meta">
                  <span className="price">{product.price}</span>
                  <span className="badge">{product.badge}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section foundation-callout">
        <strong>Giới hạn đúng roadmap:</strong> V0.2.0 chưa có CRUD sản phẩm, checkout hay quản lý đơn thật.
        Admin Auth, route guard, schema nền, responsive layout và cấu hình deploy đã được dựng trước để các version sau phát triển ổn định.
      </section>
    </div>
  );
}
