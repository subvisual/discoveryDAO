// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

interface ICommon {
    /// Definition of a time period
    struct Period {
        uint256 start;
        uint256 end;
    }

    enum ProjectStatus {
        InProgress,
        Won,
        Lost
    }
}
