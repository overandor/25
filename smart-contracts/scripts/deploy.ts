import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const registry = await IdentityRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const Compliance = await ethers.getContractFactory("Compliance");
  const compliance = await Compliance.deploy(await registry.getAddress(), deployer.address);
  await compliance.waitForDeployment();

  const IPNFToken = await ethers.getContractFactory("IPNFToken");
  const ipnft = await IPNFToken.deploy(await registry.getAddress(), await compliance.getAddress(), deployer.address);
  await ipnft.waitForDeployment();
  await (await ipnft.setMinter(deployer.address, true)).wait();

  const IPCollateralManager = await ethers.getContractFactory("IPCollateralManager");
  const manager = await IPCollateralManager.deploy(deployer.address);
  await manager.waitForDeployment();

  const LoanOracle = await ethers.getContractFactory("LoanOracle");
  const oracle = await LoanOracle.deploy(await manager.getAddress(), deployer.address);
  await oracle.waitForDeployment();
  await (await manager.setLoanOracle(await oracle.getAddress())).wait();

  console.log("IdentityRegistry:", await registry.getAddress());
  console.log("Compliance:", await compliance.getAddress());
  console.log("IPNFToken:", await ipnft.getAddress());
  console.log("IPCollateralManager:", await manager.getAddress());
  console.log("LoanOracle:", await oracle.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
