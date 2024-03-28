// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * An ERC20 token meant for testing purposes (free minting & burning)
 */
contract MockERC20 is ERC20 {
    uint8 _decimals;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 __decimals
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 1e9 ether);
        _decimals = __decimals;
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) external {
        _burn(_from, _amount);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
