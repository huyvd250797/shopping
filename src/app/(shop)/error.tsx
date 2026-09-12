"use client";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-app shop-error-state" role="alert">
      <div className="shop-error-card">
        <h2>Không thể tải dữ liệu cửa hàng</h2>
        <p>Kết nối dữ liệu có thể đang gián đoạn. Bạn có thể thử tải lại mà không cần rời khỏi trang.</p>
        <button type="button" onClick={() => reset()}>Thử lại</button>
      </div>
    </div>
  );
}
