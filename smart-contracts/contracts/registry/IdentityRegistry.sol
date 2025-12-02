// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract IdentityRegistry is Ownable {
    mapping(address => bool) private _verified;

    event VerificationUpdated(address indexed account, bool status);

    constructor(address owner_) Ownable(owner_) {}

    function isVerified(address account) external view returns (bool) {
        return _verified[account];
    }

    function setVerification(address account, bool status) external onlyOwner {
        _verified[account] = status;
        emit VerificationUpdated(account, status);
    }
}
