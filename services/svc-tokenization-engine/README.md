svc-tokenization-engine

Role
- mints and maintains ERC-3643 IPNFTokens once SPV + manifest data are finalized

Pipeline
1. receive SPV packet + manifest URI from svc-spv-manager
2. compose IPNFToken metadata (jurisdiction, governing law, rights scope, Merkle root, valuation)
3. call smart-contracts/IPNFToken mintIPNFT, assign token to borrower wallet validated via IdentityRegistry
4. push tokenId + metadata CID to svc-lending-core + apps for collateral readiness

Security
- hardware-backed signer for contract interactions
- idempotent mints; rejects duplicate SPV or manifest tuples
