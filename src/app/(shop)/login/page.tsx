import Link from "next/link";
import { redirect } from "next/navigation";
import { loginCustomer } from "@/features/auth/actions";
import { getCurrentUser } from "@/lib/auth/user";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const errors: Record<string, string> = {
  missing_fields: "Vui lòng nhập email và mật khẩu.",
  invalid_credentials: "Email hoặc mật khẩu không đúng, hoặc email chưa được xác nhận.",
  session_required: "Vui lòng đăng nhập để xem trang tài khoản.",
  recovery_session_required: "Liên kết đặt lại mật khẩu đã hết phiên. Hãy gửi lại yêu cầu.",
  auth_callback_failed: "Không thể xác nhận phiên đăng nhập từ email. Hãy thử lại.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

const messages: Record<string, string> = {
  confirm_email: "Đăng ký thành công. Hãy kiểm tra email và bấm liên kết xác nhận trước khi đăng nhập.",
  checkout_login_required: "Cửa hàng đang yêu cầu đăng nhập trước khi đặt hàng. Sau khi đăng nhập bạn sẽ được đưa trở lại checkout.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string; next?: string }> }) {
  const params = await searchParams;
  const current = await getCurrentUser();
  if (current) redirect("/account");

  return (
    <div className="container-app customer-auth-wrap">
      <section className="auth-card customer-auth-card">
        <span className="route-chip">Customer Account • V0.8.0</span>
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để quản lý hồ sơ, địa chỉ mặc định và lịch sử đơn đồng bộ theo tài khoản. Bạn vẫn có thể xem sản phẩm mà không cần đăng nhập.</p>

        {!isSupabaseConfigured() && <div className="auth-message info">Chưa cấu hình Supabase. Hãy hoàn tất `.env.local` và migration trước.</div>}
        {params.error && <div className="auth-message error">{errors[params.error] ?? "Không thể đăng nhập."}</div>}
        {params.message && <div className="auth-message success">{messages[params.message] ?? params.message}</div>}

        <form action={loginCustomer}>
          <input type="hidden" name="next" value={params.next || "/account"} />
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="ban@example.com" required />
          </div>
          <div className="form-field">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Tối thiểu 8 ký tự" required />
          </div>
          <button className="primary-button" type="submit">Đăng nhập</button>
        </form>

        <div className="auth-links-row">
          <Link href="/register">Tạo tài khoản</Link>
          <Link href="/forgot-password">Quên mật khẩu?</Link>
        </div>
      </section>
    </div>
  );
}
