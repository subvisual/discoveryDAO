// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.12;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

import {ISale} from "./ISale.sol";
import {IVesting} from "./IVesting.sol";
import {DateTime} from "../libraries/DateTime.sol";

contract Vesting is IVesting, AccessControl {
    using DateTime for uint256;
    using SafeERC20 for IERC20;

    enum AccountType {
        Empty,
        PublicSale,
        PrivateSale
    }

    struct Account {
        uint256 totalAmount;
        uint256 claimedAmount;
        uint256 cliffMonths;
        uint256 vestingMonths;
        AccountType accountType;
    }

    mapping(address => Account) public accounts;

    address public immutable token;
    uint256 public immutable startTime;
    uint256 public immutable publicSaleVestingMonths;
    uint256 public immutable publicSaleCliffMonths;
    uint256 public immutable privateSaleCap;
    uint256 public totalPrivateSales;
    address[] public saleAddresses;

    uint256 public constant PRIVATE_SALE_VESTING_MONTHS = 36;
    uint256 public constant PRIVATE_SALE_MAX_CLIFF_MONTHS = 6;

    bytes32 public constant PRIVATE_SELLER = keccak256("private_seller");
    bytes32 public constant SALE_CONTRACT = keccak256("sale_contract");

    event VestingCreated(
        address indexed to,
        uint256 amount,
        AccountType accountType
    );
    event VestingClaimed(address indexed to, uint256 amount);

    /// @param _publicSaleVestingMonths Number of months of vesting for the public sale
    /// @param _token Address for the CTND token contract
    /// @param _saleAddresses Addresses for the initial sales contracts
    /// @param _startTime Start time of the vesting
    /// @param _privateSaleCap Total cap for the private sale
    constructor(
        uint256 _publicSaleVestingMonths,
        address _token,
        address[] memory _saleAddresses,
        uint256 _startTime,
        uint256 _privateSaleCap
    ) {
        publicSaleVestingMonths = _publicSaleVestingMonths;
        publicSaleCliffMonths = 0;
        token = _token;
        saleAddresses = _saleAddresses;
        startTime = _startTime;
        privateSaleCap = _privateSaleCap;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @inheritdoc ISale
    function addSale(address _saleAddress)
        public
        override(IVesting)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_saleAddress != address(0));

        saleAddresses.push(_saleAddress);
    }

    /// @inheritdoc ISale
    function totalVested(address to)
        external
        view
        override(IVesting)
        returns (uint256)
    {
        uint256 totalAllocated = _totalAllocated(to);
        uint256 periodsElapsed = _numberOfPeriodsElapsed();

        if (periodsElapsed >= publicSaleVestingMonths) {
            return totalAllocated;
        } else {
            uint256 vestingPerMonth = totalAllocated / publicSaleVestingMonths;
            return vestingPerMonth * periodsElapsed;
        }
    }

    /// @inheritdoc ISale
    function claimed(address to)
        external
        view
        override(IVesting)
        returns (uint256)
    {
        Account storage account = accounts[to];
        return account.claimedAmount;
    }

    /// @inheritdoc ISale
    function claimable(address to)
        public
        view
        override(IVesting)
        returns (uint256)
    {
        Account storage account = accounts[to];
        uint256 totalAllocated;

        if (account.totalAmount == 0) {
            totalAllocated = _totalAllocated(to);
        } else {
            totalAllocated = account.totalAmount;
        }

        uint256 periodsElapsed = _numberOfPeriodsElapsed();

        if (totalAllocated == 0) {
            return 0;
        }

        if (account.cliffMonths >= periodsElapsed) {
            return 0;
        }

        if (periodsElapsed >= account.vestingMonths + account.cliffMonths) {
            return totalAllocated - account.claimedAmount;
        }

        uint256 vestingPerMonth = totalAllocated / account.vestingMonths;
        return
            (vestingPerMonth * (periodsElapsed - account.cliffMonths)) -
            account.claimedAmount;
    }

    /// @inheritdoc ISale
    function claim(address to) external override(IVesting) {
        uint256 claimableAmount = claimable(to);
        require(claimableAmount > 0, "No claimable amount");

        Account storage account = accounts[to];

        account.claimedAmount += claimableAmount;
        IERC20(token).transfer(to, claimableAmount);

        emit VestingClaimed(to, claimableAmount);
    }

    /// @inheritdoc ISale
    function createPublicSaleVest(address to)
        external
        override(IVesting)
        onlyRole(SALE_CONTRACT)
    {
        Account storage account = accounts[to];
        require(
            account.accountType != AccountType.PrivateSale,
            "Account already has private vesting"
        );

        account.cliffMonths = 0;
        account.vestingMonths = publicSaleVestingMonths;
        account.accountType = AccountType.PublicSale;
    }

    /// @inheritdoc ISale
    function createPrivateSaleVest(
        address to,
        uint256 amount,
        uint16 cliffMonths
    ) external override(IVesting) onlyRole(PRIVATE_SELLER) {
        require(
            cliffMonths <= PRIVATE_SALE_MAX_CLIFF_MONTHS,
            "Cliff months too big"
        );
        require(
            totalPrivateSales + amount <= privateSaleCap,
            "Private sale cap reached"
        );
        Account storage account = accounts[to];
        require(
            account.accountType != AccountType.PublicSale,
            "Account already has public vesting"
        );

        account.totalAmount += amount;
        account.cliffMonths = cliffMonths;
        account.vestingMonths = PRIVATE_SALE_VESTING_MONTHS;
        account.accountType = AccountType.PrivateSale;

        totalPrivateSales += amount;

        emit VestingCreated(to, amount, account.accountType);
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

    /**
     * Gets the total amount of tokens that have been allocated to a buyer from
     * multiple sales. It already takes into account the individual cap of each
     * sale.
     *
     * @param to The address of the buyer
     * @return The total amount of tokens that have been allocated to the buyer
     */
    function _totalAllocated(address to) internal view returns (uint256) {
        uint256 totalAllocated = 0;

        for (uint256 i = 0; i < saleAddresses.length; i++) {
            totalAllocated += ISale(saleAddresses[i]).getAllocations(to);
        }

        return totalAllocated;
    }
}
