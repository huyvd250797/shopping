import { getProductionReadiness } from "@/features/system/readiness";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function AdminSystemPage() {
  const readiness = await getProductionReadiness();

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>System Readiness</h1>
          <p>V1.0.0 • Kiểm tra nhanh production URL, Supabase, database migration và runtime trước/sau deploy.</p>
        </div>
        <span className="route-chip">{readiness.ready ? "Production Ready" : "Needs Attention"}</span>
      </div>

      <section className="kpi-grid">
        <div className="kpi-card"><span>App version</span><strong>V{siteConfig.version}</strong></div>
        <div className="kpi-card"><span>Readiness</span><strong>{readiness.ready ? "PASS" : "CHECK"}</strong></div>
        <div className="kpi-card"><span>DB marker</span><strong>{readiness.releaseMarker ? `V${readiness.releaseMarker}` : "—"}</strong></div>
        <div className="kpi-card"><span>Health endpoint</span><strong>/api/health</strong></div>
      </section>

      <section className="panel">
        <h2>Production checks</h2>
        <table className="admin-table-placeholder">
          <thead><tr><th>Hạng mục</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead>
          <tbody>
            {readiness.checks.map((check) => (
              <tr key={check.key}>
                <td>{check.label}</td>
                <td>{check.ok ? <span className="status-dot">PASS</span> : <strong>CHECK</strong>}</td>
                <td>{check.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Runbook trước khi mở bán</h2>
        <p>Chạy migration 010, cấu hình production URL, chạy `npm run qa:production`, tạo backup database và smoke test checkout/order/affiliate. Chi tiết nằm trong `PRODUCTION_RUNBOOK.md` và `PRODUCTION_QA_CHECKLIST.md`.</p>
      </section>
    </>
  );
}
