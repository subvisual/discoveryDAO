// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {IController} from "./interfaces/IController.sol";
import {IProject} from "./interfaces/IProject.sol";

contract Project is IProject {
    // deployed by each individual project owner, when registering
    // must be deployed via the Controller
    // will have a similar role as the CTND Vesting contract

    // The IController instance in control of this project
    address public immutable controller;

    // The token to be listed for sale
    address public immutable token;

    // Total supply of {token} up for sale
    uint256 public immutable saleSupply;

    // fixed price of token, expressed in paymentToken amount
    uint256 public immutable rate;

    // Project description, given at registration
    string public description;

    // has the project been approved by a Citizend manager
    bool approvedByManager;

    constructor(
        string memory _description,
        address _token,
        uint256 _saleSupply,
        uint256 _rate
    ) {
        controller = msg.sender;

        description = _description;
        token = _token;
        saleSupply = _saleSupply;
        rate = _rate;
    }

    //
    // Modifiers
    //

    modifier onlyManager(address _account) {
        require(
            IController(controller).hasProjectManagerRole(msg.sender),
            "not a project manager"
        );
    }

    //
    // IProject
    //

    /// @inheritdoc IProject
    function approveByManager() public override(IProject) onlyManager {
        approvedByManager = true;
    }

    /// @inheritdoc IProject
    function hasTokens() external view override(IProject) returns (bool) {
        uint256 balance = IERC20(token).balanceOf(address(this));

        return balance >= saleSupply;
    }

    /// @inheritdoc IProject
    function isReadyForListing()
        external
        view
        override(IProject)
        returns (bool)
    {
        return hasTokens() && approvedByManager;
    }
}
