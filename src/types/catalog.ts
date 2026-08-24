export type PurchaseMode = "AFFILIATE" | "DIRECT" | "HYBRID";
export type ProductStatus = "draft" | "active" | "archived";

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  alt_text: string | null;
  sort_order: number;
  created_at?: string;
};

export type CatalogProduct = {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  thumbnail_url: string | null;
  purchase_mode: PurchaseMode;
  affiliate_url: string | null;
  button_label: string | null;
  secondary_button_label: string | null;
  status: ProductStatus;
  is_featured: boolean;
  sort_order: number;
  track_stock: boolean;
  stock_qty: number | null;
  deleted_at: string | null;
  badge: string | null;
  tags: string[];
  specifications: Record<string, unknown>;
  meta_title: string | null;
  meta_description: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Pick<Category, "id" | "name" | "slug"> | null;
  product_images?: ProductImage[];
};
