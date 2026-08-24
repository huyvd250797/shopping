export type HomeSectionType = "FEATURED" | "NEWEST" | "BEST_PRICE" | "RECOMMENDED";

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  storage_path: string | null;
  link_url: string | null;
  button_label: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type HomeSection = {
  id: string;
  section_key: string;
  title: string;
  subtitle: string | null;
  section_type: HomeSectionType;
  item_limit: number;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};
