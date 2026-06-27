/**
 * /swap — Main swap page.
 * Renders the SwapWidget which wires all three integration points.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

import { SwapWidget } from "@/components/swap/SwapWidget";

export default function SwapPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand">
            QTI Swap
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Powered by Jupiter V6 · RP-JUP-EXECUTIONER-V1
          </p>
        </div>
        <SwapWidget />
      </div>
    </main>
  );
}
