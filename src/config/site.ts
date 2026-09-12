export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "MyShop",
  version: "1.0.0",
  versionLabel: "V1.0.0 • Production Ready",
  description: "Nền tảng bán hàng hybrid: affiliate và đặt hàng trực tiếp.",
} as const;
