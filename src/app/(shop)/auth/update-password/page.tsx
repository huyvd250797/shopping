import { updatePassword } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/user";

const errors: Record<string, string> = {
  weak_password: "Mật khẩu mới phải có ít nhất 8 ký tự.",
  password_mismatch: "Hai lần nhập mật khẩu chưa khớp.",
  update_failed: "Không thể đổi mật khẩu. Hãy yêu cầu liên kết mới.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  await requireUser("/auth/update-password");

  return (
    <div className="container-app customer-auth-wrap">
      <section className="auth-card customer-auth-card">
        <span className="route-chip">Recovery Session</span>
        <h1>Tạo mật khẩu mới</h1>
        <p>Phiên xác minh từ email đã hợp lệ. Hãy đặt mật khẩu mới cho tài khoản.</p>
        {error && <div className="auth-message error">{errors[error] ?? "Không thể cập nhật mật khẩu."}</div>}
        <form action={updatePassword}>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu mới</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <div className="form-field">
            <label htmlFor="confirm_password">Nhập lại mật khẩu</label>
            <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
          <button className="primary-button" type="submit">Cập nhật mật khẩu</button>
        </form>
      </section>
    </div>
  );
}
