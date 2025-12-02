// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPCollateralManager} from "./IPCollateralManager.sol";

contract LoanOracle is Ownable {
    IPCollateralManager public collateralManager;

    event CollateralManagerUpdated(address indexed manager);

    constructor(address manager, address owner_) Ownable(owner_) {
        collateralManager = IPCollateralManager(manager);
    }

    function setCollateralManager(address manager) external onlyOwner {
        collateralManager = IPCollateralManager(manager);
        emit CollateralManagerUpdated(manager);
    }

    function signalRepayment(bytes32 loanId) external onlyOwner {
        collateralManager.releaseCollateral(loanId);
    }

    function signalDefault(bytes32 loanId) external onlyOwner {
        collateralManager.markInDefault(loanId);
    }

    function signalLiquidation(bytes32 loanId) external onlyOwner {
        collateralManager.liquidateCollateral(loanId);
    }
}
