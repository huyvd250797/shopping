import Link from "next/link";
import { getCatalogKpis } from "@/features/catalog/admin-queries";
import { getOrderAdminKpis } from "@/features/orders/admin";
import { getAdminBanners } from "@/features/home/admin-queries";
import { getAffiliateKpis } from "@/features/affiliate/admin";

export default async function AdminDashboardPage() {
  const [kpi, banners, orders, affiliate] = await Promise.all([getCatalogKpis(), getAdminBanners(), getOrderAdminKpis(), getAffiliateKpis(30)]);
  return (
    <>
      <div className="admin-page-head">
        <div><h1>Dashboard</h1><p>V1.0.0 Production Ready: production health, structured logging, backup runbook, release marker và final QA để vận hành thật.</p></div>
        <div className="admin-head-actions"><Link className="admin-primary-button" href="/admin/orders">Xử lý đơn</Link><Link className="admin-small-button" href="/admin/system">System Readiness</Link></div>
      </div>
      <section className="kpi-grid">
        <div className="kpi-card"><span>Sản phẩm hiển thị</span><strong>{kpi.active}</strong></div>
        <div className="kpi-card"><span>Đơn mới</span><strong>{orders.newCount}</strong></div>
        <div className="kpi-card"><span>Đang xử lý</span><strong>{orders.activeCount}</strong></div>
        <div className="kpi-card"><span>Click Affiliate 30 ngày</span><strong>{affiliate.totalClicks}</strong></div>
      </section>
      <section className="panel">
        <h2>Trạng thái roadmap V1.0</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Module</th><th>Version</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr><td>Foundation + Admin Auth</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Auth + Roles</td><td>V0.2.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Catalog & CMS Core</td><td>V0.3.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Home & Search UX</td><td>V0.4.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Direct Checkout</td><td>V0.5.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Order Admin</td><td>V0.6.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Affiliate & Hybrid</td><td>V0.7.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Account</td><td>V0.8.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Hardening</td><td>V0.9.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Production Ready</td><td>V1.0.0</td><td><span className="status-dot">Ready</span></td></tr>
          </tbody>
        </table>
      </section>
      <section className="panel"><h2>Vận hành nhanh</h2><p>{orders.cancelledCount} đơn đã hủy • {banners.length} banner đã cấu hình. Affiliate có {affiliate.clicksToday} click hôm nay và {affiliate.uniqueVisitors} visitor trong 30 ngày. Trước khi mở bán thật, vào System Readiness, chạy migration 010, `npm run qa:production`, tạo backup và smoke test production.</p></section>
    </>
  );
}
