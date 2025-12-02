app-lender-portal

Purpose
- investor interface for underwriting, monitoring, and funding IP-backed loans

Stack targets
- Next.js + React, charting via lightweight deterministic libs
- consumes svc-api-gateway GraphQL, websockets for loan lifecycle events

Modules
1. diligence board
   - displays manifest provenance, SPV filings, appraisal docs
   - fetches svc-provenance-miner hash proofs + svc-spv-manager entity packets
2. term negotiation
   - configures offers stored in svc-lending-core
   - enforces compliance via svc-user-auth + IdentityRegistry lookups
3. portfolio telemetry
   - monitors loan cash flows, LTV drift, cure timers from svc-legal-oracle feed

Smart contract touchpoints
- observes IPNFToken + IPCollateralManager events via RPC to align UI with on-chain state transitions
