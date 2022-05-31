// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {Pool} from "./Pool.sol";
import {IProject} from "../interfaces/IProject.sol";

import "hardhat/console.sol";

contract TestPool is Pool {
    constructor(
        uint256 _saleSupply,
        address _investmentToken,
        uint256 _cliffMonths,
        uint256 _vestingMonths
    ) Pool(_saleSupply, _investmentToken, _cliffMonths, _vestingMonths) {}

    function mock_setVestingStart(uint256 _vestingStart) public {
        vestingStart = _vestingStart;
    }

    function withdrawn(address _to)
        public
        view
        override(Pool)
        returns (uint256)
    {
        return IProject(project).withdrawnStakersPool(_to);
    }
}
