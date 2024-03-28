// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {ISale} from "../token/Sale.sol";

/**
 * An ERC20 token meant for testing purposes (free minting & burning)
 */
contract MockSale is ISale, ERC165 {
    //
    // ISale
    //
    mapping(address => uint256) public override(ISale) allocation;
    mapping(address => uint256) public override(ISale) refundAmount;
    mapping(string => uint256) public calls;

    address public paymentToken;

    function paymentTokenToToken(uint256 _x)
        external
        pure
        override(ISale)
        returns (uint256)
    {
        return _x;
    }

    function tokenToPaymentToken(uint256 _x)
        external
        pure
        override(ISale)
        returns (uint256)
    {
        return _x;
    }

    function buy(uint256) external pure {
        revert("not implemented");
    }

    function refund(address) external {
        calls["refund"]++;
        return;
    }

    function uncappedAllocation(address to)
        external
        view
        override(ISale)
        returns (uint256)
    {
        return allocation[to];
    }

    function setIndividualCap(uint256) external pure {
        revert("not implemented");
    }

    function withdraw() external pure {
        revert("not implemented");
    }

    //
    // Test functions
    //

    function test_addAllocation(address to, uint256 amount) external {
        allocation[to] += amount;
    }

    function test_addRefund(address to, uint256 amount) external {
        refundAmount[to] += amount;
    }

    function test_Called(string calldata name, uint256 amount)
        external
        view
        returns (bool)
    {
        return calls[name] == amount;
    }

    //
    // ERC165
    //
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165)
        returns (bool)
    {
        return
            interfaceId == type(ISale).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
