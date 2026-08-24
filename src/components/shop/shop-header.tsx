import Link from "next/link";
import { siteConfig } from "@/config/site";

export function ShopHeader() {
  return (
    <>
      <div className="top-strip">
        <div className="container-app top-strip-inner">
          <span>Marketplace hybrid • Affiliate + Đặt hàng trực tiếp</span>
          <span>Foundation preview</span>
        </div>
      </div>
      <header className="shop-header">
        <div className="container-app header-row">
          <Link href="/" className="brand" aria-label={`${siteConfig.name} trang chủ`}>
            <span className="brand-mark">M</span>
            <span>{siteConfig.name}</span>
          </Link>

          <form className="search-box" action="/search" role="search">
            <input name="q" placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" />
            <button className="search-button" type="submit">Tìm</button>
          </form>

          <nav className="header-actions" aria-label="Điều hướng chính">
            <Link className="header-link desktop-only" href="/account/orders">Đơn hàng</Link>
            <Link className="header-link" href="/login">Đăng nhập</Link>
          </nav>
        </div>
      </header>
    </>
  );
}
