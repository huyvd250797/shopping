import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/lib/auth/user";
import { logoutCustomer } from "@/features/auth/actions";

export async function ShopHeader() {
  const current = await getCurrentUser();

  return (
    <>
      <div className="top-strip">
        <div className="container-app top-strip-inner">
          <span>Marketplace hybrid • Affiliate + Đặt hàng trực tiếp</span>
          <span>{siteConfig.versionLabel}</span>
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
            {current ? (
              <>
                <Link className="header-link" href="/account">{current.profile?.full_name || "Tài khoản"}</Link>
                <form action={logoutCustomer} className="header-logout-form"><button className="header-link header-button" type="submit">Đăng xuất</button></form>
              </>
            ) : (
              <Link className="header-link" href="/login">Đăng nhập</Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
