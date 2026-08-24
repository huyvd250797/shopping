import { ShopFooter } from "@/components/shop/shop-footer";
import { ShopHeader } from "@/components/shop/shop-header";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="shop-shell">
      <ShopHeader />
      <main className="shop-main">{children}</main>
      <ShopFooter />
    </div>
  );
}
