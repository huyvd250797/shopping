import Link from "next/link";
import { getCatalogKpis } from "@/features/catalog/admin-queries";
import { getAdminBanners, getAdminHomeSections } from "@/features/home/admin-queries";

export default async function AdminDashboardPage() {
  const [kpi, banners, sections] = await Promise.all([getCatalogKpis(), getAdminBanners(), getAdminHomeSections()]);
  return (
    <>
      <div className="admin-page-head">
        <div><h1>Dashboard</h1><p>V0.4.0 đã hoàn thiện Home CMS và Search UX trên nền Catalog thật.</p></div>
        <div className="admin-head-actions"><Link className="admin-small-button" href="/admin/banners">Home CMS</Link><Link className="admin-primary-button" href="/admin/products/new">+ Thêm sản phẩm</Link></div>
      </div>
      <section className="kpi-grid">
        <div className="kpi-card"><span>Sản phẩm hiển thị</span><strong>{kpi.active}</strong></div>
        <div className="kpi-card"><span>Danh mục active</span><strong>{kpi.categories}</strong></div>
        <div className="kpi-card"><span>Banner</span><strong>{banners.length}</strong></div>
        <div className="kpi-card"><span>Home sections</span><strong>{sections.length}</strong></div>
      </section>
      <section className="panel">
        <h2>Trạng thái roadmap</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Module</th><th>Version</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr><td>Foundation + Admin Auth</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Auth + Roles</td><td>V0.2.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Catalog & CMS Core</td><td>V0.3.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Home & Search UX</td><td>V0.4.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Direct Checkout</td><td>V0.5.0</td><td>Next</td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
