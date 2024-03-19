// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IPool} from "../interfaces/IPool.sol";
import {IProject} from "../interfaces/IProject.sol";
import {RisingTide} from "../../RisingTide/RisingTide.sol";
import {DateTime} from "../../libraries/DateTime.sol";

import "hardhat/console.sol";

/**
 * TODO users should be able to `buy` into the pool, as long as they meet the conditions
 * (stakerspool is for CTND stakers, peoplespool is for those who have already voted for the project)
 *
 * TODO `buy` is for the Project to be called from the project only
 * TODO other than these requirements, the rest should be very similar to the CTND Sale contract
 */
abstract contract Pool is IPool, RisingTide {
    using DateTime for uint256;
    using SafeERC20 for IERC20;

    struct Investor {
        uint256 uncappedAllocation;
        bool refunded;
    }

    //
    // Events
    //

    /// Emitted for every refund given
    event Refund(address indexed to, uint256 paymentTokenAmount);

    //
    // State
    //

    address public immutable project;

    /// The address of the investment token contract (likely $aUSD)
    address public immutable investmentToken;

    /// total unique investors
    uint256 _investorCount;

    mapping(address => Investor) investors;

    /// incrementing index => investor address
    mapping(uint256 => address) investorByIndex;

    /// How many tokens have been allocated, before cap calculation
    uint256 public totalUncappedAllocations;

    // Total supply of the project's token up for sale
    uint256 public immutable saleSupply;

    uint256 public cliffMonths;
    uint256 public vestingMonths;
    uint256 public vestingStart;

    constructor(
        uint256 _saleSupply,
        address _investmentToken,
        uint256 _cliffMonths,
        uint256 _vestingMonths
    ) {
        project = msg.sender;
        saleSupply = _saleSupply;
        investmentToken = _investmentToken;
        cliffMonths = _cliffMonths;
        vestingMonths = _vestingMonths;
        vestingStart = block.timestamp;
    }

    modifier onlyProject() {
        require(msg.sender == project, "not project");
        _;
    }

    /// TODO: Should this be in RisingTide?
    /// Ensures the individual cap is already calculated
    modifier capCalculated() {
        require(risingTide_isValidCap(), "cap not yet set");
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
        if (investors[_investor].uncappedAllocation == 0) {
            investorByIndex[_investorCount] = _investor;
            _investorCount++;
        }
        uint256 investedAmount = IProject(project).investmentTokenToToken(
            _amount
        );

        investors[_investor].uncappedAllocation += investedAmount;
        totalUncappedAllocations += investedAmount;
        IERC20(investmentToken).safeTransferFrom(
            _investor,
            address(this),
            _amount
        );
    }

    function setIndividualCap(uint256 _cap) external {
        _risingTide_setCap(_cap);
    }

    /// @inheritdoc IPool
    function refund(address _to) external override(IPool) capCalculated {
        Investor storage investor = investors[_to];
        require(!investor.refunded, "already refunded");

        uint256 amount = refundableAmount(_to);
        require(amount > 0, "No tokens to refund");

        investor.refunded = true;
        IERC20(investmentToken).transfer(_to, amount);

        emit Refund(_to, amount);
    }

    /// @inheritdoc IPool
    function refundableAmount(address _to)
        public
        view
        override(IPool)
        returns (uint256)
    {
        // TODO: Should ignore rising tide if project lost
        if (!risingTide_isValidCap()) {
            return 0;
        }

        uint256 uncapped = investors[_to].uncappedAllocation;
        uint256 capped = allocation(_to);

        return IProject(project).tokenToInvestmentToken(uncapped - capped);
    }

    function withdrawn(address _to)
        public
        view
        virtual
        override(IPool)
        returns (uint256)
    {
        revert("not implemented");
    }

    function withdrawable(address to)
        public
        view
        override(IPool)
        returns (uint256)
    {
        uint256 localWithdrawn = withdrawn(to);
        uint256 total = allocation(to);
        uint256 elapsed = _numberOfPeriodsElapsed();
        uint256 cliff = cliffMonths;
        uint256 vesting = vestingMonths;

        if (total == 0) {
            return 0;
        }

        if (cliff >= elapsed) {
            return 0;
        }

        if (elapsed >= vesting + cliff) {
            return total - localWithdrawn;
        }

        uint256 perMonth = total / vesting;
        return (perMonth * (elapsed - cliff)) - localWithdrawn;
    }

    /// @inheritdoc IPool
    function uncappedAllocation(address _to)
        external
        view
        override(IPool)
        returns (uint256 amount)
    {
        return investors[_to].uncappedAllocation;
    }

    /// @inheritdoc IPool
    function allocation(address _to)
        public
        view
        override(IPool)
        returns (uint256 amount)
    {
        return risingTide_applyCap(investors[_to].uncappedAllocation);
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

        return investors[addr].uncappedAllocation;
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

    //
    // Internal API
    //

    /**
     * Calculates the number of periods elapsed since the cliff start.
     *
     * Each period is the beginning of each month and will be passed in as a
     * parameter to the contract
     *
     * @return The number of periods elapsed since the cliff start
     */
    function _numberOfPeriodsElapsed() internal view returns (uint256) {
        uint256 startTime = vestingStart;
        if (startTime == 0) {
            return 0;
        }

        if (block.timestamp < startTime) {
            return 0;
        } else {
            uint256 beginningOfMonth = DateTime.timestampFromDate(
                block.timestamp.getYear(),
                block.timestamp.getMonth(),
                1
            );
            uint256 beginningOfMonthStartTime = DateTime.timestampFromDate(
                startTime.getYear(),
                startTime.getMonth(),
                1
            );
            return
                DateTime.diffMonths(
                    beginningOfMonthStartTime,
                    beginningOfMonth
                ) + 1;
        }
    }
}
