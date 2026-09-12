import { createClient } from "@/lib/supabase/server";
import { updateCheckoutPolicyAction } from "./actions";

async function getCheckoutPolicy() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "require_login_for_checkout").maybeSingle();
  return data?.value === true;
}

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const params = await searchParams;
  const requireLogin = await getCheckoutPolicy();

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Cấu hình website</h1><p>V0.9.0 • Chính sách Guest Checkout cùng các guard vận hành đã được harden trước Release Candidate.</p></div>
        <span className="route-chip">Customer Account</span>
      </div>

      {params.message === "checkout_setting_saved" && <div className="admin-settings-message success">Đã lưu chính sách checkout.</div>}
      {params.error && <div className="admin-settings-message error">Không thể lưu cấu hình. Vui lòng thử lại.</div>}

      <section className="panel admin-settings-section">
        <div className="admin-settings-section-head">
          <div><h2>Guest Checkout</h2><p>Chọn khách có bắt buộc đăng nhập trước khi tạo Direct Order hay không.</p></div>
          <span className={`admin-setting-state ${requireLogin ? "locked" : "open"}`}>{requireLogin ? "Yêu cầu đăng nhập" : "Cho phép Guest"}</span>
        </div>

        <form action={updateCheckoutPolicyAction} className="admin-settings-choice-list">
          <label className="admin-settings-choice">
            <input type="radio" name="require_login_for_checkout" value="false" defaultChecked={!requireLogin} />
            <span><strong>Cho phép Guest Checkout</strong><small>Khách có thể đặt trực tiếp không cần tài khoản. Nếu đăng nhập, đơn vẫn gắn vào tài khoản tự động.</small></span>
          </label>
          <label className="admin-settings-choice">
            <input type="radio" name="require_login_for_checkout" value="true" defaultChecked={requireLogin} />
            <span><strong>Bắt buộc đăng nhập</strong><small>Khách chưa đăng nhập sẽ được chuyển đến trang Login rồi quay lại checkout sau khi xác thực.</small></span>
          </label>
          <div className="admin-settings-actions"><button className="admin-primary-button" type="submit">Lưu cấu hình</button></div>
        </form>
      </section>

      <section className="panel admin-settings-section muted">
        <h2>Nguyên tắc đồng bộ đơn V0.8.0</h2>
        <p>Đơn tạo khi customer đang đăng nhập được lưu `user_id` ngay lúc checkout. Đơn guest chỉ được gắn vào tài khoản khi trình duyệt còn giữ đúng `order_code + access_token`; không tự dò theo số điện thoại/email.</p>
      </section>
    </>
  );
}
