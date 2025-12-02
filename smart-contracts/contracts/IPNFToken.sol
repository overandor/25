// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Compliance} from "./registry/Compliance.sol";
import {IdentityRegistry} from "./registry/IdentityRegistry.sol";

contract IPNFToken is ERC721, Ownable {
    struct IPMetadata {
        string jurisdiction;
        string governingLaw;
        string ipType;
        string rightsScope;
        string dataURI;
        bytes32 merkleRoot;
        uint256 appraisedValueUsd;
        uint16 maxLtvBps;
    }

    uint256 private _nextTokenId = 1;
    Compliance public compliance;
    IdentityRegistry public identityRegistry;
    mapping(uint256 => IPMetadata) private _ipMetadata;
    mapping(address => bool) public minters;

    event MetadataRecorded(uint256 indexed tokenId, IPMetadata metadata);
    event MinterUpdated(address indexed minter, bool allowed);

    constructor(address registry, address complianceAddr, address owner_) ERC721("IPNFToken", "IPNFT") Ownable(owner_) {
        identityRegistry = IdentityRegistry(registry);
        compliance = Compliance(complianceAddr);
    }

    function setMinter(address minter, bool allowed) external onlyOwner {
        minters[minter] = allowed;
        emit MinterUpdated(minter, allowed);
    }

    function setCompliance(address complianceAddr) external onlyOwner {
        compliance = Compliance(complianceAddr);
    }

    function setIdentityRegistry(address registry) external onlyOwner {
        identityRegistry = IdentityRegistry(registry);
    }

    function mint(address to, IPMetadata calldata metadata) external returns (uint256 tokenId) {
        require(minters[msg.sender], "NOT_MINTER");
        tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(to, tokenId);
        _ipMetadata[tokenId] = metadata;
        emit MetadataRecorded(tokenId, metadata);
    }

    function ipMetadata(uint256 tokenId) external view returns (IPMetadata memory) {
        address currentOwner = _ownerOf(tokenId);
        require(currentOwner != address(0), "NONEXISTENT");
        return _ipMetadata[tokenId];
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(compliance.canTransfer(from, to), "COMPLIANCE_REJECTED");
        return super._update(to, tokenId, auth);
    }
}
