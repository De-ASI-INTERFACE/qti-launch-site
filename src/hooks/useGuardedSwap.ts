/**
 * useGuardedSwap — Integration point 2
 *
 * Replaces ALL raw wallet.sendTransaction() calls in the codebase.
 * Enforces the full security pipeline:
 *
 *   buildAndSimulateSwap()          ← SDK builds + simulates
 *        ↓
 *   setSimulationResult(result)     ← triggers SimulationModal
 *        ↓
 *   user confirms in modal
 *        ↓
 *   wallet.signTransaction()        ← wallet adapter signs
 *        ↓
 *   submitWithRetry()               ← sends with exponential backoff
 *        ↓
 *   toast success / error
 *
 * NEVER calls wallet.sendTransaction() directly.
 * NEVER submits if simulation failed.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import type { SwapParams, SimulationResult } from "../lib/swap-types";
import { useToast } from "@/providers/ToastProvider";

// These are re-exported from the rp-jup-aggregator-v6 SDK.
// In a monorepo they come from the workspace package;
// when deployed standalone, point at the built dist.
import {
  buildAndSimulateSwap,
  submitWithRetry,
  ALLOWED_RPC_ORIGINS,
} from "../lib/swap-client-proxy";
import { guardedSwap } from "../lib/swap-guard-proxy";

export type SwapStep =
  | "idle"
  | "simulating"
  | "awaiting_confirmation"
  | "signing"
  | "submitting"
  | "confirmed"
  | "error";

export interface UseGuardedSwapReturn {
  step:              SwapStep;
  simulationResult:  SimulationResult | null;
  txSignature:       string | null;
  error:             string | null;
  /** Call this to begin the full swap pipeline */
  initiateSwap:      (params: SwapParams) => Promise<void>;
  /** Call this from the SimulationModal confirm button */
  confirmAndSubmit:  () => Promise<void>;
  /** Call this from the SimulationModal cancel button */
  cancelSwap:        () => void;
}

export function useGuardedSwap(): UseGuardedSwapReturn {
  const { connection }             = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { addToast }               = useToast();

  const [step,             setStep]             = useState<SwapStep>("idle");
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [pendingTx,        setPendingTx]        = useState<Transaction | null>(null);
  const [txSignature,      setTxSignature]      = useState<string | null>(null);
  const [error,            setError]            = useState<string | null>(null);

  // ── Step 1: Build + Simulate ────────────────────────────────────────

  const initiateSwap = useCallback(
    async (params: SwapParams) => {
      if (!publicKey) {
        addToast("Connect your wallet first", "warning");
        return;
      }

      setStep("simulating");
      setError(null);
      setSimulationResult(null);
      setPendingTx(null);
      setTxSignature(null);

      try {
        // Integration point 2a: buildAndSimulateSwap from hardened SDK
        const { transaction, simulation } = await buildAndSimulateSwap(
          connection,
          params,
          publicKey
        );

        // Integration point 3: surface simulation result to modal
        setSimulationResult(simulation);

        if (!simulation.success) {
          setStep("error");
          setError(`Simulation failed: ${simulation.error}`);
          addToast(`Simulation failed: ${simulation.error}`, "error");
          return;
        }

        setPendingTx(transaction);
        // Transitions to awaiting_confirmation: SimulationModal renders
        setStep("awaiting_confirmation");
      } catch (e: any) {
        setStep("error");
        setError(e.message ?? "Unknown error during simulation");
        addToast(e.message ?? "Simulation error", "error");
      }
    },
    [connection, publicKey, addToast]
  );

  // ── Step 2: User confirmed in modal — run guardedSwap then sign + submit ─

  const confirmAndSubmit = useCallback(async () => {
    if (!pendingTx || !signTransaction || !publicKey) return;

    setStep("signing");

    try {
      // Integration point 2b: guardedSwap is the final gate before signing
      const guard = await guardedSwap({
        connection,
        transaction:       pendingTx,
        minimumAmountOut:  BigInt(
          (pendingTx as any).__minimumAmountOut ?? 0
        ),
        allowedRpcOrigins: ALLOWED_RPC_ORIGINS,
        onSimulationResult: (result) => {
          // Re-run sim at submit time to catch stale blockhash/state changes
          setSimulationResult((prev) => prev ? { ...prev, ...result } : null);
        },
      });

      if (!guard.safe) {
        setStep("error");
        setError(guard.reason ?? "Guard check failed");
        addToast(guard.reason ?? "Transaction blocked by safety guard", "error");
        return;
      }

      // Wallet adapter signs the transaction
      const signed = await signTransaction(pendingTx);

      setStep("submitting");

      // Integration point 2c: submitWithRetry replaces sendTransaction()
      const signature = await submitWithRetry(connection, signed);

      setTxSignature(signature);
      setStep("confirmed");
      addToast(
        `✅ Swap confirmed: ${signature.slice(0, 8)}…`,
        "success"
      );
    } catch (e: any) {
      setStep("error");
      setError(e.message ?? "Transaction failed");
      addToast(e.message ?? "Transaction failed", "error");
    }
  }, [connection, pendingTx, signTransaction, publicKey, addToast]);

  const cancelSwap = useCallback(() => {
    setPendingTx(null);
    setSimulationResult(null);
    setStep("idle");
    setError(null);
  }, []);

  return {
    step,
    simulationResult,
    txSignature,
    error,
    initiateSwap,
    confirmAndSubmit,
    cancelSwap,
  };
}
