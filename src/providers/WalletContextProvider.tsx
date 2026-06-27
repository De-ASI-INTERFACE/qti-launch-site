/**
 * WalletContextProvider — Solana wallet adapter context.
 * Exposes useWallet(), useConnection(), and useAnchorProgram().
 *
 * RPC endpoint is sourced from NEXT_PUBLIC_RPC_URL env var only.
 * NEVER allow client-side RPC override.
 *
 * RP-DEASI-JUP-2026-0619-001
 */

"use client";

import React, { useMemo } from "react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

// RPC endpoint sourced exclusively from server-controlled env var.
// Falls back to public mainnet — never to a client-supplied value.
const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_URL ??
  clusterApiUrl("mainnet-beta");

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
