import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { VersionBadge } from "@/components/version-badge";
import { requireAdmin } from "@/lib/auth/admin";
import { logoutAdmin } from "./actions";

export default async function AdminProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await requireAdmin();

  return (
    <div className="admin-shell">
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
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
