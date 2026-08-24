import Link from "next/link";

export function PlaceholderPage({ title, route, targetVersion, description }: { title: string; route: string; targetVersion: string; description: string }) {
  return (
    <div className="container-app placeholder-page">
      <div className="placeholder-box">
        <span className="route-chip">{route}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <p><strong>Dự kiến hoàn thiện:</strong> {targetVersion}</p>
        <Link className="section-note" href="/">← Về trang chủ</Link>
      </div>
    </div>
  );
}
