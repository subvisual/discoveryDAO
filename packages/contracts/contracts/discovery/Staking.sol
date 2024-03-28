// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IStaking} from "./interfaces/IStaking.sol";

contract Staking is IStaking {
    using SafeERC20 for IERC20;

    //
    // Structs
    //

    struct Stake {
        uint256 total;
        uint256 bonded;
    }

    struct UnbondingList {
        mapping(uint256 => Unbonding) list;
        uint128 first;
        uint128 next;
    }

    struct Unbonding {
        uint256 amount;
        uint256 time;
    }

    //
    // Events
    //

    event StakeFunds(address indexed staker, uint256 amount);
    event Unbond(address indexed staker, uint256 amount);
    event Rebond(address indexed staker, uint256 amount);
    event Withdrawal(address indexed staker, uint256 amount);

    //
    // Constants
    //

    uint256 public constant UNBONDING_PERIOD = 28 days;

    //
    // State
    //

    /// The token to stake
    address public immutable token;

    /// account => stakes
    mapping(address => Stake) public stakes;

    /// account => unbondings
    mapping(address => UnbondingList) public unbondings;

    constructor(address _token) {
        require(_token != address(0), "_token cannot be 0");

        token = _token;
    }

    function hasStaked(address _account)
        external
        view
        override(IStaking)
        returns (bool)
    {
        return stakes[_account].bonded > 0;
    }

    /// @inheritdoc IStaking
    function stake(uint256 _amount) external override(IStaking) {
        stakes[msg.sender].total += _amount;
        stakes[msg.sender].bonded += _amount;

        IERC20(token).safeTransferFrom(msg.sender, address(this), _amount);

        emit StakeFunds(msg.sender, _amount);
    }

    /// @inheritdoc IStaking
    function unbond(uint256 amount) external override(IStaking) {
        Stake storage _stake = stakes[msg.sender];
        UnbondingList storage _unbondings = unbondings[msg.sender];

        require(_stake.bonded >= amount, "not enough funds");

        Unbonding memory unbonding = Unbonding(
            amount,
            block.timestamp + UNBONDING_PERIOD
        );

        _unbondings.list[_unbondings.next] = unbonding;
        _unbondings.next++;
        _stake.bonded -= amount;

        emit Unbond(msg.sender, amount);
    }

    /// @inheritdoc IStaking
    function rebond(uint256 amount) external override(IStaking) {
        Stake storage _stake = stakes[msg.sender];
        UnbondingList storage _unbondings = unbondings[msg.sender];

        require(
            (_stake.total - _stake.bonded) >= amount,
            "not enough unbonding funds"
        );

        uint256 toBeRebonded = amount;
        uint256 limit = _unbondings.first;
        for (uint256 i = _unbondings.next - 1; i >= limit; i--) {
            Unbonding storage unbonding = _unbondings.list[i];

            if (unbonding.amount >= toBeRebonded) {
                unbonding.amount -= toBeRebonded;
                break;
            } else {
                toBeRebonded -= unbonding.amount;
                delete _unbondings.list[i];
                _unbondings.next--;
            }
        }
        _stake.bonded += amount;

        emit Rebond(msg.sender, amount);
    }

    /// TODO add a gas meter to prevent this function from crashing if too many unbondings exist
    /// @inheritdoc IStaking
    function withdraw() external override(IStaking) {
        Stake storage _stake = stakes[msg.sender];
        UnbondingList storage _unbondings = unbondings[msg.sender];

        uint256 amount;
        uint256 limit = _unbondings.next;
        for (uint256 i = _unbondings.first; i < limit; i++) {
            Unbonding storage unbonding = _unbondings.list[i];

            if (unbonding.time > block.timestamp) {
                break;
            }

            amount += unbonding.amount;
            delete _unbondings.list[i];
            _unbondings.first++;
        }

        require(amount > 0, "nothing to withdraw");
        _stake.total -= amount;

        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdrawal(msg.sender, amount);
    }

    /// @inheritdoc IStaking
    function withdrawable(address _account) public view returns (uint256) {
        UnbondingList storage _unbondings = unbondings[_account];

        uint256 amount;
        uint256 limit = _unbondings.next;
        for (uint256 i = _unbondings.first; i < limit; i++) {
            Unbonding storage unbonding = _unbondings.list[i];

            if (unbonding.time > block.timestamp) {
                return amount;
            }

            amount += _unbondings.list[i].amount;
        }

        return amount;
    }
}
