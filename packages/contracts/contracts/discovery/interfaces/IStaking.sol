// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStaking {
    /**
     * Stakes the given amount of tokens, using the `msg.sender` as the
     * staker.
     *
     * @dev Emits a `Stake` event.
     *
     * @param amount The amount of tokens to stake.
     */
    function stake(uint256 amount) external;

    /**
     * Unbonds the given amount of tokens, using the `msg.sender` as the
     * staker. The staker must have already staked the given amount of
     * tokens.
     *
     * @dev Emits a `Unbond` event.
     * @dev Uses a mapping to handle the different unbondings, but from the
     * caller's side it's treated as a single pool.
     *
     * @param amount The amount of tokens to unbond.
     */
    function unbond(uint256 amount) external;

    /**
     * Rebonds the given amount of tokens for `msg.sender`. It requires that
     * there are enough funds that are still unbonding or that have been
     * unbonded but not yet withdrawn.
     *
     * @dev Emits a `Rebond` event.
     *
     * @param amount The amount of tokens to rebond.
     */
    function rebond(uint256 amount) external;

    /**
     * Withdraws any tokens that have gone through the full unbonding period
     *
     * @dev Emits a `Withdrawal` event.
     */
    function withdraw() external;

    /**
     * Computes how many tokens waiting for unbonding can already be withdrawn
     */
    function withdrawable(address _account) external view returns (uint256);

    function hasStaked(address _account) external view returns (bool);
}
