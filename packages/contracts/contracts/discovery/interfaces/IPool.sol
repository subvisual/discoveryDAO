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

    /// Similar to Sale.uncappedAllocation
    function uncappedAllocation(address _to)
        external
        view
        returns (uint256 amount);

    /// Similar to Sale.allocation
    function allocation(address _to) external view returns (uint256);

    function setBatch(address _batch) external;
}
