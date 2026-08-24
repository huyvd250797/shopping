/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { HomeBanners } from "@/components/shop/home-banners";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCategories } from "@/features/catalog/queries";
import { getProductsForHomeSection, getPublicBanners, getPublicHomeSections } from "@/features/home/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const [categories, banners, sections] = await Promise.all([
    getPublicCategories(),
    getPublicBanners(),
    getPublicHomeSections(),
  ]);

  const sectionData = await Promise.all(sections.map(async (section) => ({ section, products: await getProductsForHomeSection(section) })));

  return (
    <div className="container-app home-page-v040">
      <HomeBanners banners={banners} />

      {!configured && (
        <section className="section foundation-callout"><strong>Chưa kết nối Supabase:</strong> hãy cấu hình Environment Variables production để Home đọc dữ liệu thật.</section>
      )}

      <section className="section home-category-section">
        <div className="section-head">
          <div><h2>Danh mục nổi bật</h2><p>Chọn nhanh nhóm sản phẩm bạn đang quan tâm.</p></div>
          <Link className="section-note" href="/search">Tất cả sản phẩm →</Link>
        </div>
        {categories.length ? (
          <div className="category-scroll-row">
            {categories.slice(0, 12).map((item) => (
              <Link key={item.id} href={`/category/${item.slug}`} className="home-category-card">
                <span className="home-category-icon" aria-hidden>
                  {item.icon_url ? <img src={item.icon_url} alt="" /> : <span>{item.name.slice(0, 1).toUpperCase()}</span>}
                </span>
                <strong>{item.name}</strong>
              </Link>
            ))}
          </div>
        ) : <div className="catalog-empty">Chưa có danh mục đang hiển thị.</div>}
      </section>

      {sectionData.map(({ section, products }) => (
        <section className="section home-product-section" key={section.id}>
          <div className="section-head">
            <div><h2>{section.title}</h2>{section.subtitle && <p>{section.subtitle}</p>}</div>
            <Link className="section-note" href={section.section_type === "FEATURED" ? "/search?sort=relevant" : section.section_type === "NEWEST" ? "/search?sort=newest" : "/search"}>Xem thêm →</Link>
          </div>
          {products.length ? (
            <div className="product-grid home-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="catalog-empty home-section-empty">Section này chưa có sản phẩm phù hợp.</div>
          )}
        </section>
      ))}

      {sections.length === 0 && (
        <section className="section foundation-callout"><strong>Home Sections chưa có dữ liệu:</strong> hãy chạy migration V0.4.0 để seed các block Featured / Newest / Best Price / Recommended.</section>
      )}
    </div>
  );
}
