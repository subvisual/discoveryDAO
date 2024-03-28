// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {ISale} from "./ISale.sol";
import {IVesting} from "./IVesting.sol";
import {DateTime} from "../libraries/DateTime.sol";

contract Vesting is IVesting, AccessControl, ReentrancyGuard {
    using DateTime for uint256;
    using SafeERC20 for IERC20;
    using ERC165Checker for address;

    //
    // Structs
    //

    struct PrivateAllocation {
        uint256 amount;
        uint256 claimedAmount;
        uint256 cliffMonths;
        uint256 vestingMonths;
    }

    //
    // State
    //

    /// @inheritdoc IVesting
    mapping(address => uint256) public override(IVesting) claimed;

    mapping(address => PrivateAllocation) public privateAllocations;

    mapping(uint64 => bool) public usedNonces;

    address public immutable token;
    uint256 public immutable publicSaleVestingMonths;
    uint256 public immutable publicSaleCliffMonths;
    uint256 public immutable privateSaleCap;
    uint256 public totalPrivateSales;
    uint256 public startTime;
    address[] public sales;

    uint256 public constant PRIVATE_SALE_MAX_CLIFF_MONTHS = 6;
    bytes32 public constant SALE_MANAGER_ROLE = keccak256("SALE_MANAGER_ROLE");

    event ClaimVesting(address indexed to, uint256 amount);
    event AddSale(address indexed saleContract);

    /// @param _publicSaleVestingMonths Number of months of vesting for the public sale
    /// @param _token Address for the CTND token contract
    /// @param _sales Addresses for the initial sales contracts
    /// @param _privateSaleCap Total cap for the private sale
    constructor(
        uint256 _publicSaleVestingMonths,
        address _token,
        address[] memory _sales,
        uint256 _privateSaleCap
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SALE_MANAGER_ROLE, msg.sender);

        publicSaleVestingMonths = _publicSaleVestingMonths;
        publicSaleCliffMonths = 0;
        token = _token;
        privateSaleCap = _privateSaleCap;

        for (uint256 i = 0; i < _sales.length; ++i) {
            addSale(_sales[i]);
        }
    }

    modifier useNonce(uint64 nonce) {
        require(!usedNonces[nonce], "nonce already used");
        usedNonces[nonce] = true;
        _;
    }

    //
    // IVesting
    //
    /// @inheritdoc IVesting
    function totalAllocated(address to)
        external
        view
        override(IVesting)
        returns (uint256)
    {
        return totalAllocatedPublic(to) + totalAllocatedPrivate(to);
    }

    /// @inheritdoc IVesting
    function claimable(address to)
        public
        view
        override(IVesting)
        returns (uint256)
    {
        return claimablePublic(to) + claimablePrivate(to);
    }

    /// @inheritdoc IVesting
    function claim(address to) external override(IVesting) nonReentrant {
        uint256 claimableAmount = claimable(to);
        require(claimableAmount > 0, "No claimable amount");

        claimed[to] += claimableAmount;

        IERC20(token).transfer(to, claimableAmount);

        emit ClaimVesting(to, claimableAmount);
    }

    /// @inheritdoc IVesting
    function refund(address to) external override(IVesting) nonReentrant {
        uint256 len = sales.length;
        for (uint256 i = 0; i < len; i++) {
            address saleAddress = sales[i];
            ISale(saleAddress).refund(to);
        }
    }

    //
    // Admin API
    //

    /**
     * Adds an address to the list of sale contracts. Can only be called by the
     * admin.
     * The sale contract must implement ISale and ERC165
     *
     * @param _sale The address of the sale contract
     */
    function addSale(address _sale)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        require(
            _sale.supportsInterface(type(ISale).interfaceId),
            "not an ISale"
        );

        sales.push(_sale);

        emit AddSale(_sale);
    }

    /// @inheritdoc IVesting
    function createPrivateSaleVest(
        address to,
        uint256 amount,
        uint16 cliffMonths,
        uint16 vestingMonths,
        uint64 nonce
    )
        external
        override(IVesting)
        onlyRole(SALE_MANAGER_ROLE)
        nonReentrant
        useNonce(nonce)
    {
        require(
            cliffMonths <= PRIVATE_SALE_MAX_CLIFF_MONTHS,
            "Cliff months too big"
        );
        require(
            totalPrivateSales + amount <= privateSaleCap,
            "Private sale cap reached"
        );
        PrivateAllocation storage vesting = privateAllocations[to];
        require(
            vesting.amount == 0 || vesting.cliffMonths == cliffMonths,
            "vesting already exists with different cliff"
        );
        require(
            vesting.amount == 0 || vesting.vestingMonths == vestingMonths,
            "vesting already exists with different vesting period"
        );
        require(vestingMonths >= publicSaleVestingMonths, "vesting too short");

        vesting.cliffMonths = cliffMonths;
        vesting.vestingMonths = vestingMonths;
        vesting.amount += amount;

        totalPrivateSales += amount;
    }

    function setStartTime(uint256 _startTime)
        public
        onlyRole(SALE_MANAGER_ROLE)
    {
        require(startTime == 0, "start time already set");
        startTime = _startTime;
    }

    //
    // Other Public API
    //

    function totalAllocatedPublic(address to) public view returns (uint256) {
        uint256 total = 0;
        uint256 len = sales.length;

        for (uint256 i = 0; i < len; i++) {
            total += ISale(sales[i]).allocation(to);
        }

        return total;
    }

    function totalAllocatedPrivate(address to) public view returns (uint256) {
        return privateAllocations[to].amount;
    }

    function claimablePublic(address to) public view returns (uint256) {
        uint256 localClaimed = claimed[to];
        uint256 total = totalAllocatedPublic(to);
        uint256 elapsed = _numberOfPeriodsElapsed();
        uint256 cliff = publicSaleCliffMonths;
        uint256 vesting = publicSaleVestingMonths;

        if (total == 0) {
            return 0;
        }

        if (cliff >= elapsed) {
            return 0;
        }

        if (elapsed >= vesting + cliff) {
            return total - localClaimed;
        }

        uint256 perMonth = total / vesting;
        return (perMonth * (elapsed - cliff)) - localClaimed;
    }

    function claimablePrivate(address to) public view returns (uint256) {
        PrivateAllocation storage allocation = privateAllocations[to];
        uint256 localClaimed = claimed[to];
        uint256 total = allocation.amount;
        uint256 elapsed = _numberOfPeriodsElapsed();
        uint256 cliff = allocation.cliffMonths;
        uint256 vesting = allocation.vestingMonths;

        if (total == 0) {
            return 0;
        }

        if (cliff >= elapsed) {
            return 0;
        }

        if (elapsed >= vesting + cliff) {
            return total - localClaimed;
        }

        uint256 perMonth = total / vesting;
        return (perMonth * (elapsed - cliff)) - localClaimed;
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
