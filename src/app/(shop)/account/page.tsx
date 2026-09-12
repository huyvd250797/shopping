import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { logoutCustomer } from "@/features/auth/actions";
import { getMyOrderSummary } from "@/features/account/queries";
import { updateMyProfile } from "./actions";

const errors: Record<string, string> = {
  full_name_required: "Họ tên không được để trống.",
  invalid_profile: "Thông tin hồ sơ vượt quá độ dài cho phép.",
  profile_update_failed: "Không thể cập nhật hồ sơ. Hãy chạy migration V0.8.0 (008) rồi thử lại.",
  supabase_not_configured: "Supabase chưa được cấu hình.",
};

const messages: Record<string, string> = {
  registered: "Tài khoản đã được tạo và đăng nhập thành công.",
  profile_updated: "Đã lưu hồ sơ và địa chỉ mặc định.",
  password_updated: "Mật khẩu đã được cập nhật.",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const { user, profile } = await requireUser("/account");
  const summary = await getMyOrderSummary(user.id);

  return (
    <div className="container-app account-page">
      <div className="account-head">
        <div>
          <span className="route-chip">V0.8.0 • Customer Account</span>
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý hồ sơ, địa chỉ giao hàng mặc định và lịch sử đơn đã đồng bộ theo tài khoản.</p>
        </div>
        <form action={logoutCustomer}><button className="secondary-button" type="submit">Đăng xuất</button></form>
      </div>

      {params.error && <div className="auth-message error">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      {params.message && <div className="auth-message success">{messages[params.message] ?? params.message}</div>}

      <section className="customer-kpi-grid" aria-label="Tổng quan đơn hàng">
        <div className="customer-kpi-card"><span>Tổng đơn</span><strong>{summary.total}</strong></div>
        <div className="customer-kpi-card"><span>Đang xử lý</span><strong>{summary.active}</strong></div>
        <div className="customer-kpi-card"><span>Hoàn tất</span><strong>{summary.completed}</strong></div>
      </section>

      <div className="account-grid account-grid-v080">
        <section className="account-card">
          <div className="account-card-head">
            <div><h2>Hồ sơ & địa chỉ mặc định</h2><p>Thông tin này sẽ tự điền vào Direct Checkout khi bạn đăng nhập.</p></div>
          </div>
          <form action={updateMyProfile} className="customer-profile-form">
            <div className="form-field form-field-full">
              <label htmlFor="full_name">Họ và tên *</label>
              <input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} maxLength={120} required autoComplete="name" />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Số điện thoại</label>
              <input id="phone" name="phone" inputMode="tel" autoComplete="tel" defaultValue={profile?.phone || ""} maxLength={30} />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input value={user.email || profile?.email || ""} disabled />
            </div>
            <div className="form-field">
              <label htmlFor="province">Tỉnh/Thành phố</label>
              <input id="province" name="province" defaultValue={profile?.province || ""} maxLength={120} autoComplete="address-level1" />
            </div>
            <div className="form-field">
              <label htmlFor="district">Quận/Huyện</label>
              <input id="district" name="district" defaultValue={profile?.district || ""} maxLength={120} autoComplete="address-level2" />
            </div>
            <div className="form-field">
              <label htmlFor="ward">Phường/Xã</label>
              <input id="ward" name="ward" defaultValue={profile?.ward || ""} maxLength={120} autoComplete="address-level3" />
            </div>
            <div className="form-field form-field-full">
              <label htmlFor="address_line">Địa chỉ chi tiết</label>
              <input id="address_line" name="address_line" defaultValue={profile?.address_line || ""} maxLength={250} autoComplete="street-address" placeholder="Số nhà, tên đường, tòa nhà..." />
            </div>
            <button className="primary-button button-fit" type="submit">Lưu hồ sơ</button>
          </form>
        </section>

        <aside className="account-card account-summary account-summary-v080">
          <h2>Tài khoản</h2>
          <dl>
            <div><dt>Role</dt><dd>{profile?.role || "customer"}</dd></div>
            <div><dt>Email</dt><dd>{user.email || "—"}</dd></div>
            <div><dt>Đồng bộ đơn</dt><dd>Database theo User ID</dd></div>
          </dl>
          <div className="account-quick-links">
            <Link className="primary-link-button" href="/account/orders">Xem đơn hàng của tôi</Link>
            <Link className="secondary-link-button" href="/orders">Lịch sử trên thiết bị</Link>
          </div>
          <p className="account-security-note">Đơn guest chỉ được gắn vào tài khoản khi trình duyệt còn giữ token truy cập của chính đơn đó; hệ thống không tự liên kết chỉ bằng số điện thoại.</p>
        </aside>
      </div>
    </div>
  );
}
