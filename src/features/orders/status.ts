export const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Mới",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
  ARCHIVED: "Lưu trữ",
};

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["ARCHIVED"],
  CANCELLED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export function orderStatusLabel(value: string) {
  return isOrderStatus(value) ? ORDER_STATUS_LABELS[value] : value;
}

export function orderStatusClass(value: string) {
  return isOrderStatus(value) ? `status-${value.toLowerCase()}` : "status-unknown";
}
