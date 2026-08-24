export default function AdminDashboardPage() {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Auth & Roles hoàn tất • KPI thật sẽ nối dữ liệu ở các version kế tiếp.</p>
        </div>
        <span className="route-chip">Admin authenticated</span>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card"><span>Sản phẩm hiển thị</span><strong>—</strong></div>
        <div className="kpi-card"><span>Đơn mới</span><strong>—</strong></div>
        <div className="kpi-card"><span>Đang xử lý</span><strong>—</strong></div>
        <div className="kpi-card"><span>Hoàn tất</span><strong>—</strong></div>
      </section>

      <section className="panel">
        <h2>Trạng thái nền tảng</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Module</th><th>Version</th><th>Trạng thái</th></tr></thead>
          <tbody>
            <tr><td>Admin Auth + server guard</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Schema nền Supabase</td><td>V0.1.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Customer Auth + Roles</td><td>V0.2.0</td><td><span className="status-dot">Ready</span></td></tr>
            <tr><td>Catalog CRUD</td><td>V0.3.0</td><td>Planned</td></tr>
            <tr><td>Direct Checkout</td><td>V0.5.0</td><td>Planned</td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
