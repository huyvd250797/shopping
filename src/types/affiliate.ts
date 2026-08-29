import type { PurchaseMode, ProductStatus } from "@/types/catalog";

export type AffiliateKpis = {
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday: number;
  activeAffiliateProducts: number;
};

export type AffiliateProductStat = {
  productId: string;
  productName: string;
  slug: string;
  purchaseMode: PurchaseMode;
  productStatus: ProductStatus;
  clicks: number;
  uniqueVisitors: number;
  lastClickedAt: string | null;
};

export type AffiliateRecentClick = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  purchaseMode: PurchaseMode;
  userId: string | null;
  sessionId: string | null;
  sourcePath: string | null;
  targetUrl: string;
  createdAt: string;
};
