import Link from "next/link";
import { getCatalogKpis } from "@/features/catalog/admin-queries";

export default async function AdminDashboardPage() {
  const kpi = await getCatalogKpis();
  return (
    <>
      <div className="admin-page-head">
        <div><h1>Dashboard</h1><p>V0.3.0 đã nối Catalog/CMS thật vào Supabase.</p></div>
        <Link className="admin-primary-button" href="/admin/products/new">+ Thêm sản phẩm</Link>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card"><span>Sản phẩm hiển thị</span><strong>{kpi.active}</strong></div>
        <div className="kpi-card"><span>Tổng sản phẩm</span><strong>{kpi.total}</strong></div>
        <div className="kpi-card"><span>Danh mục active</span><strong>{kpi.categories}</strong></div>
        <div className="kpi-card"><span>Thiếu thumbnail</span><strong>{kpi.missingImage}</strong></div>
      </section>

      <section className="panel">
        <h2>Trạng thái roadmap</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Module</th><th>Version</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr><td>Admin Auth + server guard</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Auth + Roles</td><td>V0.2.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Catalog CRUD + Public Catalog</td><td>V0.3.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Home & Search UX nâng cao</td><td>V0.4.0</td><td>Next</td></tr>
            <tr><td>Direct Checkout</td><td>V0.5.0</td><td>Planned</td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
