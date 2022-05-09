// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {Pool} from "./Pool.sol";

contract TestPool is Pool {
    constructor(uint256 _saleSupply, address _controller) Pool(_saleSupply, _controller) {}
}
