import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { logoutCustomer } from "@/features/auth/actions";
import { updateMyProfile } from "./actions";

const errors: Record<string, string> = {
  full_name_required: "Họ tên không được để trống.",
  invalid_profile: "Thông tin hồ sơ vượt quá độ dài cho phép.",
  profile_update_failed: "Không thể cập nhật hồ sơ. Hãy chắc chắn migration V0.2.0 đã được chạy.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

const messages: Record<string, string> = {
  registered: "Tài khoản đã được tạo và đăng nhập thành công.",
  profile_updated: "Đã lưu hồ sơ.",
  password_updated: "Mật khẩu đã được cập nhật.",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const { user, profile } = await requireUser("/account");

  return (
    <div className="container-app account-page">
      <div className="account-head">
        <div>
          <span className="route-chip">Authenticated</span>
          <h1>Tài khoản của tôi</h1>
          <p>V0.2.0 hoàn thiện hồ sơ cơ bản và session. Địa chỉ giao hàng + lịch sử đơn đầy đủ sẽ được mở rộng đúng roadmap.</p>
        </div>
        <form action={logoutCustomer}><button className="secondary-button" type="submit">Đăng xuất</button></form>
      </div>

      {params.error && <div className="auth-message error">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      {params.message && <div className="auth-message success">{messages[params.message] ?? params.message}</div>}

      <div className="account-grid">
        <section className="account-card">
          <h2>Hồ sơ</h2>
          <form action={updateMyProfile}>
            <div className="form-field">
              <label htmlFor="full_name">Họ và tên</label>
              <input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} maxLength={120} required />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Số điện thoại</label>
              <input id="phone" name="phone" inputMode="tel" autoComplete="tel" defaultValue={profile?.phone || ""} maxLength={30} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input value={user.email || profile?.email || ""} disabled />
            </div>
            <button className="primary-button button-fit" type="submit">Lưu hồ sơ</button>
          </form>
        </section>

        <aside className="account-card account-summary">
          <h2>Trạng thái tài khoản</h2>
          <dl>
            <div><dt>Role</dt><dd>{profile?.role || "customer"}</dd></div>
            <div><dt>Email</dt><dd>{user.email || "—"}</dd></div>
            <div><dt>User ID</dt><dd className="mono-text">{user.id}</dd></div>
          </dl>
          <Link className="secondary-link-button" href="/account/orders">Đơn hàng của tôi</Link>
        </aside>
      </div>
    </div>
  );
}
