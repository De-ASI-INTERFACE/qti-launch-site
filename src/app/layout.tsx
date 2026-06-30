/**
 * Root layout — wraps every page with wallet adapter context.
 * Providers are isolated here so swap pages can use useWallet() freely.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

import type { Metadata } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/providers/WalletContextProvider";
import { ToastProvider }         from "@/providers/ToastProvider";
import { SpeedInsights }         from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title:       "QTI — Quantum Trading Infinity",
  description: "Squads-gated, rate-limited QTI token swap interface",
  openGraph: {
    title:       "QTI Swap",
    description: "Swap QTI tokens securely via Jupiter V6 + RP-JUP-EXECUTIONER",
    siteName:    "QTI",
    locale:      "en_US",
    type:        "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface text-white antialiased">
        <WalletContextProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletContextProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
