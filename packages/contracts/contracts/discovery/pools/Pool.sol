// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IPool} from "../interfaces/IPool.sol";
import {RisingTide} from "../../RisingTide/RisingTide.sol";

import {Controller} from "../Controller.sol";

/**
 * TODO users should be able to `buy` into the pool, as long as they meet the conditions
 * (stakerspool is for CTND stakers, peoplespool is for those who have already voted for the project)
 *
 * TODO `buy` is for the Project to be called from the project only
 * TODO other than these requirements, the rest should be very similar to the CTND Sale contract
 */
abstract contract Pool is IPool, RisingTide {
    address project;
    address controller;
    uint256 investedAmount;

    /// total unique investors
    uint256 public _investorCount;

    mapping(address => uint256) investorBalances;

    /// incrementing index => investor address
    mapping(uint256 => address) investorByIndex;

    /// How many tokens have been allocated, before cap calculation
    uint256 public totalUncappedAllocations;

    // Total supply of the project's token up for sale
    uint256 public immutable saleSupply;

    constructor(uint256 _saleSupply, address _controller) {
        project = msg.sender;
        saleSupply = _saleSupply;
        controller = _controller;
    }

    modifier onlyProject() {
        require(msg.sender == project, "not project");
        _;
    }

    modifier onlyController() {
        require(msg.sender == controller, "not controller");
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


        require(
            IERC20(Controller(controller).paymentToken()).balanceOf(
                address(this)
            ) >= investedAmount + _amount
        );
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
        returns (uint256 amount)
    {
        revert("not yet implemented");
    }

    /// @inheritdoc IPool
    function uncappedAllocation(address _to)
        external
        view
        override(IPool)
        returns (uint256 amount)
    {
        revert("not yet implemented");
    }

    /// @inheritdoc IPool
    function allocation(address _to)
        external
        view
        override(IPool)
        returns (uint256 amount)
    {
        revert("not yet implemented");
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
