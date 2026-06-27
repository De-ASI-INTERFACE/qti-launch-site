/**
 * swap-types.ts — Shared type re-exports for the frontend.
 * Mirrors the SDK types to avoid circular imports across the monorepo.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

import type { PublicKey } from "@solana/web3.js";

export interface SwapParams {
  amountIn:         bigint;
  minimumAmountOut: bigint;
  slippageBps:      number;
  inputMint:        PublicKey;
  outputMint:       PublicKey;
  userPublicKey:    PublicKey;
  feeVault:         PublicKey;
}

export interface SimulationResult {
  success:       boolean;
  error:         string | null;
  logs:          string[];
  unitsConsumed: number | null;
}
