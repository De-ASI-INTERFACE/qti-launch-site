# Security Policy

**Protocol Identifier:** RP-DEASI-QTI-LAUNCH-2026-SEC-001  
**Maintainer:** [@De-ASI-INTERFACE](https://github.com/De-ASI-INTERFACE)  
**Last Updated:** 2026-06-28

---

## Supported Versions

| Version | Supported |
|---------|------------------|
| `main` (latest) | ✅ Active |
| All prior tags   | ❌ No backports  |

---

## Reporting a Vulnerability

Do **not** open a public GitHub issue for security vulnerabilities.

**Contact:** [@De-ASI-INTERFACE](https://github.com/De-ASI-INTERFACE) via GitHub private security advisory.

We follow a **90-day responsible disclosure policy**. You will receive an acknowledgment within 48 hours and a resolution target within 14 days for critical issues.

---

## Threat Model & Scope

### In Scope
- **Wallet connect integration** — phishing vector exposure, malicious adapter injection
- **Jupiter buy routing** — front-running exposure, slippage manipulation
- **XSS / injection** — via Birdeye price widgets, external price feeds, or tokenomics data
- **RPC endpoint exposure** — private RPC keys or custom endpoints leaked into the frontend bundle
- **Content Security Policy (CSP)** — misconfigured or missing directives allowing script injection
- **Environment variable leakage** — secrets surfaced in Vercel edge runtime or static build output
- **Dependency supply chain** — malicious or compromised npm packages

### Out of Scope
- On-chain Solana program vulnerabilities (tracked separately in protocol repo)
- Third-party wallet software (Backpack, Phantom, Solflare)
- Jupiter aggregator V6 smart contract logic (upstream)

---

## Security Architecture

### CSP Headers
All routes enforce a Content Security Policy via `getSecurityHeaders()` in `next.config.ts`. Headers include:
- `Content-Security-Policy` — restricts script, style, connect, and frame sources
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` — max-age 1 year, includeSubDomains
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — disables camera, microphone, geolocation

### RPC Endpoint Hardening
- All RPC URLs are injected via environment variables at build time — **never hardcoded**
- `NEXT_PUBLIC_` prefix is only used for variables explicitly intended for client-side exposure
- Private RPC endpoints use server-side API routes as proxies

### Secret Management
- GitHub Advanced Security secret scanning enabled on `main`
- Dependabot version and security updates configured
- No credentials committed — enforced by `.gitignore` and CI env audit step

### Key Management
- All keypairs are separated by function (authority, fee, operator) per `rp-` protocol standards
- No private keys are ever present in this repository — all signing is done via Squads multisig or ephemeral wallets

---

## Security Checklist (CI-Enforced)

See [SECURITY-AUDIT.md](../SECURITY-AUDIT.md) for the full governance audit trail tied to [Issue #3](https://github.com/De-ASI-INTERFACE/qti-launch-site/issues/3).

---

## Responsible Disclosure Timeline

| Day | Action |
|-----|--------|
| 0   | Report received — acknowledgment sent |
| 1–3 | Triage and severity classification |
| 3–14 | Patch development and internal review |
| 14  | Fix deployed to `main` + Vercel production |
| 90  | Public disclosure permitted |
