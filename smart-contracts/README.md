Solidity workspace (Hardhat) for collateral logic.
- contracts/IPCollateralManager.sol: escrow + state transitions.
- contracts/IPNFToken.sol: ERC-3643-compliant SPV share token.
- contracts/LoanOracle.sol: privileged handler for svc-legal-oracle.
- contracts/registry/IdentityRegistry.sol and Compliance.sol: ERC-3643 components.
- scripts/: deployment + upgrade tasks.
- test/: Hardhat/Foundry parity tests.
