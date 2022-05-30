// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {ICommon} from "./ICommon.sol";

interface IBatch is ICommon {
    function vote(address projectAddress) external;

    function inInvestmentPeriod() external view returns (bool);

    function hasVotedForProject(address _user, address _project)
        external
        view
        returns (bool);

    function setVotingPeriod(
        uint256 start,
        uint256 end,
        uint256 extraInvestmentDuration
    ) external;

    function getCurrentWinners() external view returns (address[] memory);

    function getProjectStatus(address projectAddress)
        external
        view
        returns (ProjectStatus);
}
