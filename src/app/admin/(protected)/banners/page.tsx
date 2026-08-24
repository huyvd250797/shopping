/* eslint-disable @next/next/no-img-element */
import { BannerImageUploader } from "@/components/admin/banner-image-uploader";
import { getAdminBanners, getAdminHomeSections } from "@/features/home/admin-queries";
import { createBanner, createHomeSection, deleteBanner, deleteHomeSection, updateBanner, updateHomeSection } from "../home-actions";

const errors: Record<string, string> = {
  invalid_banner_link: "Link banner phải là URL http/https hoặc đường dẫn nội bộ bắt đầu bằng /.",
  invalid_banner_dates: "Thời gian kết thúc phải sau thời gian bắt đầu.",
  banner_create_failed: "Không thể tạo banner.",
  banner_update_failed: "Không thể cập nhật banner.",
  banner_delete_failed: "Không thể xóa banner.",
  banner_missing: "Không tìm thấy banner.",
  invalid_home_section: "Thông tin section trang chủ không hợp lệ.",
  home_section_key_exists: "Mã section đã tồn tại.",
  home_section_create_failed: "Không thể tạo section trang chủ.",
  home_section_update_failed: "Không thể cập nhật section trang chủ.",
  home_section_delete_failed: "Không thể xóa section trang chủ.",
};
const messages: Record<string, string> = {
  banner_created: "Đã tạo banner. Bạn có thể upload ảnh ngay bên dưới.",
  banner_updated: "Đã cập nhật banner.",
  banner_deleted: "Đã xóa banner.",
  home_section_created: "Đã tạo section trang chủ.",
  home_section_updated: "Đã cập nhật section trang chủ.",
  home_section_deleted: "Đã xóa section trang chủ.",
};

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const vietnam = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vietnam.toISOString().slice(0, 16);
}

export default async function AdminBannersPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const [banners, sections] = await Promise.all([getAdminBanners(), getAdminHomeSections()]);

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Home & Banner</h1><p>Quản trị banner và các block sản phẩm trên trang chủ.</p></div>
        <span className="route-chip">V0.4.0</span>
      </div>

      {params.error && <div className="auth-message error catalog-admin-message">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      {params.message && <div className="auth-message success catalog-admin-message">{messages[params.message] ?? params.message}</div>}

      <section className="admin-form-card">
        <div className="admin-form-section-head"><div><h2>Thêm banner</h2><p>Tạo nội dung trước, sau đó upload ảnh trực tiếp lên Supabase Storage.</p></div></div>
        <form action={createBanner} className="home-admin-grid banner-create-grid">
          <div className="form-field"><label>Tiêu đề</label><input name="title" maxLength={160} placeholder="Ưu đãi nổi bật" /></div>
          <div className="form-field"><label>Phụ đề</label><input name="subtitle" maxLength={260} placeholder="Mô tả ngắn cho banner" /></div>
          <div className="form-field"><label>Link</label><input name="link_url" maxLength={2000} placeholder="/search hoặc https://..." /></div>
          <div className="form-field"><label>Label nút</label><input name="button_label" maxLength={60} placeholder="Xem ngay" /></div>
          <div className="form-field"><label>Bắt đầu</label><input name="starts_at" type="datetime-local" /></div>
          <div className="form-field"><label>Kết thúc</label><input name="ends_at" type="datetime-local" /></div>
          <div className="form-field"><label>Thứ tự</label><input name="sort_order" type="number" defaultValue="0" /></div>
          <label className="checkbox-field"><input name="is_active" type="checkbox" /> <span>Hiển thị ngay</span></label>
          <button className="admin-primary-button" type="submit">+ Tạo banner</button>
        </form>
      </section>

      <section className="panel home-admin-panel">
        <div className="admin-form-section-head"><div><h2>Danh sách banner</h2><p>Banner hết thời gian sẽ tự ngừng xuất hiện ngoài Home.</p></div></div>
        {banners.length === 0 ? <div className="catalog-empty-admin">Chưa có banner. Tạo banner đầu tiên ở phía trên.</div> : (
          <div className="banner-admin-list">
            {banners.map((banner) => {
              const formId = `banner-${banner.id}`;
              return (
                <article className="banner-admin-card" key={banner.id}>
                  <div className="banner-admin-preview">
                    {banner.image_url ? <img src={banner.image_url} alt="" /> : <div className="banner-admin-no-image">Chưa có ảnh</div>}
                    <BannerImageUploader bannerId={banner.id} currentStoragePath={banner.storage_path} />
                  </div>
                  <div className="banner-admin-fields">
                    <div className="home-admin-grid">
                      <div className="form-field"><label>Tiêu đề</label><input form={formId} name="title" defaultValue={banner.title || ""} maxLength={160} /></div>
                      <div className="form-field"><label>Phụ đề</label><input form={formId} name="subtitle" defaultValue={banner.subtitle || ""} maxLength={260} /></div>
                      <div className="form-field"><label>Link</label><input form={formId} name="link_url" defaultValue={banner.link_url || ""} maxLength={2000} /></div>
                      <div className="form-field"><label>Label nút</label><input form={formId} name="button_label" defaultValue={banner.button_label || ""} maxLength={60} /></div>
                      <div className="form-field"><label>Bắt đầu</label><input form={formId} name="starts_at" type="datetime-local" defaultValue={toLocalDateTime(banner.starts_at)} /></div>
                      <div className="form-field"><label>Kết thúc</label><input form={formId} name="ends_at" type="datetime-local" defaultValue={toLocalDateTime(banner.ends_at)} /></div>
                      <div className="form-field"><label>Thứ tự</label><input form={formId} name="sort_order" type="number" defaultValue={banner.sort_order} /></div>
                      <label className="checkbox-field"><input form={formId} name="is_active" type="checkbox" defaultChecked={banner.is_active} /> <span>Hiển thị</span></label>
                    </div>
                    <div className="banner-admin-actions">
                      <form id={formId} action={updateBanner}><input type="hidden" name="id" value={banner.id} /><button className="admin-small-button" type="submit">Lưu banner</button></form>
                      <form action={deleteBanner}><input type="hidden" name="id" value={banner.id} /><button className="admin-small-button danger" type="submit">Xóa</button></form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-head"><div><h2>Section sản phẩm trang chủ</h2><p>Bật/tắt, đổi tiêu đề, logic lấy sản phẩm, số lượng và thứ tự hiển thị.</p></div></div>
        <form action={createHomeSection} className="home-admin-grid section-create-grid">
          <div className="form-field"><label>Tiêu đề *</label><input name="title" required maxLength={140} placeholder="Sản phẩm nổi bật" /></div>
          <div className="form-field"><label>Mã section</label><input name="section_key" maxLength={120} placeholder="featured" /></div>
          <div className="form-field"><label>Loại</label><select name="section_type" defaultValue="FEATURED"><option value="FEATURED">Featured</option><option value="NEWEST">Mới nhất</option><option value="BEST_PRICE">Giá tốt</option><option value="RECOMMENDED">Đề xuất</option></select></div>
          <div className="form-field"><label>Số SP</label><input name="item_limit" type="number" min="1" max="24" defaultValue="10" /></div>
          <div className="form-field"><label>Thứ tự</label><input name="sort_order" type="number" defaultValue="50" /></div>
          <label className="checkbox-field"><input name="is_active" type="checkbox" defaultChecked /> <span>Hiển thị</span></label>
          <div className="form-field home-section-subtitle"><label>Phụ đề</label><input name="subtitle" maxLength={220} placeholder="Mô tả ngắn" /></div>
          <button className="admin-primary-button" type="submit">+ Thêm section</button>
        </form>
      </section>

      <section className="panel catalog-table-panel">
        <div className="admin-form-section-head"><div><h2>Cấu hình section</h2><p>Các section mặc định được seed khi chạy migration V0.4.0.</p></div></div>
        {sections.length === 0 ? <div className="catalog-empty-admin">Chưa có section. Hãy chạy migration V0.4.0 hoặc thêm mới.</div> : (
          <div className="admin-table-scroll">
            <table className="catalog-admin-table home-section-table">
              <thead><tr><th>Tiêu đề</th><th>Phụ đề</th><th>Loại</th><th>Số SP</th><th>Thứ tự</th><th>Hiện</th><th>Thao tác</th></tr></thead>
              <tbody>{sections.map((section) => {
                const formId = `section-${section.id}`;
                return <tr key={section.id}>
                  <td><input form={formId} name="title" defaultValue={section.title} required maxLength={140} /></td>
                  <td><input form={formId} name="subtitle" defaultValue={section.subtitle || ""} maxLength={220} /></td>
                  <td><select form={formId} name="section_type" defaultValue={section.section_type}><option value="FEATURED">Featured</option><option value="NEWEST">Mới nhất</option><option value="BEST_PRICE">Giá tốt</option><option value="RECOMMENDED">Đề xuất</option></select></td>
                  <td><input className="small-number-input" form={formId} name="item_limit" type="number" min="1" max="24" defaultValue={section.item_limit} /></td>
                  <td><input className="small-number-input" form={formId} name="sort_order" type="number" defaultValue={section.sort_order} /></td>
                  <td><input form={formId} name="is_active" type="checkbox" defaultChecked={section.is_active} /></td>
                  <td className="table-actions-cell">
                    <form id={formId} action={updateHomeSection}><input type="hidden" name="id" value={section.id} /><button className="admin-small-button" type="submit">Lưu</button></form>
                    <form action={deleteHomeSection}><input type="hidden" name="id" value={section.id} /><button className="admin-small-button danger" type="submit">Xóa</button></form>
                  </td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
