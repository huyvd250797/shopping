import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { getPublicCategories, searchPublicProducts, type CatalogSort } from "@/features/catalog/queries";
import type { PurchaseMode } from "@/types/catalog";

type SearchParams = { q?: string; category?: string; min?: string; max?: string; mode?: string; sort?: string; page?: string };

function numberParam(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}
function validMode(value?: string): PurchaseMode | undefined {
  return value && ["DIRECT", "AFFILIATE", "HYBRID"].includes(value) ? value as PurchaseMode : undefined;
}
function validSort(value?: string): CatalogSort {
  return value && ["relevant", "newest", "price_asc", "price_desc"].includes(value) ? value as CatalogSort : "relevant";
}
function pageHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") query.set(key, value);
  });
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 120);
  const minPrice = numberParam(params.min);
  const maxPrice = numberParam(params.max);
  const mode = validMode(params.mode);
  const sort = validSort(params.sort);
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const categories = await getPublicCategories();
  const selectedCategory = categories.find((item) => item.id === params.category);
  const { products, total } = await searchPublicProducts({
    search: q,
    categoryId: selectedCategory?.id,
    minPrice,
    maxPrice,
    mode,
    sort,
    page,
    pageSize: 24,
  });
  const totalPages = Math.max(1, Math.ceil(total / 24));
  const activeFilters = [q, selectedCategory?.name, minPrice !== undefined ? `Từ ${minPrice.toLocaleString("vi-VN")}đ` : "", maxPrice !== undefined ? `Đến ${maxPrice.toLocaleString("vi-VN")}đ` : "", mode].filter(Boolean);

  return (
    <div className="container-app catalog-list-page search-v040-page">
      <div className="catalog-breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Tìm kiếm</span></div>

      <div className="catalog-page-head search-title-row">
        <div>
          <span className="route-chip">Search & Filter • V0.4.0</span>
          <h1>{q ? `Kết quả cho “${q}”` : selectedCategory ? selectedCategory.name : "Khám phá sản phẩm"}</h1>
          <p>{total} sản phẩm phù hợp{activeFilters.length ? ` • ${activeFilters.join(" • ")}` : ""}</p>
        </div>
      </div>

      <form className="shop-filter-panel" action="/search" method="get">
        <div className="shop-filter-main">
          <label className="shop-filter-field shop-filter-query"><span>Từ khóa</span><input name="q" defaultValue={q} placeholder="Tên sản phẩm, SKU..." /></label>
          <label className="shop-filter-field"><span>Danh mục</span><select name="category" defaultValue={selectedCategory?.id || ""}><option value="">Tất cả danh mục</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="shop-filter-field"><span>Kiểu mua</span><select name="mode" defaultValue={mode || ""}><option value="">Tất cả</option><option value="DIRECT">Đặt trực tiếp</option><option value="AFFILIATE">Affiliate</option><option value="HYBRID">Hybrid</option></select></label>
          <label className="shop-filter-field"><span>Sắp xếp</span><select name="sort" defaultValue={sort}><option value="relevant">Liên quan</option><option value="newest">Mới nhất</option><option value="price_asc">Giá tăng dần</option><option value="price_desc">Giá giảm dần</option></select></label>
        </div>
        <div className="shop-filter-bottom">
          <div className="price-filter-group">
            <label className="shop-filter-field"><span>Giá từ</span><input name="min" type="number" min="0" step="1000" defaultValue={params.min || ""} placeholder="0" /></label>
            <span className="price-filter-separator">—</span>
            <label className="shop-filter-field"><span>Đến</span><input name="max" type="number" min="0" step="1000" defaultValue={params.max || ""} placeholder="Không giới hạn" /></label>
          </div>
          <div className="shop-filter-actions"><button className="shop-filter-submit" type="submit">Áp dụng</button><Link className="shop-filter-clear" href="/search">Xóa lọc</Link></div>
        </div>
      </form>

      {products.length ? (
        <div className="product-grid catalog-list-grid search-result-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="catalog-empty search-empty-state"><div><strong>Không tìm thấy sản phẩm phù hợp</strong><p>Thử bỏ bớt bộ lọc, đổi khoảng giá hoặc tìm bằng từ khóa ngắn hơn.</p><Link className="shop-filter-submit" href="/search">Xem tất cả sản phẩm</Link></div></div>
      )}

      {totalPages > 1 && (
        <nav className="catalog-pagination" aria-label="Phân trang kết quả">
          {page > 1 ? <Link href={pageHref(params, page - 1)}>← Trước</Link> : <span className="pagination-disabled">← Trước</span>}
          <span>Trang <strong>{Math.min(page, totalPages)}</strong> / {totalPages}</span>
          {page < totalPages ? <Link href={pageHref(params, page + 1)}>Sau →</Link> : <span className="pagination-disabled">Sau →</span>}
        </nav>
      )}
    </div>
  );
}
