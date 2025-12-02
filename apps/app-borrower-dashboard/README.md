app-borrower-dashboard

Purpose
- borrower UX for provenance mining, loan sizing, collateral lock actions

Stack targets
- Next.js + React, wagmi / ethers for ERC-3643 + collateral contract flows
- GraphQL client for svc-api-gateway, WebSocket channel for covenant alerts

Core surfaces
1. provenance console
   - pulls manifest snapshots from svc-provenance-miner
   - renders SHA/Merkle evidence, appraisal deltas, hash challenges
2. loan workspace
   - submits collateral requests to svc-lending-core
   - signs IPNFToken escrow tx via IPCollateralManager
3. repayment state
   - streams payment status + cure timers from svc-legal-oracle feed via lending core

Integration contracts
- IPNFToken (ERC-3643) restricted transfer approvals
- IPCollateralManager lock/release transactions initiated via wallet actions
