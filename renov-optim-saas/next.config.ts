import type { NextConfig } from "next";

/** Chromium / Puppeteer : ne pas bundler (évite "@sparticuz/chromium/bin does not exist"). */
const nextConfig: NextConfig = {
  // Next.js 15+ : remplace l’ancien `experimental.serverComponentsExternalPackages`.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
