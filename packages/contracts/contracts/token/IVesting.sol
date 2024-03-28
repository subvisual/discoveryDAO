// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVesting {
    /// @return The cliff period, in months, for public sale vesting
    function publicSaleCliffMonths() external view returns (uint256);

    /// @return The vesting duration, in months
    function publicSaleVestingMonths() external view returns (uint256);

    /// @return The token being vested
    function token() external view returns (address);

    /// @return The start time for the vesting
    function startTime() external view returns (uint256);

    /// @return The total cap for the private sale
    function privateSaleCap() external view returns (uint256);

    /**
     * @return How many tokens allocated in total for a given
     * address, for private and public sales, including already
     * claimed amount
     **/
    function totalAllocated(address to) external view returns (uint256);

    /// @return Amount already claimed by a given address
    function claimed(address to) external view returns (uint256);

    /**
     * Calculates claimable amount of tokens for an address.
     * This should take into account:
     *   - total vested amount
     *   - already claimed amount
     *   - number of months elapsed since the end of the account's cliff period
     *   - total number of months this account is vesting for
     * Vesting should be lienear once cliff ends, but in monthly ticks, instead of a continuous release
     *
     * @param to The address to query
     * @return The currently claimable amount
     */
    function claimable(address to) external view returns (uint256);

    /**
     * Claims currently claimable amount for the given address
     *
     * @param to Address to claim from
     */
    function claim(address to) external;

    /**
     * Creates a new vesting with private sale parameters
     * If the address is already registered, it does nothing.
     *
     * Also checks if the private sale cap has been reached, and if so,
     * reverts.
     *
     * @param to Beneficiary
     * @param amount Amount of tokens to vest
     * @param cliffMonths Number of months to wait before the vesting starts
     * @param vestingMonths Number of months of vesting
     * @param nonce Nonce used to prevent the same sale from being registered twice
     **/
    function createPrivateSaleVest(
        address to,
        uint256 amount,
        uint16 cliffMonths,
        uint16 vestingMonths,
        uint64 nonce
    ) external;

    /**
     * Triggers the refund of a given address on all sales
     *
     * @dev It will trigger a number of transactions equal to the number of
     * sales (assuming all of them have something to refund)
     * @dev It uses the low level `call` function to ensure that even if for
     * some reason an address that does not belong to a sale contract makes its
     * way to the sales list, we can recover from it.
     *
     * @param to Beneficiary
     **/
    function refund(address to) external;
}
