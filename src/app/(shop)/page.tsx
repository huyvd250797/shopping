/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCategories, getPublicProducts } from "@/features/catalog/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [categories, featured, products] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({ featuredOnly: true, limit: 8 }),
    getPublicProducts({ limit: 12 }),
  ]);
  const featuredProducts = featured.length ? featured : products.slice(0, 8);

  return (
    <div className="container-app">
      <section className="hero catalog-hero">
        <div>
          <span className="hero-kicker">V0.3.0 Catalog & CMS Core</span>
          <h1>Mua sắm gọn hơn, lựa chọn rõ hơn.</h1>
          <p>
            Catalog đã đọc dữ liệu thật từ Supabase. Mỗi sản phẩm có thể dẫn tới đối tác Affiliate,
            đặt hàng trực tiếp hoặc kết hợp cả hai theo cấu hình của cửa hàng.
          </p>
          <div className="hero-actions">
            <Link className="hero-button" href="#san-pham">Xem sản phẩm</Link>
            <Link className="hero-button secondary" href="/search">Tìm kiếm</Link>
          </div>
        </div>
        <div className="hero-card catalog-hero-card">
          <strong>{products.length}</strong>
          <small>sản phẩm đang hiển thị trong lượt tải hiện tại</small>
          <span>{categories.length} danh mục đang hoạt động</span>
        </div>
      </section>

      {!configured && (
        <section className="section foundation-callout">
          <strong>Chưa kết nối Supabase:</strong> hãy cấu hình biến môi trường production để catalog đọc dữ liệu thật.
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div><h2>Danh mục</h2><p>Dữ liệu danh mục do Admin quản lý.</p></div>
          <Link className="section-note" href="/search">Xem tất cả →</Link>
        </div>
        {categories.length ? (
          <div className="category-grid catalog-category-grid">
            {categories.slice(0, 8).map((item) => (
              <Link key={item.id} href={`/category/${item.slug}`} className="category-card catalog-category-card">
                <span className="category-icon" aria-hidden>
                  {item.icon_url ? <img src={item.icon_url} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        ) : <div className="catalog-empty">Chưa có danh mục đang hiển thị.</div>}
      </section>

      <section className="section" id="san-pham">
        <div className="section-head">
          <div><h2>Sản phẩm nổi bật</h2><p>{featured.length ? "Các sản phẩm được Admin đánh dấu Featured." : "Chưa đánh dấu Featured, đang hiển thị sản phẩm mới nhất."}</p></div>
          <Link className="section-note" href="/search">Xem thêm →</Link>
        </div>
        {featuredProducts.length ? (
          <div className="product-grid">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        ) : <div className="catalog-empty">Chưa có sản phẩm Active. Admin có thể tạo và publish tại /admin/products.</div>}
      </section>

      <section className="section foundation-callout">
        <strong>Đúng roadmap V0.3.0:</strong> Catalog/CMS Core đã dùng dữ liệu thật. Banner CMS + search/filter nâng cao sẽ hoàn thiện ở V0.4.0; tạo đơn Direct end-to-end ở V0.5.0; tracking affiliate ở V0.7.0.
      </section>
    </div>
  );
}
