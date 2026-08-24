import Link from "next/link";
import { redirect } from "next/navigation";
import { registerCustomer } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/user";

const errors: Record<string, string> = {
  missing_fields: "Vui lòng nhập họ tên, email và mật khẩu.",
  weak_password: "Mật khẩu phải có ít nhất 8 ký tự.",
  password_mismatch: "Hai lần nhập mật khẩu chưa khớp.",
  email_exists: "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng Quên mật khẩu.",
  signup_failed: "Không thể tạo tài khoản. Hãy kiểm tra cấu hình Auth và thử lại.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const current = await getCurrentUser();
  if (current) redirect("/account");

  return (
    <div className="container-app customer-auth-wrap">
      <section className="auth-card customer-auth-card">
        <span className="route-chip">Tạo tài khoản • Optional</span>
        <h1>Đăng ký khách hàng</h1>
        <p>Tài khoản giúp đồng bộ hồ sơ và lịch sử ở các phiên bản sau. Guest vẫn được phép duyệt sản phẩm và checkout khi tính năng đó được bật.</p>
        {error && <div className="auth-message error">{errors[error] ?? "Không thể đăng ký."}</div>}

        <form action={registerCustomer}>
          <div className="form-field">
            <label htmlFor="full_name">Họ và tên</label>
            <input id="full_name" name="full_name" autoComplete="name" maxLength={120} required />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Số điện thoại <span className="field-optional">(không bắt buộc)</span></label>
            <input id="phone" name="phone" inputMode="tel" autoComplete="tel" maxLength={30} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className="form-field">
            <label htmlFor="confirm_password">Nhập lại mật khẩu</label>
            <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <button className="primary-button" type="submit">Tạo tài khoản</button>
        </form>
        <div className="auth-links-row"><span>Đã có tài khoản?</span><Link href="/login">Đăng nhập</Link></div>
      </section>
    </div>
  );
}
