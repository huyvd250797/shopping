import Link from "next/link";
import { siteConfig } from "@/config/site";

const items = [
  ["/admin", "▦", "Dashboard"],
  ["/admin/products", "▣", "Sản phẩm"],
  ["/admin/categories", "◫", "Danh mục"],
  ["/admin/orders", "≣", "Đơn hàng"],
  ["/admin/affiliate", "↗", "Affiliate"],
  ["/admin/banners", "▭", "Banner"],
  ["/admin/settings", "⚙", "Cấu hình"],
  ["/admin/audit", "◎", "Audit Log"],
] as const;

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand">
        <span className="brand-mark">M</span>
        <span>{siteConfig.name} Admin</span>
      </Link>
      <nav className="admin-nav" aria-label="Admin navigation">
        {items.map(([href, icon, label]) => (
          <Link href={href} key={href} title={label}>
            {icon} <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
