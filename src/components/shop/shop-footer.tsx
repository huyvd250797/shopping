import Link from "next/link";
import { VersionBadge } from "@/components/version-badge";
import { siteConfig } from "@/config/site";

export function ShopFooter() {
  return (
    <footer className="shop-footer">
      <div className="container-app footer-inner">
        <span>© 2026 {siteConfig.name} • Hybrid commerce</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/admin/login">Admin</Link>
          <VersionBadge />
        </div>
      </div>
    </footer>
  );
}
