// SPDX-License-Identifier: MIT
pragma solidity =0.8.12;

import {Pool} from "./Pool.sol";
import {IBatch} from "../interfaces/IBatch.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PeoplesPool is Pool {
  constructor(uint256 _saleSupply) Pool(_saleSupply) {}
}
