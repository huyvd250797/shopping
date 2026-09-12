export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "MyShop",
  version: "0.9.0",
  versionLabel: "V0.9.0 • Hardening",
  description: "Nền tảng bán hàng hybrid: affiliate và đặt hàng trực tiếp.",
} as const;
