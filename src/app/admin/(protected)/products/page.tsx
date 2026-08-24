/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { formatVnd, purchaseModeLabel } from "@/lib/catalog/format";
import { getAdminCategories, getAdminProducts } from "@/features/catalog/admin-queries";
import { archiveProduct, restoreProduct, setProductStatus } from "../catalog-actions";

const errors: Record<string, string> = {
  product_missing: "Không tìm thấy sản phẩm.",
  product_archive_failed: "Không thể xóa mềm sản phẩm.",
  product_restore_failed: "Không thể khôi phục sản phẩm.",
  status_update_failed: "Không thể cập nhật trạng thái sản phẩm.",
  invalid_status: "Trạng thái không hợp lệ.",
};
const messages: Record<string, string> = {
  product_archived: "Sản phẩm đã được xóa mềm/lưu trữ.",
  product_restored: "Sản phẩm đã được khôi phục về bản nháp.",
  status_updated: "Đã cập nhật trạng thái hiển thị.",
};

function statusLabel(status: string, deleted: boolean) {
  if (deleted) return "Đã xóa mềm";
  if (status === "active") return "Đang hiển thị";
  if (status === "archived") return "Lưu trữ";
  return "Bản nháp";
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; mode?: string; category?: string; error?: string; message?: string }> }) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getAdminProducts({ q: params.q, status: params.status, mode: params.mode, category: params.category }),
    getAdminCategories(),
  ]);

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Sản phẩm</h1><p>CRUD catalog thật trên Supabase • Affiliate / Direct / Hybrid.</p></div>
        <Link className="admin-primary-button" href="/admin/products/new">+ Thêm sản phẩm</Link>
      </div>

      {params.error && <div className="auth-message error catalog-admin-message">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      {params.message && <div className="auth-message success catalog-admin-message">{messages[params.message] ?? params.message}</div>}

      <section className="panel product-filter-panel">
        <form className="admin-filter-bar" action="/admin/products">
          <input name="q" defaultValue={params.q || ""} placeholder="Tìm tên, SKU, slug..." />
          <select name="status" defaultValue={params.status || ""}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select name="mode" defaultValue={params.mode || ""}>
            <option value="">Tất cả kiểu mua</option>
            <option value="DIRECT">DIRECT</option>
            <option value="AFFILIATE">AFFILIATE</option>
            <option value="HYBRID">HYBRID</option>
          </select>
          <select name="category" defaultValue={params.category || ""}>
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <button className="admin-small-button" type="submit">Lọc</button>
          <Link className="admin-small-button subtle" href="/admin/products">Xóa lọc</Link>
        </form>
      </section>

      <section className="panel catalog-table-panel">
        <div className="admin-form-section-head">
          <div><h2>Danh sách sản phẩm</h2><p>{products.length} kết quả. Sản phẩm active và chưa xóa mềm mới xuất hiện ngoài public.</p></div>
        </div>
        {products.length === 0 ? (
          <div className="catalog-empty-admin">Không có sản phẩm phù hợp. Hãy thêm sản phẩm mới hoặc đổi bộ lọc.</div>
        ) : (
          <div className="admin-table-scroll">
            <table className="catalog-admin-table product-admin-table">
              <thead><tr><th>Sản phẩm</th><th>Giá</th><th>Danh mục</th><th>Mode</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>
                {products.map((product) => {
                  const image = product.thumbnail_url || product.product_images?.[0]?.image_url;
                  const deleted = Boolean(product.deleted_at);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-product-cell">
                          <div className="admin-product-thumb">
                            {image ? <img src={image} alt="" /> : <span>🛍️</span>}
                          </div>
                          <div><strong>{product.name}</strong><small>{product.sku || product.slug}</small></div>
                        </div>
                      </td>
                      <td><strong className="admin-price">{formatVnd(product.price)}</strong>{product.compare_at_price && <small className="admin-compare">{formatVnd(product.compare_at_price)}</small>}</td>
                      <td>{product.category?.name || "—"}</td>
                      <td><span className={`mode-pill mode-${product.purchase_mode.toLowerCase()}`}>{purchaseModeLabel(product.purchase_mode)}</span></td>
                      <td><span className={`admin-status-pill status-${deleted ? "deleted" : product.status}`}>{statusLabel(product.status, deleted)}</span></td>
                      <td>
                        <div className="table-actions-cell product-actions">
                          <Link className="admin-small-button" href={`/admin/products/${product.id}`}>Sửa</Link>
                          {!deleted && (
                            <form action={setProductStatus}>
                              <input type="hidden" name="id" value={product.id} />
                              <input type="hidden" name="status" value={product.status === "active" ? "draft" : "active"} />
                              <button className="admin-small-button subtle" type="submit">{product.status === "active" ? "Ẩn" : "Hiện"}</button>
                            </form>
                          )}
                          {deleted ? (
                            <form action={restoreProduct}><input type="hidden" name="id" value={product.id} /><button className="admin-small-button" type="submit">Khôi phục</button></form>
                          ) : (
                            <form action={archiveProduct}><input type="hidden" name="id" value={product.id} /><button className="admin-small-button danger" type="submit">Xóa mềm</button></form>
                          )}
                        </div>
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
