pkg-utils

Purpose
- shared TypeScript/Node utilities for deterministic data handling

Modules
- hash.ts: wraps Web Crypto SHA-256, builds Merkle roots identical to svc-provenance-miner outputs
- pricing.ts: conservative LTV calculators, haircut tables, scenario stress helpers
- rpc.ts: lightweight providers for ERC-3643 + IPCollateralManager interactions with retry/jitter policies disabled (deterministic)

Quality gates
- fully typed, side-effect free, 100% unit test coverage enforced via turbo test pipeline
