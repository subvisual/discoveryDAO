// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IBatch} from "./IBatch.sol";

/// The main entry point for most admin interactions with the discovery system:
///   * Creating batches
///   * Whitelisting companies
interface IController {
    // Checks if a given account has the PROJECT_MANAGER_ROLE role
    /// @param _account Account to check
    /// @return true if account is a project manager
    function hasProjectManagerRole(address _account)
        external
        view
        returns (bool);

    // Checks if a given account has the LEGAL_MANAGER_ROLE role
    /// @param _account Account to check
    /// @return true if account is a legal manager
    function hasLegalManagerRole(address _account) external view returns (bool);

    /// @param _project address of the project
    /// @return Batch address
    function getBatchForProject(address _project)
        external
        view
        returns (address);

    /// Creates a new batch with
    ///
    /// @dev Must guarantee projects are in a valid state (whitelisted & not already belonging to a batch)
    ///
    /// @dev Batches are created in order, and with no overlap.
    ///   i.e.: when creating batch #3, its start date must be after the end date of batch #2
    function createBatch(address[] calldata projects, uint256 _slotCount)
        external;

    /// Registers a new Project
    function registerProject(
        string calldata _description,
        address _token,
        uint256 _saleSupply,
        uint256 _rate,
        address _investmentToken,
        uint256 _cliffMonths,
        uint256 _vestingMonths
    ) external;

    /// Checks if a project is included in the given batch
    function isProjectInBatch(address _project, address _batch)
        external
        returns (bool);

    /// Checks if a user can invest in the staker's pool of a project
    function canInvestInStakersPool(address _user) external view returns (bool);

    /// Checks if a user can invest in the people's pool of a project
    function canInvestInPeoplesPool(address _project, address _user)
        external
        view
        returns (bool);

    /// Checks if a user can vote
    function canVote(address _user) external view returns (bool);

    /// Sets the voting period for a Batch
    function setBatchVotingPeriod(
        address batch,
        uint256 start,
        uint256 end,
        uint256 extraInvestmentDuration
    ) external;
}
