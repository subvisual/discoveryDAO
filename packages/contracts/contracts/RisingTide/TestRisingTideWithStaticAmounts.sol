// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RisingTide} from "./RisingTide.sol";

contract TestRisingTideWithStaticAmounts is RisingTide {
    uint256 private immutable totalInvestors;
    uint256 private immutable amountPerInvestor;
    uint256 private immutable _totalAvailable;
    mapping(uint256 => uint256) allZeros;

    constructor(
        uint256 _totalInvestors,
        uint256 _amountPerInvestor,
        uint256 __totalAvailable
    ) {
        totalInvestors = _totalInvestors;
        amountPerInvestor = _amountPerInvestor;
        _totalAvailable = __totalAvailable;
    }

    function investorCount()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return totalInvestors;
    }

    function investorAmountAt(uint256 i)
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return allZeros[i] + amountPerInvestor;
    }

    function risingTide_totalAllocatedUncapped()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return amountPerInvestor * totalInvestors;
    }

    function risingTide_totalCap()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return _totalAvailable;
    }

    function setCap(uint256 _cap) external {
        _risingTide_setCap(_cap);
    }
}
