// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Math {
    /**
     * @dev Return the smallest of the two arguments.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Return the largest of the two arguments.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return b < a ? a : b;
    }
}
