// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {AggregatorV3Interface} from "@chainlink/contracts/v0.8/shared/interfaces/AggregatorV3Interface.sol";


/**
 * @title OracleLib
 * @author Ali Murtaza
 * @notice This library is used to check the chainlink Oracle for stale data
 * If a price is stale, than the function will revert and render The DSCEngine unusable - This is just by design 
 * stale means (The Price is not good or bad)
 * We want the DSCEngine will freeze if become stale
 */

library OracleLib {

    error OracleLib__StalePrice();

    uint256 private constant TIMEOUT = 3 hours; // which is equall to 3*60*60 = 10800 seconds

    function staleCheckLatestRoundData(AggregatorV3Interface priceFeed) public view returns (uint80, int256, uint256, uint256, uint80){
        (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound) = priceFeed.latestRoundData();

        uint256 secondSince = block.timestamp - updatedAt;

        if (secondSince > TIMEOUT) {
            revert OracleLib__StalePrice();
        }

        return (roundId,answer,startedAt,updatedAt,answeredInRound);

    } 
}