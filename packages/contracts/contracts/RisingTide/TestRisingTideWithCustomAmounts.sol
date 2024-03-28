// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RisingTide} from "./RisingTide.sol";

contract TestRisingTideWithCustomAmounts is RisingTide {
    uint256 immutable _maxTotalInvestment;

    uint256 private totalInvestors;
    mapping(uint256 => uint256) private investors;
    uint256 private _totalAllocatedUncapped;

    constructor(uint256 __maxTotalInvestment) {
        _maxTotalInvestment = __maxTotalInvestment;
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
        return investors[i];
    }

    function risingTide_totalAllocatedUncapped()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return _totalAllocatedUncapped;
    }

    function risingTide_totalCap()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return _maxTotalInvestment;
    }

    function test_invest(uint256 i, uint256 amount) external {
        if (investors[i] == 0) {
            totalInvestors++;
        }

        investors[i] += amount;
        _totalAllocatedUncapped += amount;
    }

    function setCap(uint256 _cap) external {
        _risingTide_setCap(_cap);
    }
}
