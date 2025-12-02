ip-prime-brokerage monorepo

Objective
- integrate provenance "mining" and collateral "locking" for software IP within a single Fintech-as-a-Service stack
- keep enforcement-ready legal state while exposing borrower, lender, and trustee control surfaces
- ensure every component maps cleanly to on-chain/off-chain system boundaries

Repository layout
```
/ip-prime-brokerage
├── apps/
│   ├── app-borrower-dashboard/
│   ├── app-lender-portal/
│   └── app-trustee-admin/
├── packages/
│   ├── pkg-ui/
│   ├── pkg-types/
│   └── pkg-utils/
├── services/
│   ├── svc-api-gateway/
│   ├── svc-provenance-miner/
│   ├── svc-spv-manager/
│   ├── svc-tokenization-engine/
│   ├── svc-lending-core/
│   ├── svc-legal-oracle/
│   └── svc-user-auth/
├── smart-contracts/
│   ├── contracts/
│   │   ├── IPCollateralManager.sol
│   │   ├── IPNFToken.sol
│   │   ├── LoanOracle.sol
│   │   └── registry/
│   │       ├── IdentityRegistry.sol
│   │       └── Compliance.sol
│   ├── scripts/
│   └── test/
├── package.json
└── turbo.json
```

System flows
1. Mining (svc-provenance-miner → svc-spv-manager → svc-tokenization-engine)
   - hash repo inputs, seal manifest + Merkle root, push to immutable store
   - instantiate jurisdictional SPV via svc-spv-manager; capture corp docs
   - mint ERC-3643 IPNFToken bound to SPV record + manifest URI
2. Locking (apps + services + contracts)
   - borrower dashboard drives svc-lending-core, which prices collateral and prepares loan term sheet referencing manifest IDs
   - svc-lending-core instructs borrower to escrow IPNFToken through IPCollateralManager; svc-legal-oracle files UCC-1 and feeds LoanOracle
   - LoanOracle toggles IPCollateralManager state machine: release on repayment, transfer to lender or auction contract on default signal

Component responsibilities
apps/
- app-borrower-dashboard: provenance UX, loan application, collateral lock/unlock instructions, wallet signing for ERC-3643 + collateral contracts
- app-lender-portal: loan marketplace, underwriting views, repayment monitoring, covenant alerts
- app-trustee-admin: compliance approvals, whitelist maintenance, oracle overrides, emergency release tooling

packages/
- pkg-ui: shared React primitives (layout, typography, inputs) with deterministic theme tokens
- pkg-types: canonical TypeScript interfaces for manifests, LTV models, oracle events, ERC-3643 metadata
- pkg-utils: pure utility modules (hash verifiers, pricing helpers, RPC clients) usable by apps/services

services/
- svc-api-gateway: GraphQL/REST ingress, authz, request fan-out into domain services
- svc-provenance-miner: git hook integration, hash tree builder, appraisal ingestion, writes manifest URIs
- svc-spv-manager: SPV lifecycle orchestrator, legal doc storage, signature management
- svc-tokenization-engine: bridges SPV ledger with smart-contracts/IPNFToken mint + metadata pinning
- svc-lending-core: pricing, loan state machine, covenant enforcement, triggers collateral manager interactions
- svc-legal-oracle: UCC filings, payment monitoring, signed default/perfection attestations pushed to LoanOracle
- svc-user-auth: identity, credential recovery, ties ERC-3643 identity registry to KYC data lake

smart-contracts/
- IPCollateralManager.sol: escrows ERC-3643 shares, state machine (Unencumbered → Encumbered → InDefault → Liquidated)
- IPNFToken.sol: ERC-3643-compliant token representing SPV equity, gating transfers through IdentityRegistry + Compliance modules
- LoanOracle.sol: receives svc-legal-oracle signed messages, controls IPCollateralManager transitions
- registry/IdentityRegistry.sol and registry/Compliance.sol: ERC-3643 primitives for identity-gated ownership
- scripts/: deployment + upgrade automation (Hardhat/Foundry)
- test/: contract unit/integration specs ensuring deterministic lock/unlock semantics

Build orchestration
- root package.json defines workspaces for apps, packages, services, smart-contracts; Turbo orchestrates dev/build/lint/test fan-out
- each workspace will own its own toolchain (Next.js, Node services, Solidity) but share lint/test standards enforced via turbo.json pipeline

Roadmap hooks
- provenance miner pushes manifest hash + appraisal payload into svc-lending-core pricing queue
- lending-core writes loan + collateral events to event bus consumed by apps and legal oracle
- legal oracle default signal is the sole authority for IPCollateralManager liquidation; no other module bypasses compliance guards

Runtime services (implemented)
- API gateway (`services/svc-api-gateway`): validates pipeline payloads before invoking downstream services.
- Provenance miner (`services/svc-provenance-miner`): computes SHA-256 Merkle roots and returns manifest objects.
- SPV manager (`services/svc-spv-manager`): registers SPVs with controller wallets.
- Tokenization engine (`services/svc-tokenization-engine`): mints in-memory token handles per SPV and Merkle root.
- Lending core (`services/svc-lending-core`): issues/approves/defaults loans keyed to token handles.
- Legal oracle (`services/svc-legal-oracle`): signs default signals with an HMAC secret.
- User auth (`services/svc-user-auth`): wallet registration and deterministic HMAC auth tokens.
- Borrower/Lender/Trustee apps (`apps/*`): Fastify-served HTML panels via `@ip-prime-brokerage/pkg-ui`.

Service bootstrap
Each workspace can be started with `npm start --workspace <name>`. Example (provenance miner):
```
NODE_ENV=development npm start --workspace services/svc-provenance-miner
curl -X POST http://localhost:4001/manifest \
  -H "content-type: application/json" \
  -d '{"fileHashes":["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],"totalEffortHours":12}'
```

Shared packages
- `@ip-prime-brokerage/pkg-utils`: Fastify bootstrapper, logger, env loader, hardened HTTP client with timeouts.
- `@ip-prime-brokerage/pkg-types`: zod schemas for manifests, SPVs, tokenization, loans, default signals.
- `@ip-prime-brokerage/pkg-ui`: zero-dependency HTML status renderer for UI apps.

Gateway orchestration
- `services/svc-api-gateway` now orchestrates a full pipeline using downstream services. Required environment:
  - `PROVENANCE_URL` (e.g., http://localhost:4001)
  - `SPV_URL` (e.g., http://localhost:4002)
  - `TOKENIZATION_URL` (e.g., http://localhost:4003)
  - `LENDING_URL` (e.g., http://localhost:4004)
- POST `/pipeline/execute` fan-outs: `/manifest` → `/spv` → `/tokenize` → `/loans` and returns the aggregate manifest/SPV/token/loan tuple.
