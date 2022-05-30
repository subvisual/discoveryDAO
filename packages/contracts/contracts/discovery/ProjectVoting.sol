// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.12;

import {ICommon} from "./interfaces/ICommon.sol";
import {Math} from "../libraries/Math.sol";

import "hardhat/console.sol";

abstract contract ProjectVoting is ICommon {
    struct SortableVote {
        uint256 originalIndex;
        uint256 count;
    }

    /// number of votes for each project
    uint32[] public votes;

    /// Ordered list of slot winners
    /// @dev only valid up to the last time there was a vote. Use getWinners() instead.
    address[] winners;

    /// index in the votes array to project address
    mapping(uint256 => address) public votesIndexToProject;

    /// project address to index  in the votes array
    mapping(address => uint256) public projectToVotesIndex;

    /// user => votes
    mapping(address => uint256) public userVoteCount;

    /// project address => votes
    mapping(address => uint256) public projectVoteCount;

    /// project address => weightedVotes
    mapping(address => uint256) public weightedProjectVoteCount;

    /// project => (user => voted)
    mapping(address => mapping(address => bool)) public userHasVotedForProject;

    /// Project address to status
    /// @dev only valid up to the last time there was a vote. Use getProject(address) instead.
    mapping(address => ProjectStatus) projectStatuses;

    uint256 projectsWithVotesCount;

    constructor(address[] memory _projects) {
        for (uint256 i = 0; i < _projects.length; i++) {
            votes.push(0);
            votesIndexToProject[i] = _projects[i];
            projectToVotesIndex[_projects[i]] = i;
        }
    }

    function projectVoting_projects()
        public
        view
        virtual
        returns (address[] memory);

    function projectVoting_votingPeriod()
        public
        view
        virtual
        returns (Period memory);

    function projectVoting_singleSlotDuration()
        public
        view
        virtual
        returns (uint256);

    function projectVoting_initialBonus() public view virtual returns (int256);

    function projectVoting_finalBonus() public view virtual returns (int256);

    function projectVoting_voteLimitPerUser()
        public
        view
        virtual
        returns (uint256);

    function _vote(address projectAddress) internal {
        require(
            !userHasVotedForProject[projectAddress][msg.sender],
            "already voted in this project"
        );
        require(
            userVoteCount[msg.sender] < projectVoting_voteLimitPerUser(),
            "vote limit reached"
        );
        _defineWinners();
        require(
            projectStatuses[projectAddress] == ProjectStatus.InProgress,
            "project is not in progress"
        );
        userHasVotedForProject[projectAddress][msg.sender] = true;
        userVoteCount[msg.sender]++;
        projectVoteCount[projectAddress]++;
        weightedProjectVoteCount[projectAddress] += _calculateWeightedVote(
            block.timestamp
        );

        if (votes[projectToVotesIndex[projectAddress]] == 0) {
            projectsWithVotesCount++;
        }
        votes[projectToVotesIndex[projectAddress]]++;
    }

    function _defineWinners() internal {
        address[] memory newWinners = _getNewWinners();

        if (newWinners.length == 0) {
            return;
        }
        for (uint256 i = 0; i < newWinners.length; i++) {
            winners.push(newWinners[i]);
            projectStatuses[newWinners[i]] = ProjectStatus.Won;
        }

        if (block.timestamp >= projectVoting_votingPeriod().end) {
            uint256 numProjects = projectVoting_projects().length;

            for (uint256 i = 0; i < numProjects; i++) {
                if (
                    projectStatuses[projectVoting_projects()[i]] ==
                    ProjectStatus.InProgress
                ) {
                    projectStatuses[projectVoting_projects()[i]] = ProjectStatus
                        .Lost;
                }
            }
        }
    }

    function _getNewWinners() internal view returns (address[] memory) {
        uint256 numberOfExistingWinners = winners.length;
        uint256 numberOfSlotsToCalculate = _numberOfSlotsToCalculate();
        uint256 numberOfWinners = Math.min(
            projectsWithVotesCount,
            numberOfSlotsToCalculate
        );
        uint256 votesSize = votes.length;
        uint256 numberOfNewWinners = numberOfWinners - numberOfExistingWinners;
        address[] memory result = new address[](numberOfNewWinners);

        if (block.timestamp < projectVoting_votingPeriod().start) {
            return result;
        }

        if (numberOfNewWinners == 0) {
            return result;
        }

        SortableVote[] memory sortedVotes = new SortableVote[](votesSize);

        // copy votes to sortedVotes to get the original indexes
        for (uint256 i = 0; i < votesSize; i++) {
            ProjectStatus status = projectStatuses[votesIndexToProject[i]];
            if (status == ProjectStatus.Won) {
                // This index can be left empty because it will be sorted
                continue;
            } else {
                sortedVotes[i] = SortableVote(
                    i,
                    weightedProjectVoteCount[votesIndexToProject[i]]
                );
            }
        }

        // sort the votes
        sortedVotes = _sortVotes(sortedVotes);

        // add the remaining votes to the result. Ensuring we start from where
        // the last loop left off and end at the number of total winners to be
        // calculated
        for (uint256 i = 0; i < numberOfNewWinners; i++) {
            result[i] = votesIndexToProject[sortedVotes[i].originalIndex];
        }

        return result;
    }

    function _getWinners() internal view returns (address[] memory) {
        if (block.timestamp < projectVoting_votingPeriod().start) {
            return winners;
        }

        uint256 numberOfExistingWinners = winners.length;
        uint256 numberOfSlotsToCalculate = _numberOfSlotsToCalculate();
        uint256 numberOfWinners = Math.min(
            projectsWithVotesCount,
            numberOfSlotsToCalculate
        );
        uint256 votesSize = votes.length;

        if (numberOfWinners == numberOfExistingWinners) {
            return winners;
        }

        SortableVote[] memory sortedVotes = new SortableVote[](votesSize);
        address[] memory result = new address[](numberOfWinners);

        // copy votes to sortedVotes to get the original indexes
        for (uint256 i = 0; i < votesSize; i++) {
            sortedVotes[i] = SortableVote(
                i,
                weightedProjectVoteCount[votesIndexToProject[i]]
            );
        }

        // remove from sortedVotes the votes that are already in winners
        for (uint256 i = 0; i < numberOfExistingWinners; i++) {
            uint256 index = projectToVotesIndex[winners[i]];
            delete sortedVotes[index];
        }

        // sort the remaining votes (the ones that are in winners will be at the end)
        sortedVotes = _sortVotes(sortedVotes);

        // add existing winners to the beginning of the result, keeping order
        for (uint256 i = 0; i < numberOfExistingWinners; i++) {
            result[i] = winners[i];
        }

        // add the remaining votes to the result. Ensuring we start from where
        // the last loop left off and end at the number of total winners to be
        // calculated
        for (uint256 i = numberOfExistingWinners; i < numberOfWinners; i++) {
            result[i] = votesIndexToProject[
                sortedVotes[i - numberOfExistingWinners].originalIndex
            ];
        }

        return result;
    }

    function _numberOfSlotsToCalculate() internal view returns (uint256) {
        uint256 endTimestamp = Math.min(
            projectVoting_votingPeriod().end,
            block.timestamp
        );
        return
            (endTimestamp - projectVoting_votingPeriod().start) /
            projectVoting_singleSlotDuration();
    }

    function _sortVotes(SortableVote[] memory _votes)
        internal
        view
        returns (SortableVote[] memory)
    {
        _quickSort(_votes, int256(0), int256(_votes.length - 1));
        return _votes;
    }

    function _quickSort(
        SortableVote[] memory _votes,
        int256 left,
        int256 right
    ) internal view {
        int256 i = left;
        int256 j = right;
        if (i == j) return;

        uint256 pivot = _votes[uint256(left + (right - left) / 2)].count;

        while (i <= j) {
            while (_votes[uint256(i)].count > pivot) i++;
            while (pivot > _votes[uint256(j)].count) j--;
            if (i <= j) {
                (_votes[uint256(i)], _votes[uint256(j)]) = (
                    _votes[uint256(j)],
                    _votes[uint256(i)]
                );
                i++;
                j--;
            }
        }
        if (left < j) _quickSort(_votes, left, j);
        if (i < right) _quickSort(_votes, i, right);
    }

    function _calculateWeightedVote(uint256 currentTime)
        internal
        view
        returns (uint256)
    {
        int256 bonusDelta = int256(
            projectVoting_finalBonus() - projectVoting_initialBonus()
        );
        int256 timeDelta = int256(
            projectVoting_votingPeriod().end -
                projectVoting_votingPeriod().start
        );
        int256 slope = bonusDelta / timeDelta;
        uint256 weightedVote = uint256(
            (slope *
                int256(currentTime - projectVoting_votingPeriod().start) +
                projectVoting_initialBonus())
        );

        return weightedVote;
    }
}
