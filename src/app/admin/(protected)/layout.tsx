import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VersionBadge } from "@/components/version-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await requireAdmin();

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main-content">Bỏ qua điều hướng Admin</a>
      <AdminSidebar />
      <div className="admin-content">
        <header className="admin-topbar">
          <div>
            <strong>Admin Console</strong>
            <div className="admin-user">{profile.full_name || user.email || "Administrator"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <VersionBadge />
            <form action={logoutAdmin}>
              <button className="logout-button" type="submit">Đăng xuất</button>
            </form>
          </div>
        </header>
        <main className="admin-main" id="admin-main-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
