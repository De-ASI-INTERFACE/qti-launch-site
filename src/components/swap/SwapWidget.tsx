/**
 * SwapWidget — End-to-end swap UI
 *
 * Wires all three integration points via useGuardedSwap:
 *
 *   1. next.config.ts headers — applied at HTTP layer (not here)
 *   2. useGuardedSwap.initiateSwap() — replaces sendTransaction()
 *   3. SimulationModal — shows simulation results, blocks signing on failure
 *
 * Flow:
 *   user fills form → Submit → initiateSwap() (simulates)
 *     → SimulationModal opens (CU + logs)
 *       → user clicks "Confirm & Sign"
 *         → confirmAndSubmit() (guardedSwap + signTransaction + submitWithRetry)
 *           → toast success + explorer link
 *
 * RP-DEASI-JUP-2026-0619-001
 */

"use client";

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useGuardedSwap }   from "@/hooks/useGuardedSwap";
import { SimulationModal }  from "./SimulationModal";
import { useToast }         from "@/providers/ToastProvider";
import {
  MAX_SLIPPAGE_BPS,
  DUST_THRESHOLD,
} from "@/lib/swap-client-proxy";

// Well-known mints — sourced from constants, not user input
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

// Fee vault is the protocol treasury ATA — never user-supplied
const FEE_VAULT = new PublicKey(
  process.env.NEXT_PUBLIC_FEE_VAULT ?? "11111111111111111111111111111111"
);

export function SwapWidget() {
  const { publicKey, connected }  = useWallet();
  const { addToast }              = useToast();

  // ── Form State ──────────────────────────────────────────────────
  const [amountInSol,     setAmountInSol]     = useState("");
  const [minAmountOut,    setMinAmountOut]    = useState("");
  const [slippageBps,     setSlippageBps]     = useState(50);
  const [formError,       setFormError]       = useState<string | null>(null);

  // ── Guarded Swap Hook (integration point 2 + 3) ───────────────────
  const {
    step,
    simulationResult,
    txSignature,
    error:     swapError,
    initiateSwap,
    confirmAndSubmit,
    cancelSwap,
  } = useGuardedSwap();

  const isSimulating  = step === "simulating";
  const isSubmitting  = step === "signing" || step === "submitting";
  const isConfirmed   = step === "confirmed";
  const showModal     = step === "awaiting_confirmation";

  // ── Form Validation + Submit ───────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!connected || !publicKey) {
      addToast("Connect your wallet first", "warning");
      return;
    }

    const amountInLamports = Math.round(
      parseFloat(amountInSol) * 1e9
    );
    const minOut = parseInt(minAmountOut, 10);

    if (isNaN(amountInLamports) || amountInLamports <= 0) {
      setFormError("Enter a valid amount");
      return;
    }
    if (isNaN(minOut) || minOut <= DUST_THRESHOLD) {
      setFormError(
        `Minimum output must be > ${DUST_THRESHOLD} (dust threshold)`
      );
      return;
    }
    if (slippageBps > MAX_SLIPPAGE_BPS) {
      setFormError(`Slippage must be ≤ ${MAX_SLIPPAGE_BPS} bps`);
      return;
    }

    // Integration point 2: initiateSwap replaces wallet.sendTransaction()
    await initiateSwap({
      amountIn:         BigInt(amountInLamports),
      minimumAmountOut: BigInt(minOut),
      slippageBps,
      inputMint:        WSOL_MINT,
      outputMint:       USDC_MINT,
      userPublicKey:    publicKey,
      feeVault:         FEE_VAULT,
    });
  }

  return (
    <>
      {/* Integration point 3: SimulationModal wired to simulation result */}
      <SimulationModal
        isOpen={showModal}
        simulationResult={simulationResult}
        isSubmitting={isSubmitting}
        onConfirm={confirmAndSubmit}
        onCancel={cancelSwap}
      />

      <div className="rounded-2xl bg-surface-raised border border-surface-border p-6 shadow-xl">
        {/* Step indicator */}
        <StepIndicator step={step} />

        {isConfirmed && txSignature ? (
          <SuccessView signature={txSignature} />
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Amount In */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Amount (SOL)
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={amountInSol}
                onChange={(e) => setAmountInSol(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-black/30 border border-surface-border
                  px-4 py-3 text-white placeholder-gray-600 text-lg
                  focus:outline-none focus:border-brand transition-colors"
                disabled={isSimulating || isSubmitting}
                required
              />
            </div>

            {/* Minimum Amount Out */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Min Output (raw units)
              </label>
              <input
                type="number"
                min={DUST_THRESHOLD + 1}
                step="1"
                value={minAmountOut}
                onChange={(e) => setMinAmountOut(e.target.value)}
                placeholder={`> ${DUST_THRESHOLD}`}
                className="w-full rounded-xl bg-black/30 border border-surface-border
                  px-4 py-3 text-white placeholder-gray-600
                  focus:outline-none focus:border-brand transition-colors"
                disabled={isSimulating || isSubmitting}
                required
              />
            </div>

            {/* Slippage */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Slippage: <span className="text-white font-mono">{slippageBps} bps ({(slippageBps / 100).toFixed(2)}%)</span>
              </label>
              <input
                type="range"
                min={1}
                max={MAX_SLIPPAGE_BPS}
                step={1}
                value={slippageBps}
                onChange={(e) => setSlippageBps(parseInt(e.target.value))}
                className="w-full accent-brand"
                disabled={isSimulating || isSubmitting}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.01%</span>
                <span>{(MAX_SLIPPAGE_BPS / 100).toFixed(2)}% max</span>
              </div>
            </div>

            {/* Form error */}
            {(formError || swapError) && (
              <div className="mb-4 rounded-lg bg-red-900/40 border border-red-600
                px-4 py-3 text-sm text-red-300">
                {formError ?? swapError}
              </div>
            )}

            {/* CTA */}
            {!connected ? (
              <WalletMultiButton className="w-full" />
            ) : (
              <button
                type="submit"
                disabled={isSimulating || isSubmitting}
                className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white
                  hover:bg-brand-dark transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSimulating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white
                      border-t-transparent animate-spin" />
                    Simulating…
                  </span>
                ) : (
                  "Simulate & Swap"
                )}
              </button>
            )}
          </form>
        )}
      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────

const STEP_LABELS: Record<string, string> = {
  idle:                  "",
  simulating:            "Simulating transaction…",
  awaiting_confirmation: "Review simulation results",
  signing:               "Waiting for wallet signature…",
  submitting:            "Broadcasting to Solana…",
  confirmed:             "Swap confirmed!",
  error:                 "Something went wrong",
};

function StepIndicator({ step }: { step: string }) {
  const label = STEP_LABELS[step];
  if (!label) return null;
  return (
    <div className="mb-4 text-center text-xs font-medium text-gray-400">
      {label}
    </div>
  );
}

function SuccessView({ signature }: { signature: string }) {
  const explorerUrl = `https://explorer.solana.com/tx/${signature}`;
  return (
    <div className="text-center py-6">
      <div className="text-4xl mb-3">✅</div>
      <p className="text-lg font-semibold text-green-400">Swap Confirmed</p>
      <p className="mt-2 text-xs text-gray-400 font-mono break-all">
        {signature}
      </p>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-lg border border-brand px-4 py-2
          text-sm text-brand hover:bg-brand hover:text-white transition-colors"
      >
        View on Explorer ↗
      </a>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 block mx-auto text-xs text-gray-500 hover:text-white"
      >
        Swap again
      </button>
    </div>
  );
}
