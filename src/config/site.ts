export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME || "MyShop",
  version: "0.5.0",
  versionLabel: "V0.5.0 • Direct Checkout",
  description: "Nền tảng bán hàng hybrid: affiliate và đặt hàng trực tiếp.",
} as const;
