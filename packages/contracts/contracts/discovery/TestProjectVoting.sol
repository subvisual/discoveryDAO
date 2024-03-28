// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {ProjectVoting} from "./ProjectVoting.sol";

contract TestProjectVoting is ProjectVoting {
    Period public votingPeriod;
    address[] public projects;
    uint256 public numSlots;

    constructor(
        Period memory _votingPeriod,
        address[] memory _projects,
        uint256 _numSlots
    ) ProjectVoting(_projects) {
        votingPeriod = _votingPeriod;
        projects = _projects;
        numSlots = _numSlots;
    }

    function projectVoting_projects()
        public
        view
        override(ProjectVoting)
        returns (address[] memory)
    {
        return projects;
    }

    function projectVoting_votingPeriod()
        public
        view
        override(ProjectVoting)
        returns (Period memory)
    {
        return votingPeriod;
    }

    function projectVoting_singleSlotDuration()
        public
        view
        override(ProjectVoting)
        returns (uint256)
    {
        return (votingPeriod.end - votingPeriod.start) / numSlots;
    }

    function projectVoting_initialBonus()
        public
        pure
        override(ProjectVoting)
        returns (int256)
    {
        return 0.05 * 10**18;
    }

    function projectVoting_finalBonus()
        public
        pure
        override(ProjectVoting)
        returns (int256)
    {
        return 0;
    }

    function projectVoting_voteLimitPerUser()
        public
        view
        override(ProjectVoting)
        returns (uint256)
    {
        return numSlots;
    }

    function test_vote(address projectAddress) external {
        _vote(projectAddress);
    }

    function test_getWinners() external view returns (address[] memory) {
        return _getWinners();
    }

    function test_calculateWeightedVote(uint256 currentTime)
        external
        view
        returns (uint256)
    {
        return _calculateWeightedVote(currentTime);
    }

    function test_sortVotes(SortableVote[] memory votes)
        external
        view
        returns (SortableVote[] memory)
    {
        return _sortVotes(votes);
    }
}
