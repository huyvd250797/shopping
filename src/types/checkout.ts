export type CheckoutFormValues = {
  quantity: number;
  customer_name: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  note: string;
  checkout_request_id: string;
};

export type CheckoutOrderResult = {
  orderId: string;
  orderCode: string;
  accessToken: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
};

export type CheckoutSubmitResult =
  | { ok: true; order: CheckoutOrderResult }
  | { ok: false; code: string; message: string };

export type OrderReceiptItem = {
  order_id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  email: string | null;
  province: string;
  district: string;
  ward: string;
  address_line: string;
  note: string | null;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  created_at: string;
  product_name: string;
  sku: string | null;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type RecentOrder = {
  orderCode: string;
  accessToken: string;
  createdAt: string;
  productName: string;
  total: number;
};
