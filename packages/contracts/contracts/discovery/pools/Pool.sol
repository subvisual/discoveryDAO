// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IPool} from "../interfaces/IPool.sol";
import {IProject} from "../interfaces/IProject.sol";
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
    address controller;
    uint256 investedAmount;

    /// total unique investors
    uint256 _investorCount;

    mapping(address => Investor) investors;

    /// incrementing index => investor address
    mapping(uint256 => address) investorByIndex;

    /// How many tokens have been allocated, before cap calculation
    uint256 public totalUncappedAllocations;

    // Total supply of the project's token up for sale
    uint256 public immutable saleSupply;

    constructor(
        uint256 _saleSupply,
        address _investmentToken,
        address _controller
    ) {
        project = msg.sender;
        saleSupply = _saleSupply;
        investmentToken = _investmentToken;
        controller = _controller;
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

        require(
            IERC20(Controller(controller).paymentToken()).balanceOf(
                address(this)
            ) >= investedAmount + _amount,
            "no tokens were transfered"
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
}
