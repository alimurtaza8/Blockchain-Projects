// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PriceConverter} from "./PriceConverter.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


error FundingContract_NotOwner();

contract FundingContract{

    using PriceConverter for uint256;
    
    uint256 public constant MINIMUM_USD = 5e18;
    address[] public s_funders;
    mapping(address funders => uint256 amountFounded) public s_addressToAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    constructor(address priceFeed){
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }
    
    function fund() public payable {
        // 1e18 = 1000000000000000000 = 1*10**18

        // msg.value.getConverstionRate() if any second parameter we use in getConverstionRate in first paramete like that:
        // msg.value.getConverstionRate(parameter)
        require(msg.value.getConverstionRate(s_priceFeed) >= MINIMUM_USD, "Not Enough ETH TO SEND Man...");
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
        // What is Revert
        // It undos The done action like in in abow of require code var = var + 2; which is revert to its initial state which is 1
    }

    function withdraw() public onlyOnwer {
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        // Three types for withdrawing or transfer amount from contract
        // transfer
        // how to use transfer?
        // payable (msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable (msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send Failed....");
        // call
        (bool callSuccess,) = payable (msg.sender).call{value: address(this).balance}("");
        require(callSuccess,"Call Failed...");
    }

    function cheaperWithdraw() public onlyOnwer {
        uint256 funders = s_funders.length;
        for (uint256 funderIndex = 0; funderIndex < funders; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0); 
        (bool callSuccess,) = payable (msg.sender).call{value: address(this).balance}("");
        require(callSuccess,"Call Failed...");
    }

    modifier onlyOnwer(){
        // require(msg.sender == i_owner,"You are not a owner..");
        if(msg.sender != i_owner){
            revert FundingContract_NotOwner();
        }
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function getVersion () public view returns (uint256){
        return s_priceFeed.version();
    }

    function getAddressToAmountFunded(address fundingAddress) public view returns (uint256){
        return s_addressToAmountFunded[fundingAddress]; 
    }

    function getFunders(uint256 fundersIndex) public view returns (address){
        return s_funders[fundersIndex];
    }

    function getOwner() external view returns (address){
        return i_owner;
    }
}

