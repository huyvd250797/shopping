/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { isHttpUrl } from "@/lib/catalog/format";
import type { Banner } from "@/types/home";

function safeBannerHref(value: string | null) {
  if (!value) return "/search";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return isHttpUrl(value) ? value : "/search";
}

function BannerCard({ banner, main = false }: { banner: Banner; main?: boolean }) {
  const href = safeBannerHref(banner.link_url);
  return (
    <Link className={`home-banner ${main ? "home-banner-main" : "home-banner-mini"}`} href={href}>
      {banner.image_url && <img className="home-banner-image" src={banner.image_url} alt={banner.title || "Banner cửa hàng"} />}
      <span className="home-banner-overlay" />
      <span className="home-banner-content">
        <small>{main ? "Khám phá hôm nay" : "MyShop"}</small>
        {banner.title && <strong>{banner.title}</strong>}
        {banner.subtitle && <span>{banner.subtitle}</span>}
        {banner.button_label && <em>{banner.button_label} →</em>}
      </span>
    </Link>
  );
}

export function HomeBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) {
    return (
      <section className="home-banner-fallback">
        <div><span className="hero-kicker">MyShop Marketplace</span><h1>Tìm món phù hợp, mua theo cách bạn muốn.</h1><p>Affiliate hoặc đặt trực tiếp tùy từng sản phẩm — giao diện nhanh, rõ và tối ưu trên mobile.</p></div>
        <Link className="hero-button" href="/search">Khám phá sản phẩm</Link>
      </section>
    );
  }

  const [main, ...rest] = banners;
  return (
    <section className="home-banner-grid" aria-label="Khuyến mãi nổi bật">
      <BannerCard banner={main} main />
      <div className="home-banner-side">
        {rest.slice(0, 2).map((banner) => <BannerCard key={banner.id} banner={banner} />)}
        {rest.length < 2 && (
          <Link className="home-banner home-banner-mini home-banner-search" href="/search?sort=newest">
            <span className="home-banner-content"><small>Khám phá</small><strong>{rest.length === 0 ? "Sản phẩm mới trong MyShop" : "Xem thêm lựa chọn"}</strong><em>Xem ngay →</em></span>
          </Link>
        )}
        {rest.length === 0 && (
          <Link className="home-banner home-banner-mini home-banner-search home-banner-search-alt" href="/search">
            <span className="home-banner-content"><small>Tìm nhanh</small><strong>Tìm theo nhu cầu của bạn</strong><em>Tìm kiếm →</em></span>
          </Link>
        )}
      </div>
    </section>
  );
}
