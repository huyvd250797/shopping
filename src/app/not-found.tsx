import Link from "next/link";
export default function NotFound() {
  return <main className="auth-page"><section className="auth-card"><h1>404</h1><p>Không tìm thấy trang bạn yêu cầu.</p><Link className="section-note" href="/">Về trang chủ →</Link></section></main>;
}
