svc-provenance-miner

Role
- creates tamper-proof manifests for borrower codebases

Workflow
1. ingest git commits via webhook or CLI client
2. normalize file list, compute SHA-256 per file, build Merkle tree
3. persist manifest, R&D meta, appraisal references to storage (S3/IPFS) and emit URI
4. notify svc-lending-core + svc-api-gateway for borrower visibility

Determinism requirements
- hashing pipeline must match pkg-utils/hash.ts outputs
- timestamping anchored to trusted time source; record RFC3339 in manifest
- retains minimal PII; redacts files flagged as excluded assets
