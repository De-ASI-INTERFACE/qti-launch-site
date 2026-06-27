/**
 * SimulationModal — Integration point 3
 *
 * Displayed when useGuardedSwap.step === 'awaiting_confirmation'.
 * Shows the user:
 *   - Simulation pass/fail status
 *   - Compute Units consumed (with colour-coded warning if > 200k)
 *   - Full simulation log output in a scrollable code block
 *   - Confirm and Cancel actions
 *
 * DESIGN CONTRACT:
 *   The Submit button is DISABLED until simulation === success.
 *   Users cannot bypass this screen by any interaction.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

"use client";

import React from "react";
import type { SimulationResult } from "@/lib/swap-types";

interface SimulationModalProps {
  isOpen:          boolean;
  simulationResult: SimulationResult | null;
  isSubmitting:    boolean;
  onConfirm:       () => void;
  onCancel:        () => void;
}

export function SimulationModal({
  isOpen,
  simulationResult,
  isSubmitting,
  onConfirm,
  onCancel,
}: SimulationModalProps) {
  if (!isOpen || !simulationResult) return null;

  const { success, error, logs, unitsConsumed } = simulationResult;

  const cuColour =
    !unitsConsumed           ? "text-gray-400"
    : unitsConsumed > 400_000 ? "text-red-400"
    : unitsConsumed > 200_000 ? "text-yellow-400"
    :                           "text-green-400";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sim-modal-title"
    >
      {/* Panel — stopPropagation prevents backdrop click closing during submit */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-2xl bg-surface-raised border border-surface-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-border">
          <h2
            id="sim-modal-title"
            className="text-lg font-semibold"
          >
            Transaction Simulation
          </h2>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-40"
            aria-label="Cancel swap"
          >
            ✕
          </button>
        </div>

        {/* Simulation Status */}
        <div className="px-6 py-4">
          <div
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium
              ${
                success
                  ? "bg-green-900/40 border border-green-600 text-green-300"
                  : "bg-red-900/40   border border-red-600   text-red-300"
              }`}
          >
            <span className="text-xl">{success ? "✅" : "❌"}</span>
            <span>
              {success
                ? "Simulation passed — safe to sign"
                : `Simulation failed: ${error ?? "unknown error"}`}
            </span>
          </div>

          {/* Compute Units */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-400">Compute Units Consumed</span>
            <span className={`font-mono font-semibold ${cuColour}`}>
              {unitsConsumed != null
                ? unitsConsumed.toLocaleString()
                : "n/a"}
            </span>
          </div>
          {unitsConsumed != null && unitsConsumed > 200_000 && (
            <p className="mt-1 text-xs text-yellow-400">
              ⚠️ High CU usage. Consider adding a compute budget instruction.
            </p>
          )}

          {/* Simulation Logs */}
          <details className="mt-4" open={!success}>
            <summary className="cursor-pointer text-xs text-gray-400 hover:text-white select-none">
              {success ? "Show simulation logs" : "Simulation logs (required reading)"}
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-black/50 border border-surface-border p-3">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No logs returned.</p>
              ) : (
                logs.map((line, i) => (
                  <div
                    key={i}
                    className={`font-mono text-xs leading-5
                      ${
                        line.includes("Error") || line.includes("error")
                          ? "text-red-400"
                          : line.includes("warn") || line.includes("Warning")
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </details>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-surface-border py-3 text-sm font-medium
              text-gray-300 hover:bg-surface-border transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!success || isSubmitting}
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white
              hover:bg-brand-dark transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting…
              </span>
            ) : (
              "Confirm & Sign"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
