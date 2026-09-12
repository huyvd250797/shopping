import { ShopFooter } from "@/components/shop/shop-footer";
import { ShopHeader } from "@/components/shop/shop-header";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="shop-shell">
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <ShopHeader />
      <main className="shop-main" id="main-content" tabIndex={-1}>{children}</main>
      <ShopFooter />
    </div>
  );
}
