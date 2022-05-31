// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

interface IPool {
    /// Similar to Sale.buy
    function invest(address _investor, uint256 _amount) external;

    /**
     * Sets the individual cap for investors, which will then be used when
     * claiming or refunding. Only callable by the cap validator role.
     *
     * @param _cap The cap per investor to be set, specified in the
     * project's token
     */
    function setIndividualCap(uint256 _cap) external;

    /**
     * Refunds currently refundable amount for the given address
     *
     * @param _to Address to refund to
     */
    function refund(address _to) external;

    /**
     * Returns the amount of tokens (in investment tokens) a user should get
     * from a refund. It is 0 until the Rising Tide is run.
     *
     * @param _to The address to query
     * @return The currently claimable amount in project tokens
     */
    function refundableAmount(address _to) external view returns (uint256);

    /**
     * Calculates withdrawable amount of tokens for an address.
     * This should take into account:
     *   - total vested amount
     *   - already withdrawn amount
     *   - number of months elapsed since the end of the account's cliff period
     *   - total number of months this account is vesting for
     * Vesting should be linear once cliff ends, but in monthly ticks, instead
     * of a continuous release
     *
     * @param to The address to query
     * @return The currently withdrawable amount
     */
    function withdrawable(address to) external view returns (uint256);

    /// Similar to Sale.uncappedAllocation
    function uncappedAllocation(address _to)
        external
        view
        returns (uint256 amount);

    /// Similar to Sale.allocation
    function allocation(address _to) external view returns (uint256);

    function withdrawn(address _to) external view returns (uint256);
}
