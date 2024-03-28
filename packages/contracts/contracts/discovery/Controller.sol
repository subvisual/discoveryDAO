// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import {IController} from "./interfaces/IController.sol";
import {IProject} from "./interfaces/IProject.sol";
import {IBatch} from "./interfaces/IBatch.sol";
import {IStaking} from "./interfaces/IStaking.sol";
import {Project} from "./Project.sol";
import {Batch} from "./Batch.sol";

contract Controller is IController, ERC165, AccessControl {
    using SafeERC20 for IERC20;

    //
    // Events
    //

    event ProjectRegistered(address project);
    event BatchCreated(address batch);

    //
    // Constants
    //
    bytes32 public constant PROJECT_MANAGER_ROLE =
        keccak256("PROJECT_MANAGER_ROLE");
    bytes32 public constant BATCH_MANAGER_ROLE =
        keccak256("BATCH_MANAGER_ROLE");
    bytes32 public constant LEGAL_MANAGER_ROLE =
        keccak256("LEGAL_MANAGER_ROLE");

    //
    // State
    //

    // all project contracts registered
    mapping(address => bool) public projects;

    // project => batch
    mapping(address => address) public projectsToBatches;

    // CTND staking contract
    address public staking;

    // CTND token contract
    address public token;

    // Merkle root to pass to the projects
    bytes32 public merkleRoot;

    constructor(
        address _staking,
        address _token,
        bytes32 _merkleRoot
    ) {
        staking = _staking;
        token = _token;
        merkleRoot = _merkleRoot;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PROJECT_MANAGER_ROLE, msg.sender);
        _grantRole(BATCH_MANAGER_ROLE, msg.sender);
        _grantRole(LEGAL_MANAGER_ROLE, msg.sender);
    }

    //
    // IController
    //

    /// @inheritdoc IController
    function registerProject(
        string calldata _description,
        address _token,
        uint256 _saleSupply,
        uint256 _rate,
        address _investmentToken
    ) external override(IController) {
        IProject project = new Project(
            _description,
            _token,
            _saleSupply,
            _rate,
            _investmentToken,
            merkleRoot
        );

        emit ProjectRegistered(address(project));

        projects[address(project)] = true;
    }

    /// @inheritdoc IController
    function createBatch(address[] calldata _projects, uint256 _slotCount)
        external
        override(IController)
        onlyRole(BATCH_MANAGER_ROLE)
    {
        IBatch batch = new Batch(_projects, _slotCount);

        uint256 len = _projects.length;
        for (uint256 i = 0; i < len; i++) {
            address project = _projects[i];
            require(projects[project], "not a known project");
            require(IProject(project).isReadyForListing(), "project not ready");
            require(
                projectsToBatches[project] == address(0),
                "already in a batch"
            );

            projectsToBatches[project] = address(batch);
        }

        emit BatchCreated(address(batch));
    }

    /// @inheritdoc IController
    function isProjectInBatch(address _project, address _batch)
        external
        view
        override(IController)
        returns (bool)
    {
        return projectsToBatches[_project] == _batch;
    }

    /// @inheritdoc IController
    function canInvestInStakersPool(
        address _user,
        bytes32[] calldata _merkleProof
    ) external view override(IController) returns (bool) {
        return
            _hasKYC(_user, _merkleProof) &&
            _belongsToDAO(_user) &&
            IStaking(staking).hasStaked(_user);
    }

    /// @inheritdoc IController
    function canInvestInPeoplesPool(
        address _project,
        address _user,
        bytes32[] calldata _merkleProof
    ) external view override(IController) returns (bool) {
        Batch batch = Batch(projectsToBatches[_project]);

        return
            _hasKYC(_user, _merkleProof) &&
            _belongsToDAO(_user) &&
            batch.userHasVotedForProject(_project, _user);
    }

    function canVote(address _user, bytes32[] calldata _merkleProof)
        external
        view
        override(IController)
        returns (bool)
    {
        return _hasKYC(_user, _merkleProof) && _belongsToDAO(_user);
    }

    /// @inheritdoc IController
    function setBatchVotingPeriod(
        address batch,
        uint256 start,
        uint256 end,
        uint256 extraInvestmentDuration
    ) external override(IController) onlyRole(BATCH_MANAGER_ROLE) {
        Batch(batch).setVotingPeriod(start, end, extraInvestmentDuration);
    }

    function _hasKYC(address _user, bytes32[] calldata _merkleProof)
        internal
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(_user));
        bool isValid = MerkleProof.verify(_merkleProof, merkleRoot, leaf);

        return isValid;
    }

    function _belongsToDAO(address _user) internal view returns (bool) {
        return
            IERC20(token).balanceOf(_user) > 0 ||
            IStaking(staking).hasStaked(_user);
    }

    //
    // Role queries
    //

    // Checks if a given account has the PROJECT_MANAGER_ROLE role
    function hasProjectManagerRole(address _account)
        external
        view
        returns (bool)
    {
        return hasRole(PROJECT_MANAGER_ROLE, _account);
    }

    // Checks if a given account has the BATCH_MANAGER_ROLE role
    function hasBatchManagerRole(address _account)
        external
        view
        returns (bool)
    {
        return hasRole(BATCH_MANAGER_ROLE, _account);
    }

    // Checks if a given account has the LEGAL_MANAGER_ROLE role
    function hasLegalManagerRole(address _account)
        external
        view
        returns (bool)
    {
        return hasRole(BATCH_MANAGER_ROLE, _account);
    }

    //
    // Queries
    //

    /// @inheritdoc IController
    function getBatchForProject(address _project)
        external
        view
        returns (address)
    {
        return projectsToBatches[_project];
    }

    //
    // ERC165
    //

    /// @inheritdoc ERC165
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC165, AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IController).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
