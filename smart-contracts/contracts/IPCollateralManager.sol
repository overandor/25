// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract IPCollateralManager is Ownable {
    enum CollateralState {
        Unencumbered,
        Encumbered,
        InDefault,
        Liquidated
    }

    struct Position {
        address borrower;
        address lender;
        address ipToken;
        uint256 tokenId;
        CollateralState state;
    }

    mapping(bytes32 => Position) private _positions;
    address public loanOracle;

    event CollateralLocked(bytes32 indexed loanId, address indexed borrower, address indexed lender, address ipToken, uint256 tokenId);
    event CollateralReleased(bytes32 indexed loanId);
    event CollateralDefaulted(bytes32 indexed loanId);
    event CollateralLiquidated(bytes32 indexed loanId, address indexed recipient);
    event LoanOracleUpdated(address indexed loanOracle);

    constructor(address owner_) Ownable(owner_) {}

    modifier onlyLoanOracle() {
        require(msg.sender == loanOracle, "NOT_ORACLE");
        _;
    }

    function setLoanOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "ORACLE_ZERO");
        loanOracle = oracle;
        emit LoanOracleUpdated(oracle);
    }

    function getPosition(bytes32 loanId) external view returns (Position memory) {
        return _positions[loanId];
    }

    function lockCollateral(bytes32 loanId, address lender, address ipToken, uint256 tokenId) external {
        require(loanId != bytes32(0), "EMPTY_LOAN_ID");
        require(lender != address(0), "LENDER_ZERO");
        require(ipToken != address(0), "TOKEN_ZERO");

        Position storage position = _positions[loanId];
        require(position.borrower == address(0), "POSITION_EXISTS");
        IERC721(ipToken).transferFrom(msg.sender, address(this), tokenId);
        _positions[loanId] = Position({
            borrower: msg.sender,
            lender: lender,
            ipToken: ipToken,
            tokenId: tokenId,
            state: CollateralState.Encumbered
        });
        emit CollateralLocked(loanId, msg.sender, lender, ipToken, tokenId);
    }

    function releaseCollateral(bytes32 loanId) external onlyLoanOracle {
        Position storage position = _positions[loanId];
        require(position.borrower != address(0), "UNKNOWN_POSITION");
        require(position.state == CollateralState.Encumbered, "BAD_STATE");
        position.state = CollateralState.Unencumbered;
        IERC721(position.ipToken).transferFrom(address(this), position.borrower, position.tokenId);
        emit CollateralReleased(loanId);
        delete _positions[loanId];
    }

    function markInDefault(bytes32 loanId) external onlyLoanOracle {
        Position storage position = _positions[loanId];
        require(position.borrower != address(0), "UNKNOWN_POSITION");
        require(position.state == CollateralState.Encumbered, "BAD_STATE");
        position.state = CollateralState.InDefault;
        emit CollateralDefaulted(loanId);
    }

    function liquidateCollateral(bytes32 loanId) external onlyLoanOracle {
        Position storage position = _positions[loanId];
        require(position.lender != address(0), "UNKNOWN_POSITION");
        require(position.state == CollateralState.InDefault, "BAD_STATE");
        position.state = CollateralState.Liquidated;
        IERC721(position.ipToken).transferFrom(address(this), position.lender, position.tokenId);
        emit CollateralLiquidated(loanId, position.lender);
        delete _positions[loanId];
    }
}
