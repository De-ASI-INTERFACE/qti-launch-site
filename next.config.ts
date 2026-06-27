/**
 * next.config.ts — QTI Launch Site
 *
 * Integration point 1: getSecurityHeaders() applied to ALL routes.
 * This enforces CSP, HSTS, X-Frame-Options, and RPC origin restriction
 * at the HTTP response level — not just client-side.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

import type { NextConfig } from "next";

// Re-exported from rp-jup-aggregator-v6 SDK via workspace symlink.
// If running standalone, copy packages/sdk/src/csp-headers.ts locally.
import { getSecurityHeaders } from "../rp-jup-aggregator-v6/packages/sdk/src/csp-headers";

const nextConfig: NextConfig = {
  // ── Security Headers ─────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to every route — no exceptions
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },

  // ── Image Domains ────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },

  // ── Compiler ─────────────────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production builds (keep console.error/warn)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Experimental ────────────────────────────────────────────────────────
  experimental: {
    typedRoutes: true,
  },

  // ── Redirect bare / to /swap ────────────────────────────────────────────
  async redirects() {
    return [
      {
        source:      "/",
        destination: "/swap",
        permanent:   false,
      },
    ];
  },
};

export default nextConfig;
