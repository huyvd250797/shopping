import Link from "next/link";
import { loginAdmin } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { VersionBadge } from "@/components/version-badge";
import { siteConfig } from "@/config/site";

const errors: Record<string, string> = {
  missing_fields: "Vui lòng nhập email và mật khẩu.",
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  admin_required: "Tài khoản này không có quyền Admin.",
  session_required: "Vui lòng đăng nhập Admin để tiếp tục.",
  supabase_not_configured: "Chưa cấu hình Supabase. Hãy tạo .env.local theo README trước.",
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();
  const message = error ? errors[error] ?? "Không thể đăng nhập." : null;

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="brand">
          <span className="brand-mark">M</span>
          <span>{siteConfig.name} Admin</span>
        </Link>
        <h1>Đăng nhập quản trị</h1>
        <p>V0.2.0 tiếp tục dùng Supabase Auth và kiểm tra role ở server trước khi cho phép vào Admin Console.</p>

        {!configured && <div className="auth-message info">Supabase chưa cấu hình. Public UI vẫn chạy, nhưng Admin Auth cần hoàn tất bước .env + migration + seed.</div>}
        {message && <div className="auth-message error">{message}</div>}

        <form action={loginAdmin}>
          <div className="form-field">
            <label htmlFor="email">Email Admin</label>
            <input id="email" name="email" type="email" autoComplete="username" placeholder="admin@example.com" required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••••" required />
          </div>
          <button type="submit" className="primary-button">Đăng nhập</button>
        </form>

        <div className="auth-footer">
          <Link href="/">← Trang bán hàng</Link>
          <VersionBadge />
        </div>
      </section>
    </main>
  );
}
