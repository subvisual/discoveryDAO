// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Math} from "../libraries/Math.sol";

/**
 * Abstract implementation of a Rising Tide Calculator
 *
 * @dev In addition to implementing this interface, the contract must also
 * ensure no investments are possible once the Rising Tide calculation kicks in
 */
abstract contract RisingTide {
    //
    // Libraries
    //
    using Math for uint256;

    //
    // Structs
    //
    enum RisingTideState {
        NotSet, // cap not yet given, or invalid
        Validating, // cap has been given, but still being validated
        Finished, // cap is set. claims and refunds are open
        Invalid // the current cap was deemed invalid
    }

    struct RisingTideCache {
        uint256 index; // what index are we at
        uint256 sumForCap; // cumulative investments with given cap
        uint256 sumForNextCap; // cumulative investments with next cap
        uint256 largest; // largest investment so far
    }

    //
    // Constants
    //

    /// Min gas required to run one more cap validation iteration
    uint256 public constant CAP_VALIDATION_GAS_LIMIT = 100000;

    //
    // State
    //

    /// Current state
    RisingTideState public risingTideState;

    /// Calculation cache
    RisingTideCache public risingTideCache;

    /// The currently set cap
    /// Maximum amount of tokens that each buyer can actually get
    uint256 public individualCap;

    //
    // Virtual Interface
    //

    /// @return How many individual investors exist
    function investorCount() public view virtual returns (uint256);

    /// @return Amount of the nth investor
    function investorAmountAt(uint256 n) public view virtual returns (uint256);

    /// How many allocations have been made, regardless of the future individual cap
    ///
    /// @return Total amount invested
    function risingTide_totalAllocatedUncapped()
        public
        view
        virtual
        returns (uint256);

    /// How many tokens are to be distributed in total
    ///
    /// @return amount corresponding to the total supply available for distribution
    function risingTide_totalCap() public view virtual returns (uint256);

    /// @return true if validation of current cap is still ongoing
    function risingTide_validating() external view returns (bool) {
        return risingTideState == RisingTideState.Validating;
    }

    /// @return true if current cap is already validated
    function risingTide_isValidCap() public view returns (bool) {
        return risingTideState == RisingTideState.Finished;
    }

    /// Internal helper to set a new cap and trigger the beginning of the validation logic
    ///
    /// @param _cap The cap to validate
    function _risingTide_setCap(uint256 _cap) internal {
        require(
            risingTideState == RisingTideState.NotSet ||
                risingTideState == RisingTideState.Invalid,
            "already set or in progress"
        );

        individualCap = _cap;
        risingTideState = RisingTideState.Validating;
        risingTideCache = RisingTideCache(0, 0, 0, 0);

        risingTide_validate();
    }

    /// Continues a pending validation of the individual cap
    function risingTide_validate() public {
        require(risingTideState == RisingTideState.Validating);

        RisingTideCache memory validation = risingTideCache;
        uint256 count = investorCount();
        uint256 localCap = individualCap;

        for (
            ;
            validation.index < count && gasleft() > CAP_VALIDATION_GAS_LIMIT;
            ++validation.index
        ) {
            uint256 amount = investorAmountAt(validation.index);

            validation.sumForCap += amount.min(localCap);
            validation.sumForNextCap += amount.min(localCap + 1);
            validation.largest = Math.max(validation.largest, amount);
        }

        risingTideCache = validation;

        if (validation.index == count) {
            bool _valid = _risingTide_validCap(localCap, validation);
            if (_valid) {
                risingTideState = RisingTideState.Finished;
            } else {
                risingTideState = RisingTideState.Invalid;
            }
        }
    }

    /**
     * Applies the individual cap to the given amount
     *
     * @param _amount amount to apply cap to
     * @return capped amount
     */
    function risingTide_applyCap(uint256 _amount)
        public
        view
        returns (uint256)
    {
        if (!risingTide_isValidCap()) {
            return 0;
        }

        if (_amount >= individualCap) {
            return individualCap;
        }

        return _amount;
    }

    //
    // Internal API
    //

    /// @dev Determine if the given rising tide cap is valid.
    ///
    /// If the maximum investment is not reached, the rising tide cap does not
    /// have an upper bound. In this scenario, the cap is conventioned to be the
    /// largest individual investment.
    ///
    /// If the maximum investment is reached, the rising tide cap is defined as
    /// the highest possible cap such that the sum of all contributions with the
    /// cap applied does not exceed the maximum investment. This means that the
    /// sum of all contirbutions with any cap above the rising tide cap applied
    /// would exceed the maximum investment limit.
    ///
    /// @param _cap Rising tide cap to be validated, in wei.
    /// @param _validation The calculated CapValidation struct
    ///
    /// @return true if `cap` is a valid rising tide cap for the given parameters.
    function _risingTide_validCap(
        uint256 _cap,
        RisingTideCache memory _validation
    ) internal view returns (bool) {
        uint256 total = risingTide_totalAllocatedUncapped();
        uint256 max = risingTide_totalCap();

        require(_validation.largest <= total);
        require(_validation.sumForCap <= total);
        require(_validation.sumForNextCap <= total);

        if (total <= max) {
            return _cap == _validation.largest;
        } else {
            return (_validation.sumForNextCap > max &&
                _validation.sumForCap <= max);
        }
    }
}
