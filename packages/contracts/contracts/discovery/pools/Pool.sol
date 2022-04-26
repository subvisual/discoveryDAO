// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IPool} from "../interfaces/IPool.sol";
import {RisingTide} from "../../RisingTide/RisingTide.sol";

import "hardhat/console.sol";

/**
 * TODO users should be able to `buy` into the pool, as long as they meet the conditions
 * (stakerspool is for CTND stakers, peoplespool is for those who have already voted for the project)
 *
 * TODO `buy` is for the Project to be called from the project only
 * TODO other than these requirements, the rest should be very similar to the CTND Sale contract
 */
abstract contract Pool is IPool, RisingTide {
    address project;

    /// total unique investors
    uint256 public _investorCount;

    mapping(address => uint256) investorBalances;

    /// incrementing index => investor address
    mapping(uint256 => address) investorByIndex;

    /// How many tokens have been allocated, before cap calculation
    uint256 public totalUncappedAllocations;

    // Total supply of the project's token up for sale
    uint256 public immutable saleSupply;

    constructor(uint256 _saleSupply) {
        project = msg.sender;
        saleSupply = _saleSupply;
    }

    modifier onlyProject() {
        require(msg.sender == project, "not project");
        _;
    }

    //
    // IPool
    //

    /// @inheritdoc IPool
    function invest(address _investor, uint256 _amount)
        external
        override(IPool)
        onlyProject
    {
        if (investorBalances[_investor] == 0) {
            investorByIndex[_investorCount] = _investor;
            _investorCount++;
        }

        investorBalances[_investor] += _amount;
        totalUncappedAllocations += _amount;
    }

    function setIndividualCap(uint256 _cap) external {
        _risingTide_setCap(_cap);
    }

    /// @inheritdoc IPool
    function refund(address _to) external override(IPool) {
        revert("not yet implemented");
    }

    /// @inheritdoc IPool
    function refundAmount(address _to)
        external
        view
        override(IPool)
        returns (uint256)
    {
        // TODO: Should ignore rising tide if project lost
        if (!risingTide_isValidCap()) {
            return 0;
        }

        uint256 uncapped = investorBalances[_to];
        uint256 capped = allocation(_to);

        return uncapped - capped;
    }

    /// @inheritdoc IPool
    function uncappedAllocation(address _to)
        external
        view
        override(IPool)
        returns (uint256 amount)
    {
        return investorBalances[_to];
    }

    /// @inheritdoc IPool
    function allocation(address _to)
        public
        view
        override(IPool)
        returns (uint256 amount)
    {
        return _applyCap(investorBalances[_to]);
    }

    //
    // Internal API
    //

    /**
     * Applies the individual cap to the given amount
     *
     * @param _amount amount to apply cap to
     * @return capped amount
     */
    function _applyCap(uint256 _amount) internal view returns (uint256) {
        if (!risingTide_isValidCap()) {
            return 0;
        }

        if (_amount >= individualCap) {
            return individualCap;
        }

        return _amount;
    }

    //
    // RisingTide
    //

    /// @inheritdoc RisingTide
    function investorCount()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return _investorCount;
    }

    /// @inheritdoc RisingTide
    function investorAmountAt(uint256 i)
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        address addr = investorByIndex[i];

        return investorBalances[addr];
    }

    /// @inheritdoc RisingTide
    function risingTide_totalAllocatedUncapped()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return totalUncappedAllocations;
    }

    /// @inheritdoc RisingTide
    function risingTide_totalCap()
        public
        view
        override(RisingTide)
        returns (uint256)
    {
        return saleSupply;
    }
}
