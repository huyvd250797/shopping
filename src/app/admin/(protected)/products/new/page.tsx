import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories } from "@/features/catalog/admin-queries";
import { createProduct } from "../../catalog-actions";

const errors: Record<string, string> = {
  invalid_product: "Tên hoặc slug sản phẩm không hợp lệ.",
  invalid_purchase_mode: "Purchase Mode không hợp lệ.",
  invalid_status: "Trạng thái không hợp lệ.",
  invalid_url: "Affiliate URL hoặc thumbnail URL không hợp lệ.",
  affiliate_url_required: "Sản phẩm AFFILIATE bắt buộc có Affiliate URL.",
  price_required: "Sản phẩm DIRECT/HYBRID cần có giá bán.",
  invalid_price: "Giá bán không hợp lệ.",
  invalid_compare_price: "Giá gạch không hợp lệ.",
  invalid_stock: "Số lượng tồn không hợp lệ.",
  product_slug_or_sku_exists: "Slug hoặc SKU đã tồn tại.",
  product_create_failed: "Không thể tạo sản phẩm. Hãy kiểm tra migration V0.3.0.",
};

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const categories = await getAdminCategories();
  return (
    <>
      <div className="admin-page-head"><div><h1>Thêm sản phẩm</h1><p>Tạo sản phẩm mới. Sau khi lưu, bạn có thể upload gallery ảnh.</p></div><span className="route-chip">V0.3.0 Catalog</span></div>
      {params.error && <div className="auth-message error catalog-admin-message">{errors[params.error] ?? "Có lỗi xảy ra."}</div>}
      <ProductForm action={createProduct} categories={categories} submitLabel="Tạo sản phẩm" />
    </>
  );
}
