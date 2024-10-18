// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConverter{
    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        // Address of Network like sepolia =0x694AA1769357215DE4FAC081bf1f309aDC325306
        // ABI
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (,int256 answer,,,) = priceFeed.latestRoundData();
        // Now Here I have to do some math because in smart contract we deal with whole numbers not decimals
        // So How To Set This?
        // priceFeed will return 2000,00000000
        // Their will be 10 decimals will miss beacuse msg.value will return this number 1e18 which is 1*10**18
        // Now To convert this 
        return uint256(answer * 1e10);
    }

    function getConverstionRate(uint256 ethAmount,AggregatorV3Interface priceFeed) internal view returns (uint256){
        // ethAmount is msg.value which is a wei price of 1 ETH like this = 1000000000000000000
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountToUSD = (ethPrice * ethAmount) / 1e18;
        return ethAmountToUSD;
        // Now Little math here 2000_00000000000000000 * 1000000000000000000/1000000000000000000
    }
}