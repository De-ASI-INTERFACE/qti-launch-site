# QTI Launch Site — Security Audit Checklist

**Protocol Identifier:** RP-DEASI-QTI-LAUNCH-2026-SEC-001  
**Governance Issue:** [#3](https://github.com/De-ASI-INTERFACE/qti-launch-site/issues/3)  
**Author:** Richard Patterson (@De-ASI-INTERFACE)  
**Last Updated:** 2026-06-28

---

## 🔐 Security Hardening Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| S1 | GitHub Advanced Security / secret scanning enabled | ✅ Enable in repo Settings → Security | Dependabot already configured |
| S2 | Wallet connect flow audited for phishing vector exposure | 🔲 Pending | Review adapter injection surface |
| S3 | No RPC API keys or private endpoints in frontend bundle | ✅ CI-enforced | `secret-audit` job scans every PR |
| S4 | Content Security Policy (CSP) headers | ✅ Live | `getSecurityHeaders()` in `next.config.ts` — all routes |
| S5 | Jupiter buy routing reviewed for front-running exposure | 🔲 Pending | Audit slippage params + MEV exposure window |

---

## 🎨 Frontend Hardening Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| F1 | Birdeye price widget stale data fallback | 🔲 Pending | Add timeout + error boundary |
| F2 | Loading/error states for async wallet operations | 🔲 Pending | Standardize across all wallet-connected components |
| F3 | Mobile responsiveness audit | 🔲 Pending | Test on 375px, 390px, 414px viewports |
| F4 | Tokenomics data source verification (on-chain vs. static) | 🔲 Pending | Prefer on-chain reads; flag static fallbacks clearly |

---

## 🔧 Infrastructure Hardening Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| I1 | Branch protection on `main` | 🔲 Pending | Settings → Branches → require PR + status checks |
| I2 | Vercel env variables correctly scoped (no leakage) | 🔲 Pending | Audit Vercel dashboard — no `SECRET_` vars in Preview |
| I3 | Uptime monitoring | 🔲 Pending | Add Grafana synthetic monitoring or Better Uptime |
| I4 | GitHub Actions CI — build check on every PR | ✅ Live | `ci.yml` triggers on all PRs to `main` |

---

## 📝 Documentation Status

| # | Item | Status | Notes |
|---|------|--------|-------|
| D1 | `CHANGELOG.md` for frontend release history | ✅ Added | See `CHANGELOG.md` |
| D2 | Wallet adapter compatibility matrix | 🔲 Pending | Document Backpack, Phantom, Solflare support |
| D3 | Link to QTI token on-chain metadata + Birdeye/DexScreener | 🔲 Pending | Add to README and site footer |

---

## CI Security Jobs

The following automated checks run on every push and PR:

- **`build`** — TypeScript compile check + Next.js production build
- **`secret-audit`** — TruffleHog secret scan + `NEXT_PUBLIC_` namespace audit + `.env` commit guard
- **`dependency-audit`** — `npm audit` at `--audit-level=high`

---

## Keypair & Authority Policy

Per `rp-` protocol governance standards:
- All keypairs are separated by function: authority, fee-receiver, operator
- No private keys are stored in this repository
- Protocol emissions and staking authority are migrated to Squads multisig vault
- IP-bound RPC authentication is enforced at the infrastructure layer

---

_This document is the living governance record for QTI Launch Site security. Update status fields as items are resolved. Close [Issue #3](https://github.com/De-ASI-INTERFACE/qti-launch-site/issues/3) only when all items reach ✅._
