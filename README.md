# QTI Launch Site

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Solana](https://img.shields.io/badge/Chain-Solana_Mainnet-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com)
[![Jupiter](https://img.shields.io/badge/Jupiter-V6_Routing-FF6B35?style=flat-square)](https://jup.ag)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](./LICENSE)

> **Author:** Richard Patterson ([@De-ASI-INTERFACE](https://github.com/De-ASI-INTERFACE))
> **Network:** Solana Mainnet-Beta
> **Token:** QTI — Quantum Trading Infinity

Official public launch site for the Quantum Trading Infinity (QTI) SPL token on Solana. Features wallet connect, Jupiter buy routing, Birdeye price widget, live X community feed, tokenomics visualization, and mission page.

---

## Features

| Feature | Description |
|---|---|
| **Wallet Connect** | Solana wallet adapter (Phantom, Backpack, Solflare) |
| **Jupiter Buy Routing** | One-click QTI purchase via Jupiter V6 aggregator |
| **Birdeye Price Widget** | Real-time QTI price and market data |
| **X Community Feed** | Live @QuantumTradingInfinity social feed |
| **Tokenomics Page** | Supply breakdown, emission schedule, utility overview |
| **Mission Page** | Protocol vision, team, and roadmap |

---

## Stack

| Component | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Wallet | @solana/wallet-adapter |
| Swap routing | Jupiter V6 API |
| Price data | Birdeye API |
| Deployment | Vercel |

---

## Setup

```bash
git clone https://github.com/De-ASI-INTERFACE/qti-launch-site
cd qti-launch-site
npm install
cp .env.example .env.local   # Configure RPC URL, Jupiter endpoint, Birdeye API key
npm run dev
```

Open `http://localhost:3000`.

## Production Deployment

```bash
npm run build
# Deploy via Vercel CLI or connect repo to Vercel dashboard
vercel --prod
```

---

## Related Repositories

| Repo | Purpose |
|---|---|
| [QTI-token](https://github.com/De-ASI-INTERFACE/QTI-token) | SPL token metadata, image assets, on-chain registration |
| [rp-jup-aggregator-v6](https://github.com/De-ASI-INTERFACE/rp-jup-aggregator-v6) | Jupiter V6 swap SDK powering the buy button |
| [qti-emissions-controller](https://github.com/De-ASI-INTERFACE/qti-emissions-controller) | On-chain staking reward emissions |
| [solana-defi-protocol-core](https://github.com/De-ASI-INTERFACE/solana-defi-protocol-core) | CPAMM and DeFi protocol core |

---

*© 2026 Richard Patterson — Apache-2.0 License*
