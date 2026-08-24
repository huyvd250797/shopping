import Link from "next/link";
import { requestPasswordReset } from "@/features/auth/actions";

const errors: Record<string, string> = {
  missing_email: "Vui lòng nhập email.",
  reset_failed: "Không thể gửi email đặt lại mật khẩu. Hãy thử lại.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const { error, message } = await searchParams;
  return (
    <div className="container-app customer-auth-wrap">
      <section className="auth-card customer-auth-card">
        <span className="route-chip">Password Recovery</span>
        <h1>Quên mật khẩu</h1>
        <p>Nhập email đã đăng ký. Hệ thống sẽ gửi liên kết để tạo mật khẩu mới.</p>
        {error && <div className="auth-message error">{errors[error] ?? "Có lỗi xảy ra."}</div>}
        {message === "reset_sent" && <div className="auth-message success">Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư.</div>}
        <form action={requestPasswordReset}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <button className="primary-button" type="submit">Gửi liên kết đặt lại</button>
        </form>
        <div className="auth-links-row"><Link href="/login">← Quay lại đăng nhập</Link></div>
      </section>
    </div>
  );
}
