/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitDirectOrder } from "@/app/(shop)/checkout/[product]/actions";
import { formatVnd } from "@/lib/catalog/format";
import type { CheckoutFormValues, RecentOrder } from "@/types/checkout";

const DRAFT_KEY = "myshop_checkout_draft_v1";
const HISTORY_KEY = "myshop_recent_orders_v1";

function newRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16 >> Number(c) / 4)).toString(16),
  );
}

function readDraft(productId: string) {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { productId?: string; values?: Partial<CheckoutFormValues> };
    return parsed.productId === productId ? parsed.values ?? null : null;
  } catch {
    return null;
  }
}

function saveRecentOrder(order: RecentOrder) {
  try {
    const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as RecentOrder[];
    const next = [order, ...current.filter((item) => item.orderCode !== order.orderCode)].slice(0, 20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Local history is convenience only; database remains source of truth.
  }
}

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    thumbnailUrl: string | null;
    price: number;
    compareAtPrice: number | null;
    trackStock: boolean;
    stockQty: number | null;
  };
  defaults: {
    customerName: string;
    phone: string;
    email: string;
  };
};

export function CheckoutForm({ product, defaults }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"form" | "review">("form");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [values, setValues] = useState<CheckoutFormValues>({
    quantity: 1,
    customer_name: defaults.customerName,
    phone: defaults.phone,
    email: defaults.email,
    province: "",
    district: "",
    ward: "",
    address_line: "",
    note: "",
    checkout_request_id: "",
  });

  useEffect(() => {
    const draft = readDraft(product.id);
    setValues((current) => ({
      ...current,
      ...draft,
      customer_name: draft?.customer_name || current.customer_name,
      phone: draft?.phone || current.phone,
      email: draft?.email || current.email,
      checkout_request_id: draft?.checkout_request_id || newRequestId(),
    }));
    setHydrated(true);
  }, [product.id]);

  useEffect(() => {
    if (!hydrated || !values.checkout_request_id) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ productId: product.id, values }));
    } catch {
      // Draft persistence is optional UX only.
    }
  }, [hydrated, product.id, values]);

  const subtotal = useMemo(() => product.price * Math.max(1, values.quantity || 1), [product.price, values.quantity]);
  const maxQty = product.trackStock ? Math.max(0, product.stockQty ?? 0) : 99;

  function update<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validateClient() {
    const phone = values.phone.replace(/\D/g, "");
    if (values.customer_name.trim().length < 2) return "Vui lòng nhập họ tên người nhận.";
    if (phone.length < 8 || phone.length > 15) return "Số điện thoại chưa hợp lệ.";
    if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email.trim())) return "Email chưa hợp lệ.";
    if (!values.province.trim()) return "Vui lòng nhập Tỉnh/Thành phố.";
    if (!values.district.trim()) return "Vui lòng nhập Quận/Huyện.";
    if (!values.ward.trim()) return "Vui lòng nhập Phường/Xã.";
    if (values.address_line.trim().length < 3) return "Vui lòng nhập địa chỉ giao hàng chi tiết.";
    if (!Number.isInteger(values.quantity) || values.quantity < 1 || values.quantity > Math.max(1, maxQty)) return "Số lượng không hợp lệ hoặc vượt tồn kho.";
    return "";
  }

  function goReview() {
    const message = validateClient();
    if (message) {
      setError(message);
      return;
    }
    setStep("review");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    const message = validateClient();
    if (message) {
      setError(message);
      setStep("form");
      return;
    }

    startTransition(async () => {
      const result = await submitDirectOrder(product.id, values);
      if (!result.ok) {
        setError(result.message);
        return;
      }

      saveRecentOrder({
        orderCode: result.order.orderCode,
        accessToken: result.order.accessToken,
        createdAt: result.order.createdAt,
        productName: product.name,
        total: result.order.total,
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* browser storage may be unavailable */ }
      router.push(`/order/success/${encodeURIComponent(result.order.orderCode)}?token=${encodeURIComponent(result.order.accessToken)}`);
      router.refresh();
    });
  }

  if (maxQty === 0) {
    return <div className="checkout-unavailable">Sản phẩm đang hết hàng nên chưa thể đặt trực tiếp.</div>;
  }

  return (
    <div className="checkout-layout">
      <aside className="checkout-product-card">
        <div className="checkout-product-image">
          {product.thumbnailUrl ? <img src={product.thumbnailUrl} alt={product.name} /> : <span>🛍️</span>}
        </div>
        <div className="checkout-product-info">
          <span className="route-chip">Direct Checkout</span>
          <h2>{product.name}</h2>
          {product.sku && <p>Mã sản phẩm: <strong>{product.sku}</strong></p>}
          <div className="checkout-price-row"><strong>{formatVnd(product.price)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price ? <span>{formatVnd(product.compareAtPrice)}</span> : null}</div>
          {product.trackStock && <small>Còn {product.stockQty ?? 0} sản phẩm</small>}
        </div>
      </aside>

      <section className="checkout-card">
        <div className="checkout-steps" aria-label="Tiến trình đặt hàng">
          <span className={step === "form" ? "active" : "done"}>1. Thông tin</span>
          <span className={step === "review" ? "active" : ""}>2. Xác nhận</span>
          <span>3. Hoàn tất</span>
        </div>

        {step === "form" ? (
          <>
            <div className="checkout-card-head"><h1>Thông tin nhận hàng</h1><p>Không cần đăng nhập. Thông tin này dùng để xử lý đơn và giao hàng.</p></div>
            <div className="checkout-form-grid">
              <label className="checkout-field checkout-field-full"><span>Họ tên người nhận *</span><input value={values.customer_name} maxLength={120} autoComplete="name" onChange={(e) => update("customer_name", e.target.value)} /></label>
              <label className="checkout-field"><span>Số điện thoại *</span><input value={values.phone} maxLength={30} inputMode="tel" autoComplete="tel" onChange={(e) => update("phone", e.target.value)} /></label>
              <label className="checkout-field"><span>Email <em>không bắt buộc</em></span><input value={values.email} maxLength={180} inputMode="email" autoComplete="email" onChange={(e) => update("email", e.target.value)} /></label>
              <label className="checkout-field"><span>Tỉnh/Thành phố *</span><input value={values.province} maxLength={120} autoComplete="address-level1" onChange={(e) => update("province", e.target.value)} placeholder="Ví dụ: TP. Hồ Chí Minh" /></label>
              <label className="checkout-field"><span>Quận/Huyện *</span><input value={values.district} maxLength={120} autoComplete="address-level2" onChange={(e) => update("district", e.target.value)} /></label>
              <label className="checkout-field"><span>Phường/Xã *</span><input value={values.ward} maxLength={120} autoComplete="address-level3" onChange={(e) => update("ward", e.target.value)} /></label>
              <label className="checkout-field"><span>Số lượng *</span><input type="number" min={1} max={Math.max(1, maxQty)} value={values.quantity} inputMode="numeric" onChange={(e) => update("quantity", Math.max(1, Number(e.target.value || 1)))} /></label>
              <label className="checkout-field checkout-field-full"><span>Địa chỉ chi tiết *</span><input value={values.address_line} maxLength={250} autoComplete="street-address" onChange={(e) => update("address_line", e.target.value)} placeholder="Số nhà, tên đường, tòa nhà..." /></label>
              <label className="checkout-field checkout-field-full"><span>Ghi chú <em>không bắt buộc</em></span><textarea value={values.note} maxLength={500} rows={4} onChange={(e) => update("note", e.target.value)} placeholder="Ví dụ: giao giờ hành chính" /></label>
            </div>
            {error && <div className="checkout-error">{error}</div>}
            <div className="checkout-total-box"><span>Tạm tính</span><strong>{formatVnd(subtotal)}</strong><small>Phí vận chuyển: {formatVnd(0)} • Tổng cuối cùng được server tính lại khi tạo đơn.</small></div>
            <button className="checkout-primary-button" type="button" onClick={goReview}>Tiếp tục xác nhận</button>
          </>
        ) : (
          <>
            <div className="checkout-card-head"><h1>Xác nhận đơn hàng</h1><p>Kiểm tra lại toàn bộ thông tin trước khi gửi đơn.</p></div>
            <div className="checkout-review-grid">
              <div><span>Sản phẩm</span><strong>{product.name} × {values.quantity}</strong></div>
              <div><span>Người nhận</span><strong>{values.customer_name}</strong></div>
              <div><span>Số điện thoại</span><strong>{values.phone}</strong></div>
              {values.email && <div><span>Email</span><strong>{values.email}</strong></div>}
              <div className="checkout-review-full"><span>Địa chỉ</span><strong>{values.address_line}, {values.ward}, {values.district}, {values.province}</strong></div>
              {values.note && <div className="checkout-review-full"><span>Ghi chú</span><strong>{values.note}</strong></div>}
            </div>
            <div className="checkout-total-box checkout-total-final"><span>Tổng dự kiến</span><strong>{formatVnd(subtotal)}</strong><small>Hệ thống sẽ đọc lại giá hiện tại từ database trước khi tạo đơn.</small></div>
            {error && <div className="checkout-error">{error}</div>}
            <div className="checkout-review-actions">
              <button className="checkout-secondary-button" type="button" disabled={isPending} onClick={() => setStep("form")}>← Sửa thông tin</button>
              <button className="checkout-primary-button checkout-submit-fit" type="button" disabled={isPending || !hydrated} onClick={submit}>{isPending ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}</button>
            </div>
            <p className="checkout-idempotency-note">Bạn có thể bấm lại nếu mạng chậm; cùng một phiên checkout sẽ không tạo đơn trùng.</p>
          </>
        )}
      </section>
    </div>
  );
}
