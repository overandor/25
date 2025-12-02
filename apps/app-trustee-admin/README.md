app-trustee-admin

Purpose
- trustee/governance console for compliance, overrides, and audit trails

Stack targets
- Next.js + React with RBAC guardrails tied to svc-user-auth admin scopes
- realtime log stream from svc-legal-oracle + svc-api-gateway internal topics

Functions
1. compliance registry control
   - manages whitelist/blacklist inside IdentityRegistry + Compliance contracts via multisig
   - syncs with svc-user-auth for KYC state
2. oracle governance
   - reviews pending UCC filings, default notices, manual overrides
   - signs instructions dispatched to LoanOracle when automated path unavailable
3. audit + forensics
   - indexes manifest evolution, collateral state transitions, release/liquidation evidence
   - exports tamper-proof bundles for regulators
