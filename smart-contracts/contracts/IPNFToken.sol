// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// This is not the IP itself. It's an ERC-3643 (T-REX) permissioned token
// that legally represents 100% of the shares in the SPV that owns the IP.
contract IPNFToken is ERC721 {
    constructor() ERC721("IPNFToken", "IPNFT") {}
}
