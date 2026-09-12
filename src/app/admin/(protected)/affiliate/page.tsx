import Link from "next/link";
import { getAffiliateKpis, getAffiliateProductStats, getRecentAffiliateClicks } from "@/features/affiliate/admin";
import { purchaseModeLabel } from "@/lib/catalog/format";

const DAY_OPTIONS = [7, 30, 90] as const;

function dateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value));
}

function hostOf(value: string) {
  try { return new URL(value).host; } catch { return "—"; }
}

export default async function AdminAffiliatePage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const params = await searchParams;
  const requested = Number(params.days ?? 30);
  const days = DAY_OPTIONS.includes(requested as (typeof DAY_OPTIONS)[number]) ? requested : 30;
  const [kpis, stats, recent] = await Promise.all([
    getAffiliateKpis(days),
    getAffiliateProductStats(days),
    getRecentAffiliateClicks(30),
  ]);

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Affiliate Analytics</h1><p>Theo dõi outbound click của sản phẩm AFFILIATE/HYBRID. Click không được tính là đơn hàng.</p></div>
        <div className="admin-head-actions">
          {DAY_OPTIONS.map((option) => <Link key={option} className={`admin-small-button ${days === option ? "" : "subtle"}`} href={`/admin/affiliate?days=${option}`}>{option} ngày</Link>)}
        </div>
      </div>

      <section className="kpi-grid affiliate-kpi-grid">
        <div className="kpi-card"><span>Click hôm nay</span><strong>{kpis.clicksToday}</strong></div>
        <div className="kpi-card"><span>Click {days} ngày</span><strong>{kpis.totalClicks}</strong></div>
        <div className="kpi-card"><span>Visitor {days} ngày</span><strong>{kpis.uniqueVisitors}</strong></div>
        <div className="kpi-card"><span>Affiliate đang chạy</span><strong>{kpis.activeAffiliateProducts}</strong></div>
      </section>

      <section className="panel catalog-table-panel">
        <div className="admin-form-section-head"><div><h2>Hiệu quả theo sản phẩm</h2><p>Sắp xếp theo số click trong {days} ngày gần nhất.</p></div></div>
        {stats.length === 0 ? <div className="catalog-empty-admin">Chưa có sản phẩm Affiliate/Hybrid.</div> : (
          <div className="admin-table-scroll"><table className="catalog-admin-table affiliate-admin-table">
            <thead><tr><th>Sản phẩm</th><th>Mode</th><th>Trạng thái</th><th>Clicks</th><th>Visitors</th><th>Click gần nhất</th><th></th></tr></thead>
            <tbody>{stats.map((item) => <tr key={item.productId}>
              <td><strong>{item.productName}</strong><small className="affiliate-table-sub">/{item.slug}</small></td>
              <td><span className={`mode-pill mode-${item.purchaseMode.toLowerCase()}`}>{purchaseModeLabel(item.purchaseMode)}</span></td>
              <td><span className={`admin-status-pill status-${item.productStatus}`}>{item.productStatus}</span></td>
              <td><strong>{item.clicks}</strong></td><td>{item.uniqueVisitors}</td><td>{dateTime(item.lastClickedAt)}</td>
              <td><Link className="admin-small-button" href={`/admin/products/${item.productId}`}>Sửa SP</Link></td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>

      <section className="panel catalog-table-panel">
        <div className="admin-form-section-head"><div><h2>Click gần nhất</h2><p>Session ẩn danh chỉ dùng để chống đếm trùng nhẹ; không lưu IP.</p></div></div>
        {recent.length === 0 ? <div className="catalog-empty-admin">Chưa có affiliate click.</div> : (
          <div className="admin-table-scroll"><table className="catalog-admin-table affiliate-recent-table">
            <thead><tr><th>Thời gian</th><th>Sản phẩm</th><th>Loại khách</th><th>Nguồn</th><th>Đối tác</th></tr></thead>
            <tbody>{recent.map((click) => <tr key={click.id}>
              <td>{dateTime(click.createdAt)}</td>
              <td><Link className="admin-table-link" href={`/product/${click.productSlug}`} target="_blank" rel="noopener noreferrer">{click.productName}</Link></td>
              <td>{click.userId ? "Customer" : "Guest"}</td><td>{click.sourcePath || "—"}</td><td>{hostOf(click.targetUrl)}</td>
            </tr>)}</tbody>
          </table></div>
        )}
      </section>
    </>
  );
}
