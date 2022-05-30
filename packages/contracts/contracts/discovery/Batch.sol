// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {ERC165Checker} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import {IProject} from "./interfaces/IProject.sol";
import {IController} from "./interfaces/IController.sol";
import {IBatch} from "./interfaces/IBatch.sol";
import {IStaking} from "./interfaces/IStaking.sol";
import {ProjectVoting} from "./ProjectVoting.sol";

contract Batch is IBatch, ProjectVoting {
    using ERC165Checker for address;

    /// List of addresses for the project in the batch
    address[] public projects;

    /// number of available slots
    uint256 public immutable slotCount;

    /// Period for which the batch is open for voting
    Period public votingPeriod;

    /// Timestamp at which the batch is closed for investment
    uint256 public investmentEnd;

    /// Address for the controller contract
    address public immutable controller;

    /// duration in seconds of each slot
    uint256 public singleSlotDuration;

    modifier votingPeriodIsSet() {
        require(votingPeriod.start != 0, "voting period not set");
        require(votingPeriod.end != 0, "voting period not set");
        _;
    }

    modifier inVotingPeriod() {
        require(
            votingPeriod.end >= block.timestamp &&
                votingPeriod.start <= block.timestamp,
            "outside of voting period"
        );
        _;
    }

    constructor(address[] memory _projects, uint256 _slotCount)
        ProjectVoting(_projects)
    {
        uint256 numProjects = _projects.length;
        require(numProjects > 0, "projects must not be empty");
        require(_slotCount > 0, "slotCount must be greater than 0");
        require(
            _slotCount <= numProjects,
            "cannot have more slots than projects"
        );

        for (uint256 i = 0; i < numProjects; i++) {
            require(
                _projects[i].supportsInterface(type(IProject).interfaceId),
                "project must be an IProject"
            );
        }
        require(
            msg.sender.supportsInterface(type(IController).interfaceId),
            "sender must be an IController"
        );
        controller = msg.sender;
        projects = _projects;
        slotCount = _slotCount;
    }

    function projectVoting_projects()
        public
        view
        virtual
        override(ProjectVoting)
        returns (address[] memory)
    {
        return projects;
    }

    function projectVoting_votingPeriod()
        public
        view
        virtual
        override(ProjectVoting)
        returns (Period memory)
    {
        return votingPeriod;
    }

    function projectVoting_singleSlotDuration()
        public
        view
        virtual
        override(ProjectVoting)
        returns (uint256)
    {
        return singleSlotDuration;
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
        return slotCount;
    }

    //
    // IBatch
    //

    function inInvestmentPeriod() external view returns (bool) {
        return
            votingPeriod.start >= block.timestamp &&
            investmentEnd <= block.timestamp;
    }

    function hasVotedForProject(address _user, address _project)
        external
        view
        returns (bool)
    {
        return userHasVotedForProject[_project][_user];
    }

    function setVotingPeriod(
        uint256 start,
        uint256 end,
        uint256 extraInvestmentDuration
    ) external {
        require(start >= block.timestamp, "start must be in the future");
        require(start < end, "start must be before end");
        require(
            msg.sender == controller,
            "only controller can set voting period"
        );
        votingPeriod = Period(start, end);
        singleSlotDuration =
            (votingPeriod.end - votingPeriod.start) /
            slotCount;
        investmentEnd = votingPeriod.end + extraInvestmentDuration;
    }

    function vote(address projectAddress)
        external
        votingPeriodIsSet
        inVotingPeriod
    {
        require(
            IController(controller).canVote(msg.sender),
            "not allowed to vote"
        );

        _vote(projectAddress);
    }

    function getCurrentWinners()
        external
        view
        votingPeriodIsSet
        returns (address[] memory)
    {
        return _getWinners();
    }

    function getProjectStatus(address projectAddress)
        external
        view
        votingPeriodIsSet
        returns (ProjectStatus)
    {
        address[] memory computedWinners = _getWinners();

        for (uint256 i = 0; i < computedWinners.length; i++) {
            if (computedWinners[i] == projectAddress) {
                return ProjectStatus.Won;
            }
        }

        if (votingPeriod.end < block.timestamp) {
            return ProjectStatus.Lost;
        }

        return projectStatuses[projectAddress];
    }
}
