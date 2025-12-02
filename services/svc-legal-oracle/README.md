svc-legal-oracle

Role
- authoritative off-chain oracle for perfection, payment monitoring, and default enforcement

Responsibilities
- file UCC-1 statements post-lock and store filing numbers for trustee audit
- track loan payments via banking rails; start cure timers, compute delinquency states
- sign messages consumed by smart-contracts/LoanOracle.sol authorizing release or liquidation

Security posture
- runs in isolated environment, hardware security module for signing keys
- dual-control for DEFAULT signals; requires trustee approval per policy
- exports immutable audit bundle for every enforcement action
