// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CrawToken is ERC20, Ownable {
    
    constructor() ERC20("CrawToken","CT") Ownable(msg.sender){}

    // mint function
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

}