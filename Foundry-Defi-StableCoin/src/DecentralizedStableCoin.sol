// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DecentralizedStableCoin is ERC20Burnable ,Ownable{
    // errors
    error DecentralizedStableCoin__MustBeMoreThanzero();
    error DecentralizedStableCoin__BalanceISNotEnoughMan();
    error DecentralizedStableCoin__EmptyAddressNotAllowed();

    constructor() ERC20("DecentralizedStableCoin", "DSC") Ownable(msg.sender) {}

    // The Burn Function
    function burn(uint256 _amount) public override onlyOwner{
        uint256 balance = balanceOf(msg.sender);

        if(_amount <= 0){
            revert DecentralizedStableCoin__MustBeMoreThanzero();
        }
        if(balance < _amount){
            revert DecentralizedStableCoin__BalanceISNotEnoughMan();
        }
        // Now Burn it

        super.burn(_amount);
    }

    // min function
    function mint(address _to, uint256 _amount) external onlyOwner returns(bool){
        if (_to == address(0)){
            revert DecentralizedStableCoin__EmptyAddressNotAllowed();
        }
        if(_amount <= 0){
            revert DecentralizedStableCoin__MustBeMoreThanzero();
        }
        // Now mint it
        _mint(_to, _amount);

        return true;
    }


}