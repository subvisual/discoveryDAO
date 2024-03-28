// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Pool} from "./Pool.sol";

contract PeoplesPool is Pool {
    constructor(uint256 _saleSupply, address _investmentToken)
        Pool(_saleSupply, _investmentToken)
    {}
}
