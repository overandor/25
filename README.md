# ip-prime-brokerage

Monorepo baseline for an IP-backed prime brokerage covering provenance "mining" and collateral "locking" functions. The structure separates on-chain, off-chain, and user-surface layers while enforcing deterministic ownership rails.

## Repository Layout

- `apps/`
  - `app-borrower-dashboard/`: borrower UX for IP mining, appraisal intake, and lock orchestration.
  - `app-lender-portal/`: lender underwriting, marketplace visibility, and loan funding controls.
  - `app-trustee-admin/`: compliance and rule management for ERC-3643 components plus legal escalation console.
- `packages/`
  - `pkg-ui/`: shared headless React primitives and deterministic charting components.
  - `pkg-types/`: canonical TypeScript schemas (manifest payloads, loan states, oracle events).
  - `pkg-utils/`: cross-app helpers for encoding manifests, deterministic hashing, and RPC adapters.
- `services/`
  - `svc-api-gateway/`: request edge routing, auth, rate control.
  - `svc-provenance-miner/`: CI hook + daemonized manifest builder producing Merkle roots and attestation bundles.
  - `svc-spv-manager/`: legal wrapper automation (entity creation, registry sync, document vaulting).
  - `svc-tokenization-engine/`: deterministic bridge from SPV registry into IPNFToken mint calls.
  - `svc-lending-core/`: loan underwriting, LTV policy evaluation, disbursement orchestration.
  - `svc-legal-oracle/`: filings (UCC, charges), covenant monitoring, default signaling to on-chain LoanOracle.
  - `svc-user-auth/`: identity, KYC attestation cache, session management.
- `smart-contracts/`
  - `contracts/`: IPCollateralManager, IPNFToken, LoanOracle, and registry modules (IdentityRegistry, Compliance).
  - `test/`: protocol-level unit and integration tests.
  - `scripts/`: deployment and upgrade flows.
- Root configs: `package.json`, `turbo.json` for workspace orchestration.

## Next Steps

1. Define shared type contracts in `packages/pkg-types` reflecting manifest, appraisal, and loan domain objects.
2. Implement IPCollateralManager + IPNFToken under `smart-contracts/contracts`, hardening interfaces for the svc-tokenization-engine and svc-legal-oracle flows.
3. Stand up svc-provenance-miner ingestion (hashing worker + manifest registry) and expose attestations to svc-lending-core.
4. Wire apps to services via the API gateway with deterministic auth flows from svc-user-auth.
