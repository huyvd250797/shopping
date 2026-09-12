"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <main style={{ maxWidth: 680, margin: "64px auto", padding: 24, fontFamily: "Arial, sans-serif" }} role="alert">
          <h1>MyShop chưa thể hiển thị trang này</h1>
          <p>Kết nối hoặc quá trình render có thể đang gián đoạn. Hãy thử lại.</p>
          <button type="button" onClick={() => reset()} style={{ minHeight: 44, padding: "0 18px", cursor: "pointer" }}>Thử lại</button>
        </main>
      </body>
    </html>
  );
}
