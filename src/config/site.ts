export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "MyShop",
  version: "0.6.0",
  versionLabel: "V0.6.0 • Order Admin",
  description: "Nền tảng bán hàng hybrid: affiliate và đặt hàng trực tiếp.",
} as const;
