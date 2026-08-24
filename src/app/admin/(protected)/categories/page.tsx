import { createCategory, deleteCategory, updateCategory } from "../catalog-actions";
import { getAdminCategories } from "@/features/catalog/admin-queries";

const errors: Record<string, string> = {
  invalid_category: "Tên hoặc slug danh mục không hợp lệ.",
  invalid_icon_url: "Icon URL phải bắt đầu bằng http:// hoặc https://.",
  category_slug_exists: "Slug danh mục đã tồn tại.",
  category_create_failed: "Không thể tạo danh mục.",
  category_update_failed: "Không thể cập nhật danh mục.",
  category_delete_failed: "Không thể xóa danh mục.",
  category_in_use: "Danh mục đang có sản phẩm. Hãy chuyển sản phẩm sang danh mục khác hoặc tắt danh mục thay vì xóa.",
};
const messages: Record<string, string> = {
  category_created: "Đã tạo danh mục.",
  category_updated: "Đã cập nhật danh mục.",
  category_deleted: "Đã xóa danh mục.",
};

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  const categories = await getAdminCategories();

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Danh mục</h1><p>Tạo, chỉnh sửa, sắp xếp và bật/tắt danh mục hiển thị ngoài cửa hàng.</p></div>
        <span className="route-chip">{categories.length} danh mục</span>
      </div>

      {params.error && <div className="auth-message error catalog-admin-message">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      {params.message && <div className="auth-message success catalog-admin-message">{messages[params.message] ?? params.message}</div>}

      <section className="admin-form-card category-create-card">
        <div className="admin-form-section-head"><div><h2>Thêm danh mục</h2><p>Slug có thể để trống để hệ thống tự tạo từ tên.</p></div></div>
        <form action={createCategory} className="category-create-form">
          <div className="form-field"><label>Tên *</label><input name="name" required maxLength={120} placeholder="Ví dụ: Mẹ & bé" /></div>
          <div className="form-field"><label>Slug</label><input name="slug" maxLength={120} placeholder="me-va-be" /></div>
          <div className="form-field"><label>Icon URL</label><input name="icon_url" type="url" maxLength={2000} placeholder="https://..." /></div>
          <div className="form-field"><label>Thứ tự</label><input name="sort_order" type="number" defaultValue="0" /></div>
          <label className="checkbox-field category-active"><input name="is_active" type="checkbox" defaultChecked /> <span>Hiển thị</span></label>
          <button className="admin-primary-button" type="submit">Thêm danh mục</button>
        </form>
      </section>

      <section className="panel catalog-table-panel">
        <div className="admin-form-section-head"><div><h2>Danh sách danh mục</h2><p>Sửa trực tiếp từng dòng rồi bấm Lưu.</p></div></div>
        {categories.length === 0 ? (
          <div className="catalog-empty-admin">Chưa có danh mục. Hãy thêm danh mục đầu tiên ở phía trên.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="catalog-admin-table category-admin-table">
              <thead><tr><th>Tên</th><th>Slug</th><th>Icon URL</th><th>Thứ tự</th><th>Hiển thị</th><th>Thao tác</th></tr></thead>
              <tbody>
                {categories.map((category) => {
                  const formId = `category-${category.id}`;
                  return (
                    <tr key={category.id}>
                      <td><input form={formId} name="name" defaultValue={category.name} required maxLength={120} /></td>
                      <td><input form={formId} name="slug" defaultValue={category.slug} maxLength={120} /></td>
                      <td><input form={formId} name="icon_url" defaultValue={category.icon_url || ""} type="url" maxLength={2000} placeholder="https://..." /></td>
                      <td><input className="small-number-input" form={formId} name="sort_order" type="number" defaultValue={category.sort_order} /></td>
                      <td><input form={formId} name="is_active" type="checkbox" defaultChecked={category.is_active} aria-label={`Hiển thị ${category.name}`} /></td>
                      <td className="table-actions-cell">
                        <form id={formId} action={updateCategory}><input type="hidden" name="id" value={category.id} /><button className="admin-small-button" type="submit">Lưu</button></form>
                        <form action={deleteCategory}><input type="hidden" name="id" value={category.id} /><button className="admin-small-button danger" type="submit">Xóa</button></form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
