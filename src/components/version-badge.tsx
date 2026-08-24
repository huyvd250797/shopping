import { siteConfig } from "@/config/site";
export function VersionBadge() { return <span className="version-badge">{siteConfig.versionLabel}</span>; }
