import { expect } from "chai";
import { ethers } from "hardhat";
import { IPNFToken } from "../typechain-types";

describe("IP Collateral pipeline", function () {
  async function deployFixture() {
    const [deployer, borrower, lender, trustee] = await ethers.getSigners();

    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const registry = await IdentityRegistry.deploy(deployer.address);

    const Compliance = await ethers.getContractFactory("Compliance");
    const compliance = await Compliance.deploy(await registry.getAddress(), deployer.address);

    const IPNFTokenFactory = await ethers.getContractFactory("IPNFToken");
    const ipnft = (await IPNFTokenFactory.deploy(
      await registry.getAddress(),
      await compliance.getAddress(),
      deployer.address
    )) as IPNFToken;
    await ipnft.setMinter(deployer.address, true);

    const IPCollateralManager = await ethers.getContractFactory("IPCollateralManager");
    const manager = await IPCollateralManager.deploy(deployer.address);

    const LoanOracle = await ethers.getContractFactory("LoanOracle");
    const oracle = await LoanOracle.deploy(await manager.getAddress(), trustee.address);
    await manager.setLoanOracle(await oracle.getAddress());

    for (const signer of [borrower.address, lender.address, await manager.getAddress()]) {
      await registry.setVerification(signer, true);
    }

    return { registry, compliance, ipnft, manager, oracle, deployer, borrower, lender, trustee };
  }

  it("locks, releases, and enforces compliance", async function () {
    const { ipnft, manager, oracle, borrower, lender, trustee, registry } = await deployFixture();

    await registry.setVerification(borrower.address, true);
    await registry.setVerification(lender.address, true);
    await registry.setVerification(await manager.getAddress(), true);

    const metadata = {
      jurisdiction: "US-DE",
      governingLaw: "NY",
      ipType: "software_copyright",
      rightsScope: "full_title",
      dataURI: "ipfs://manifest",
      merkleRoot: ethers.encodeBytes32String("root"),
      appraisedValueUsd: 3367n,
      maxLtvBps: 3000
    };

    await ipnft.setMinter(borrower.address, true);

    await expect(ipnft.connect(borrower).mint(borrower.address, metadata)).to.emit(ipnft, "MetadataRecorded");

    await expect(
      ipnft.connect(borrower).transferFrom(borrower.address, trustee.address, 1)
    ).to.be.revertedWith("COMPLIANCE_REJECTED");

    await registry.setVerification(trustee.address, true);
    await ipnft.connect(borrower).approve(await manager.getAddress(), 1);

    const loanId = ethers.id("loan-one");
    await expect(manager.connect(borrower).lockCollateral(loanId, lender.address, await ipnft.getAddress(), 1)).to.emit(
      manager,
      "CollateralLocked"
    );

    await expect(manager.releaseCollateral(loanId)).to.be.revertedWith("NOT_ORACLE");

    await expect(oracle.connect(trustee).signalRepayment(loanId)).to.emit(manager, "CollateralReleased");
  });

  it("marks default then liquidates", async function () {
    const { ipnft, manager, oracle, borrower, lender, trustee, registry } = await deployFixture();

    for (const addr of [borrower.address, lender.address, trustee.address, await manager.getAddress()]) {
      await registry.setVerification(addr, true);
    }

    await ipnft.setMinter(borrower.address, true);
    const metadata = {
      jurisdiction: "US-DE",
      governingLaw: "NY",
      ipType: "software_copyright",
      rightsScope: "full_title",
      dataURI: "ipfs://manifest2",
      merkleRoot: ethers.encodeBytes32String("root2"),
      appraisedValueUsd: 5000n,
      maxLtvBps: 2500
    };
    await ipnft.connect(borrower).mint(borrower.address, metadata);
    await ipnft.connect(borrower).approve(await manager.getAddress(), 1);

    const loanId = ethers.id("loan-two");
    await manager.connect(borrower).lockCollateral(loanId, lender.address, await ipnft.getAddress(), 1);

    await expect(oracle.connect(trustee).signalLiquidation(loanId)).to.be.revertedWith("BAD_STATE");
    await oracle.connect(trustee).signalDefault(loanId);
    await expect(oracle.connect(trustee).signalLiquidation(loanId)).to.emit(manager, "CollateralLiquidated");

    expect(await ipnft.ownerOf(1)).to.equal(lender.address);
  });

  it("rejects malformed inputs and unknown loans", async function () {
    const { manager, oracle, lender, borrower, registry, ipnft, trustee } = await deployFixture();

    await registry.setVerification(borrower.address, true);
    await registry.setVerification(lender.address, true);
    await registry.setVerification(await manager.getAddress(), true);
    await ipnft.setMinter(borrower.address, true);

    const metadata = {
      jurisdiction: "US-DE",
      governingLaw: "NY",
      ipType: "software_copyright",
      rightsScope: "full_title",
      dataURI: "ipfs://manifest3",
      merkleRoot: ethers.encodeBytes32String("root3"),
      appraisedValueUsd: 4000n,
      maxLtvBps: 2000
    };

    await ipnft.connect(borrower).mint(borrower.address, metadata);
    await ipnft.connect(borrower).approve(await manager.getAddress(), 1);

    await expect(
      manager.connect(borrower).lockCollateral(ethers.ZeroHash, lender.address, await ipnft.getAddress(), 1)
    ).to.be.revertedWith("EMPTY_LOAN_ID");

    await expect(
      manager.connect(borrower).lockCollateral(ethers.id("loan-err"), ethers.ZeroAddress, await ipnft.getAddress(), 1)
    ).to.be.revertedWith("LENDER_ZERO");

    const goodLoanId = ethers.id("loan-ok");
    await manager.connect(borrower).lockCollateral(goodLoanId, lender.address, await ipnft.getAddress(), 1);

    await expect(oracle.connect(trustee).signalDefault(ethers.id("unknown"))).to.be.revertedWith("UNKNOWN_POSITION");
    await expect(oracle.connect(trustee).signalLiquidation(ethers.id("unknown"))).to.be.revertedWith("UNKNOWN_POSITION");
  });
});
