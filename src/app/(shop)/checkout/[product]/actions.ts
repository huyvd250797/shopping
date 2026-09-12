"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CheckoutFormValues, CheckoutSubmitResult } from "@/types/checkout";
import { logger } from "@/lib/observability/logger";

function fail(code: string, message: string): CheckoutSubmitResult {
  return { ok: false, code, message };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validate(input: CheckoutFormValues): CheckoutSubmitResult | null {
  const name = input.customer_name.trim();
  const phone = input.phone.replace(/\D/g, "");
  const email = input.email.trim();

  if (!isUuid(input.checkout_request_id)) return fail("invalid_request", "Phiên checkout không hợp lệ. Hãy tải lại trang và thử lại.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) return fail("invalid_quantity", "Số lượng phải từ 1 đến 99.");
  if (name.length < 2 || name.length > 120) return fail("invalid_name", "Họ tên phải từ 2 đến 120 ký tự.");
  if (phone.length < 8 || phone.length > 15) return fail("invalid_phone", "Số điện thoại chưa hợp lệ.");
  if (email && (email.length > 180 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) return fail("invalid_email", "Email chưa hợp lệ.");
  if (input.province.trim().length < 2 || input.province.trim().length > 120) return fail("invalid_province", "Vui lòng nhập Tỉnh/Thành phố.");
  if (input.district.trim().length < 1 || input.district.trim().length > 120) return fail("invalid_district", "Vui lòng nhập Quận/Huyện.");
  if (input.ward.trim().length < 1 || input.ward.trim().length > 120) return fail("invalid_ward", "Vui lòng nhập Phường/Xã.");
  if (input.address_line.trim().length < 3 || input.address_line.trim().length > 250) return fail("invalid_address", "Địa chỉ chi tiết phải từ 3 đến 250 ký tự.");
  if (input.note.trim().length > 500) return fail("invalid_note", "Ghi chú tối đa 500 ký tự.");
  return null;
}

function mapRpcError(message: string) {
  if (message.includes("LOGIN_REQUIRED")) return "Cửa hàng hiện yêu cầu đăng nhập trước khi đặt hàng.";
  if (message.includes("PRODUCT_NOT_AVAILABLE")) return "Sản phẩm hiện không còn khả dụng.";
  if (message.includes("PRODUCT_NOT_DIRECT")) return "Sản phẩm này không hỗ trợ đặt hàng trực tiếp.";
  if (message.includes("PRODUCT_PRICE_INVALID")) return "Giá sản phẩm chưa được cấu hình hợp lệ.";
  if (message.includes("INSUFFICIENT_STOCK")) return "Số lượng bạn chọn vượt quá tồn kho hiện tại.";
  if (message.includes("INVALID_PHONE")) return "Số điện thoại chưa hợp lệ.";
  if (message.includes("INVALID_EMAIL")) return "Email chưa hợp lệ.";
  return "Không thể tạo đơn lúc này. Vui lòng kiểm tra thông tin và thử lại.";
}

export async function submitDirectOrder(productId: string, input: CheckoutFormValues): Promise<CheckoutSubmitResult> {
  if (!isSupabaseConfigured()) return fail("supabase_not_configured", "Supabase chưa được cấu hình trên môi trường production.");
  if (!isUuid(productId)) return fail("invalid_product", "Sản phẩm không hợp lệ.");

  const validation = validate(input);
  if (validation) return validation;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_direct_order", {
    p_product_id: productId,
    p_quantity: input.quantity,
    p_customer_name: input.customer_name.trim(),
    p_phone: input.phone.trim(),
    p_email: input.email.trim() || null,
    p_province: input.province.trim(),
    p_district: input.district.trim(),
    p_ward: input.ward.trim(),
    p_address_line: input.address_line.trim(),
    p_note: input.note.trim() || null,
    p_checkout_request_id: input.checkout_request_id,
  });

  if (error || !Array.isArray(data) || !data[0]) {
    logger.error("checkout_create_order_failed", {
      productId,
      checkoutRequestId: input.checkout_request_id,
      rpcErrorCode: error?.code || "missing_order_result",
    });
    return fail("create_order_failed", mapRpcError(error?.message ?? ""));
  }

  const row = data[0];
  logger.info("checkout_order_created", { productId, orderId: String(row.order_id), orderCode: String(row.order_code) });
  return {
    ok: true,
    order: {
      orderId: String(row.order_id),
      orderCode: String(row.order_code),
      accessToken: String(row.access_token),
      subtotal: Number(row.subtotal ?? 0),
      shippingFee: Number(row.shipping_fee ?? 0),
      total: Number(row.total ?? 0),
      createdAt: String(row.created_at),
    },
  };
}
