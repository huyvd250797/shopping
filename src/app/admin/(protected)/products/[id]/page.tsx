/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { getAdminCategories, getAdminProductById } from "@/features/catalog/admin-queries";
import { deleteProductImage, setThumbnailImage, updateProduct } from "../../catalog-actions";

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
  product_update_failed: "Không thể cập nhật sản phẩm.",
  image_missing: "Không tìm thấy ảnh sản phẩm.",
  image_storage_delete_failed: "Không thể xóa file trong Supabase Storage.",
  image_delete_failed: "Không thể xóa ảnh khỏi gallery.",
  thumbnail_update_failed: "Không thể đổi ảnh đại diện.",
};
const messages: Record<string, string> = {
  product_created: "Đã tạo sản phẩm. Bạn có thể upload ảnh ngay bên dưới.",
  product_updated: "Đã cập nhật sản phẩm.",
  image_deleted: "Đã xóa ảnh.",
  thumbnail_updated: "Đã đặt ảnh đại diện mới.",
};

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; message?: string }> }) {
  const [{ id }, qs] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getAdminProductById(id), getAdminCategories()]);
  if (!product) notFound();

  return (
    <>
      <div className="admin-page-head">
        <div><h1>Sửa sản phẩm</h1><p>{product.name}</p></div>
        <div className="admin-head-actions"><Link className="admin-small-button" href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">Xem public ↗</Link><Link className="admin-small-button subtle" href="/admin/products">← Danh sách</Link></div>
      </div>

      {qs.error && <div className="auth-message error catalog-admin-message">{errors[qs.error] ?? "Có lỗi xảy ra."}</div>}
      {qs.message && <div className="auth-message success catalog-admin-message">{messages[qs.message] ?? qs.message}</div>}

      {product.deleted_at && <div className="catalog-warning admin-deleted-warning">Sản phẩm đang ở trạng thái xóa mềm. Khôi phục từ danh sách sản phẩm trước khi publish lại.</div>}

      <ProductForm action={updateProduct} categories={categories} product={product} submitLabel="Lưu thay đổi" />

      <section className="admin-form-card product-gallery-admin">
        <div className="admin-form-section-head"><div><h2>Gallery ảnh</h2><p>Upload tối đa 6 ảnh/lần, mỗi ảnh tối đa 5MB. JPG, PNG, WEBP hoặc GIF.</p></div></div>
        <ProductImageUploader productId={product.id} productName={product.name} hasThumbnail={Boolean(product.thumbnail_url)} />

        {product.product_images?.length ? (
          <div className="admin-gallery-grid">
            {product.product_images.map((image) => (
              <article className="admin-gallery-item" key={image.id}>
                <img src={image.image_url} alt={image.alt_text || product.name} />
                <div className="admin-gallery-actions">
                  {product.thumbnail_url === image.image_url ? <span className="thumbnail-current">Ảnh đại diện</span> : (
                    <form action={setThumbnailImage}><input type="hidden" name="product_id" value={product.id} /><input type="hidden" name="image_id" value={image.id} /><button className="admin-small-button" type="submit">Đặt đại diện</button></form>
                  )}
                  <form action={deleteProductImage}><input type="hidden" name="product_id" value={product.id} /><input type="hidden" name="image_id" value={image.id} /><button className="admin-small-button danger" type="submit">Xóa</button></form>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="catalog-empty-admin">Chưa có ảnh gallery. Có thể dùng thumbnail URL hoặc upload ảnh ở trên.</div>}
      </section>
    </>
  );
}
