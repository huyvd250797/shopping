export default function AdminLoading() {
  return (
    <div className="hardening-loading" role="status" aria-live="polite">
      <span className="hardening-spinner" aria-hidden />
      <span>Đang tải dữ liệu quản trị…</span>
    </div>
  );
}
