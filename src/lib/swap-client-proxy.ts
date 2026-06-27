/**
 * swap-client-proxy.ts
 *
 * Re-exports from rp-jup-aggregator-v6 SDK.
 * Centralises the import path so all frontend code points here,
 * not directly at the SDK — easy to swap in a built npm package later.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

export {
  buildAndSimulateSwap,
  submitWithRetry,
  validateSwapParams,
  ALLOWED_RPC_ORIGINS,
  JUPITER_PROGRAM_ID,
  MAX_SLIPPAGE_BPS,
  DUST_THRESHOLD,
} from "../../../rp-jup-aggregator-v6/packages/sdk/src/swap-client";

export type { SwapParams, SwapResult, SimulationResult } from "../../../rp-jup-aggregator-v6/packages/sdk/src/swap-client";
