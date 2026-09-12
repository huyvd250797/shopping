"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="panel hardening-admin-error" role="alert">
      <h1>Không thể tải dữ liệu Admin</h1>
      <p>Thao tác chưa được xác nhận là thành công. Hãy thử tải lại dữ liệu trước khi thực hiện lại action quan trọng.</p>
      <button className="admin-primary-button" type="button" onClick={() => reset()}>Tải lại</button>
    </section>
  );
}
