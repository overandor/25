// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IdentityRegistry} from "./IdentityRegistry.sol";

contract Compliance is Ownable {
    IdentityRegistry public identityRegistry;

    event IdentityRegistryUpdated(address indexed registry);

    constructor(address registry, address owner_) Ownable(owner_) {
        identityRegistry = IdentityRegistry(registry);
    }

    function setIdentityRegistry(address registry) external onlyOwner {
        identityRegistry = IdentityRegistry(registry);
        emit IdentityRegistryUpdated(registry);
    }

    function canTransfer(address from, address to) external view returns (bool) {
        if (from != address(0) && !identityRegistry.isVerified(from)) {
            return false;
        }
        if (to != address(0) && !identityRegistry.isVerified(to)) {
            return false;
        }
        return true;
    }
}
