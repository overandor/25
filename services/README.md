services implement off-chain control-plane logic. All are containerized Go services with gRPC + HTTP adapters.
- svc-api-gateway: terminates TLS, forwards to internal services, enforces authN/Z.
- svc-provenance-miner: git hook receiver + hashing workers + manifest registry.
- svc-spv-manager: automates SPV creation, registers ownership, persists entity docs.
- svc-tokenization-engine: calls smart contracts to mint/burn/update IPNFToken state.
- svc-lending-core: underwriting engine, LTV policy, payment schedule ledger.
- svc-legal-oracle: handles filings and default attestations, signs LoanOracle messages.
- svc-user-auth: KYC ingestion, credential issuance, session tokens.
