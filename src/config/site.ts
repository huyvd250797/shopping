export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "MyShop",
  version: "0.2.0",
  versionLabel: "V0.2.0 • Auth & Roles",
  description: "Nền tảng bán hàng hybrid: affiliate và đặt hàng trực tiếp.",
} as const;
