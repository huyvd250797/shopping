import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getPublicCategories } from "@/features/catalog/queries";
import { logoutCustomer } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/user";

export async function ShopHeader() {
  const [current, categories] = await Promise.all([getCurrentUser(), getPublicCategories()]);

  return (
    <>
      <div className="top-strip">
        <div className="container-app top-strip-inner">
          <span>Marketplace hybrid • Affiliate + Đặt hàng trực tiếp</span>
          <span>{siteConfig.versionLabel}</span>
        </div>
      </div>
      <header className="shop-header">
        <div className="container-app header-row header-row-v040">
          <Link href="/" className="brand" aria-label={`${siteConfig.name} trang chủ`}>
            <span className="brand-mark">M</span>
            <span>{siteConfig.name}</span>
          </Link>

          <form className="search-box marketplace-search" action="/search" role="search">
            <span className="search-symbol" aria-hidden>⌕</span>
            <input name="q" placeholder="Tìm sản phẩm trong MyShop..." aria-label="Tìm sản phẩm" />
            <button className="search-button" type="submit">Tìm</button>
          </form>

          <nav className="header-actions" aria-label="Điều hướng chính">
            <Link className="header-link header-action-compact" href="/account/orders"><span aria-hidden>▤</span><span className="header-action-text">Đơn hàng</span></Link>
            {current ? (
              <>
                <Link className="header-link header-action-compact" href="/account"><span aria-hidden>●</span><span className="header-action-text">{current.profile?.full_name || "Tài khoản"}</span></Link>
                <form action={logoutCustomer} className="header-logout-form"><button className="header-link header-button header-action-compact" type="submit"><span aria-hidden>↗</span><span className="header-action-text">Đăng xuất</span></button></form>
              </>
            ) : (
              <Link className="header-link header-action-compact" href="/login"><span aria-hidden>●</span><span className="header-action-text">Đăng nhập</span></Link>
            )}
          </nav>
        </div>
        {categories.length > 0 && (
          <div className="header-category-strip">
            <div className="container-app header-category-scroll">
              <Link href="/search" className="header-category-all">Tất cả</Link>
              {categories.slice(0, 10).map((category) => <Link key={category.id} href={`/category/${category.slug}`}>{category.name}</Link>)}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
