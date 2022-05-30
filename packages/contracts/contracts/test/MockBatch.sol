// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IBatch} from "../discovery/interfaces/IBatch.sol";

import "hardhat/console.sol";

contract MockBatch is IBatch {
    mapping(address => ProjectStatus) projectsStatus;

    function vote(address projectAddress) external override(IBatch) {
        revert();
    }

    function inInvestmentPeriod()
        external
        view
        override(IBatch)
        returns (bool)
    {
        return true;
    }

    function hasVotedForProject(address _user, address _project)
        external
        view
        override(IBatch)
        returns (bool)
    {
        return false;
    }

    function setVotingPeriod(
        uint256 start,
        uint256 end,
        uint256 extraInvestmentDuration
    ) external override(IBatch) {
        revert();
    }

    function getCurrentWinners()
        external
        view
        override(IBatch)
        returns (address[] memory)
    {
        revert();
    }

    function getProjectStatus(address projectAddress)
        external
        view
        override(IBatch)
        returns (ProjectStatus)
    {
        return projectsStatus[projectAddress];
    }

    function mock_setProjectStatus(address projectAddress, uint256 status)
        external
    {
        projectsStatus[projectAddress] = ProjectStatus(status);
    }
}
