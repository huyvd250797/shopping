"use client";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="container-app hardening-error-page" role="alert">
      <section className="hardening-error-card">
        <span className="route-chip">V1.0.0 • Production Recovery</span>
        <h1>Đã xảy ra lỗi tạm thời</h1>
        <p>Yêu cầu chưa hoàn tất. Bạn có thể thử lại an toàn; Direct Checkout vẫn dùng mã request để tránh tạo đơn trùng.</p>
        <button type="button" onClick={() => reset()}>Thử lại</button>
      </section>
    </main>
  );
}
