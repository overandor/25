smart-contracts workspace

Tooling
- Hardhat (TypeScript) with @nomicfoundation/hardhat-toolbox for compile/test
- Solidity ^0.8.21, optimizer enabled (200 runs)
- Local private Hardhat chain doubles as smoke-test deployment target

Contracts
- contracts/IPCollateralManager.sol: holds ERC-3643 tokens, enforces collateral state transitions controlled by LoanOracle
- contracts/IPNFToken.sol: ERC-3643 security token minted per SPV share class; uses registry/IdentityRegistry + registry/Compliance
- contracts/LoanOracle.sol: verifies svc-legal-oracle signatures, calls IPCollateralManager.release/liquidate
- contracts/registry/IdentityRegistry.sol + Compliance.sol: imported or extended ERC-3643 modules for KYC/AML gating

Tests
- npm run test --workspace smart-contracts executes Hardhat unit tests
- collateralFlow.ts covers provenance gating, borrower lock/release, default and liquidation paths

Scripts
- npm run deploy:local --workspace smart-contracts deploys registry, compliance, IPNFToken, IPCollateralManager, and LoanOracle to the private Hardhat chain for deterministic inspection

Verification log (private Hardhat chain)
- Tests: npm test --workspace smart-contracts (passes)
- Deployment: npm run deploy:local --workspace smart-contracts
  - IdentityRegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  - Compliance: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  - IPNFToken: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  - IPCollateralManager: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
  - LoanOracle: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
