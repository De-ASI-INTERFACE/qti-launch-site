# Changelog — QTI Launch Site

All notable changes to the QTI Launch Site frontend are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Security
- Added TruffleHog secret scanning to CI (`secret-audit` job) — runs on every PR and push to `main`
- Added `NEXT_PUBLIC_` namespace audit step to CI — blocks RPC/private key exposure in browser bundle
- Added `.env` commit guard to CI — fails build if any `.env` file is committed
- Added `npm audit --audit-level=high` dependency vulnerability check to CI
- Expanded `SECURITY.md` with full threat model, CSP documentation, key management policy, and responsible disclosure timeline
- Added `SECURITY-AUDIT.md` — governance checklist tracking all Issue #3 hardening items
- Upgraded CI `actions/checkout` and `actions/setup-node` to v4 pinned versions
- Added TypeScript `noEmit` type check step to CI build job

### Added
- `CHANGELOG.md` — frontend release history (this file)
- `SECURITY-AUDIT.md` — formal governance audit checklist linked to Issue #3

---

## [0.1.0] — 2026-06-28

### Added
- Initial QTI Launch Site frontend deployment
- Next.js 14 app with Tailwind CSS
- Jupiter V6 swap integration via `rp-jup-aggregator-v6` SDK
- Birdeye price widget integration
- Wallet adapter support (Backpack, Phantom, Solflare)
- CSP headers via `getSecurityHeaders()` applied to all routes in `next.config.ts`
- `.github/SECURITY.md` — initial security policy
- `.github/dependabot.yml` — automated dependency updates
- `.github/CODEOWNERS` — repository ownership
- `.github/PULL_REQUEST_TEMPLATE.md` — PR review checklist
- GitHub Actions CI (`ci.yml`, `node-version-check.yml`)
- `.env.example` — safe environment variable template
