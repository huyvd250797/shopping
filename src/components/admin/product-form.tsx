import Link from "next/link";
import type { CatalogProduct, Category, ProductStatus, PurchaseMode } from "@/types/catalog";

export type ProductFormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  action: ProductFormAction;
  categories: Category[];
  product?: CatalogProduct | null;
  submitLabel: string;
};

const modes: Array<{ value: PurchaseMode; label: string; help: string }> = [
  { value: "DIRECT", label: "DIRECT", help: "Đặt hàng nội bộ qua Direct Checkout." },
  { value: "AFFILIATE", label: "AFFILIATE", help: "Nút mua mở liên kết đối tác." },
  { value: "HYBRID", label: "HYBRID", help: "Cho phép cả đặt trực tiếp và link affiliate." },
];

const statuses: Array<{ value: ProductStatus; label: string }> = [
  { value: "draft", label: "Bản nháp" },
  { value: "active", label: "Đang hiển thị" },
  { value: "archived", label: "Lưu trữ" },
];

function numberDefault(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

export function ProductForm({ action, categories, product, submitLabel }: Props) {
  return (
    <form action={action} className="catalog-admin-form">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="admin-form-card">
        <div className="admin-form-section-head">
          <div><h2>Thông tin sản phẩm</h2><p>Tên, mã, giá và nội dung hiển thị ngoài cửa hàng.</p></div>
        </div>
        <div className="admin-form-grid two-cols">
          <div className="form-field admin-span-2">
            <label htmlFor="name">Tên sản phẩm *</label>
            <input id="name" name="name" defaultValue={product?.name || ""} maxLength={180} required />
          </div>
          <div className="form-field">
            <label htmlFor="sku">SKU / Mã sản phẩm</label>
            <input id="sku" name="sku" defaultValue={product?.sku || ""} maxLength={80} placeholder="VD: MS-0001" />
          </div>
          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={product?.slug || ""} maxLength={120} placeholder="Để trống để tự tạo từ tên" />
          </div>
          <div className="form-field">
            <label htmlFor="category_id">Danh mục</label>
            <select id="category_id" name="category_id" defaultValue={product?.category_id || ""}>
              <option value="">— Chưa phân loại —</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="badge">Badge</label>
            <input id="badge" name="badge" defaultValue={product?.badge || ""} maxLength={40} placeholder="Mới / Hot / Deal tốt" />
          </div>
          <div className="form-field">
            <label htmlFor="price">Giá bán (VND)</label>
            <input id="price" name="price" type="number" min="0" step="1000" defaultValue={numberDefault(product?.price)} />
          </div>
          <div className="form-field">
            <label htmlFor="compare_at_price">Giá gạch (VND)</label>
            <input id="compare_at_price" name="compare_at_price" type="number" min="0" step="1000" defaultValue={numberDefault(product?.compare_at_price)} />
          </div>
          <div className="form-field admin-span-2">
            <label htmlFor="short_description">Mô tả ngắn</label>
            <textarea id="short_description" name="short_description" defaultValue={product?.short_description || ""} maxLength={500} rows={3} />
          </div>
          <div className="form-field admin-span-2">
            <label htmlFor="description">Mô tả chi tiết</label>
            <textarea id="description" name="description" defaultValue={product?.description || ""} maxLength={12000} rows={8} />
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-head">
          <div><h2>Cách mua & CTA</h2><p>Điều khiển hành vi nút mua cho từng sản phẩm.</p></div>
        </div>
        <div className="admin-form-grid two-cols">
          <div className="form-field">
            <label htmlFor="purchase_mode">Purchase Mode *</label>
            <select id="purchase_mode" name="purchase_mode" defaultValue={product?.purchase_mode || "DIRECT"} required>
              {modes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label} — {mode.help}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="affiliate_url">Affiliate URL</label>
            <input id="affiliate_url" name="affiliate_url" type="url" defaultValue={product?.affiliate_url || ""} maxLength={2000} placeholder="https://..." />
            <small>Chỉ chấp nhận http/https. Public CTA sẽ đi qua /go/[slug] để validate và ghi nhận click trước khi chuyển sang đối tác.</small>
          </div>
          <div className="form-field">
            <label htmlFor="button_label">Label nút chính</label>
            <input id="button_label" name="button_label" defaultValue={product?.button_label || ""} maxLength={60} placeholder="Mua ngay / Đặt hàng / Xem ưu đãi" />
          </div>
          <div className="form-field">
            <label htmlFor="secondary_button_label">Label nút phụ (Hybrid)</label>
            <input id="secondary_button_label" name="secondary_button_label" defaultValue={product?.secondary_button_label || ""} maxLength={60} placeholder="Xem ưu đãi" />
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-section-head">
          <div><h2>Hiển thị & ảnh đại diện</h2><p>Ảnh upload được quản lý riêng sau khi tạo sản phẩm.</p></div>
        </div>
        <div className="admin-form-grid two-cols">
          <div className="form-field">
            <label htmlFor="status">Trạng thái</label>
            <select id="status" name="status" defaultValue={product?.status || "draft"}>
              {statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="sort_order">Thứ tự</label>
            <input id="sort_order" name="sort_order" type="number" defaultValue={product?.sort_order ?? 0} />
          </div>
          <div className="form-field admin-span-2">
            <label htmlFor="thumbnail_url">Ảnh đại diện bằng URL (tùy chọn)</label>
            <input id="thumbnail_url" name="thumbnail_url" type="url" defaultValue={product?.thumbnail_url || ""} maxLength={2000} placeholder="https://..." />
            <small>Nếu upload ảnh trong phần Gallery và chưa có thumbnail, ảnh đầu tiên sẽ tự được chọn làm ảnh đại diện.</small>
          </div>
          <label className="checkbox-field"><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> <span>Sản phẩm nổi bật</span></label>
          <label className="checkbox-field"><input type="checkbox" name="track_stock" defaultChecked={product?.track_stock ?? false} /> <span>Theo dõi tồn kho</span></label>
          <div className="form-field">
            <label htmlFor="stock_qty">Số lượng tồn</label>
            <input id="stock_qty" name="stock_qty" type="number" min="0" defaultValue={numberDefault(product?.stock_qty)} />
          </div>
          <div className="form-field">
            <label htmlFor="tags">Tags</label>
            <input id="tags" name="tags" defaultValue={product?.tags?.join(", ") || ""} maxLength={500} placeholder="gia dụng, sale, hot" />
          </div>
        </div>
      </section>

      <div className="admin-form-actions">
        <Link className="secondary-link-button" href="/admin/products">Hủy / Quay lại</Link>
        <button className="admin-primary-button" type="submit">{submitLabel}</button>
      </div>
    </form>
  );
}
