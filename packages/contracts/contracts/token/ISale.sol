// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISale {
    /// The $aUSD token
    function paymentToken() external view returns (address);

    /// How many $CTND will be received for the given payment amount
    function paymentTokenToToken(uint256 _paymentAmount)
        external
        view
        returns (uint256);

    /// How many $aUSD will be received for the given $CTND amount
    function tokenToPaymentToken(uint256 _tokenAmount)
        external
        view
        returns (uint256);

    /// Commits an amount of $aUSD to buy $CTND
    ///
    /// @dev aUSD allowance must be previously set by spender
    /// @dev Actual $CTND allocation is only available once individual cap is set
    /// @dev Needs to be approved by Fractal via the Registry
    ///
    /// @param _paymentAmount amount in payment token to commit
    function buy(uint256 _paymentAmount) external;

    /**
     * Refunds currently refundable amount for the given address
     *
     * @param to Address to refund to
     */
    function refund(address to) external;

    /**
     * Returns the amount of tokens that are meant for refund due to the
     * rising tide mechanism
     *
     * @param to The address to query
     * @return The currently claimable amount
     */
    function refundAmount(address to) external view returns (uint256);

    /**
     * Sets the individual cap for investors, which will then be used when
     * claiming or refunding. Only callable by the cap validator role.
     *
     * @param cap The cap per investor to be set, specified in $CTND
     */
    function setIndividualCap(uint256 cap) external;

    /**
     * Returns the amount of tokens that have been allocated in this sale for
     * a given address (applying the individual cap)
     *
     * @param _who The address to query
     */
    function allocation(address _who) external view returns (uint256);

    /**
     * Returns the amount of tokens that have been allocated in this sale for
     * a given address (ignoring the individual cap)
     *
     * @param _who The address to query
     */
    function uncappedAllocation(address _who) external view returns (uint256);

    /**
     * Allows a privileged account to withdraw payment tokens once the sale is over
     *
     * @notice Does not allow withdrawing funds meant for refunds
     */
    function withdraw() external;
}
