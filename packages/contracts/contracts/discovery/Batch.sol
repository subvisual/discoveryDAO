// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.12;

import {IBatch} from "./IBatch.sol";
import {ICommon} from "./ICommon.sol";

contract Batch is IBatch, ICommon {
    /// address of the projects
    address[] projects;
    /// number of approved projects in this batch
    uint256 projectCount;
    /// number of available slots
    uint256 slotCount;
    Period votingPeriod;

    /// user => votes
    mapping(address => uint256) public userVoteCount;

    /// projectId => votes
    mapping(uint256 => uint256) public projectVoteCount;

    constructor(address[] memory _projects, uint256 _slotCount) {
        projects = _projects;
        slotCount = _slotCount;
        projectCount = _projects.length;
    }
}
