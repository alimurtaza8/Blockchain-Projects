// Why creating mock contracts? like I created HelperConfig.s.sol
// 1. Deploy mocks when we are on a local chain
// 2. Deploy mocks when we are on a live chain (e.g. mainnet, kovan, goerli)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../test/mock/MockV3Aggregator.sol";

contract HelperConfig is Script {

    NetworkConfig public activeNetworkConfig;
    uint8 public constant DECIMALS = 8;
    int256 public constant INITIAL_ANSWER = 2000e8;

    struct NetworkConfig {
        address priceFeed;
    }

    constructor(){
        if (block.chainid == 11155111){
            activeNetworkConfig = getSepoliaEthConfig(); 
        }
        else if(block.chainid == 1){
            activeNetworkConfig = getMainnetEthConfig();
        }
        else{
            activeNetworkConfig = getOrCreateAnvilEthConfig();
        }
    }

    function getSepoliaEthConfig() public pure returns (NetworkConfig memory){
        // We need a price Feed?
        NetworkConfig memory sepoliaEth = NetworkConfig({
            priceFeed:0x694AA1769357215DE4FAC081bf1f309aDC325306
        });

        return sepoliaEth; 
    }

    function getMainnetEthConfig() public pure returns (NetworkConfig memory){
        // We need a price Feed?
        NetworkConfig memory mainnetEth = NetworkConfig({
            priceFeed:0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
        });

        return mainnetEth; 
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory){
        if (activeNetworkConfig.priceFeed != address(0)){
            return activeNetworkConfig;
        }

        vm.startBroadcast();
        MockV3Aggregator mockPriceFeed = new MockV3Aggregator(DECIMALS,INITIAL_ANSWER);
        vm.stopBroadcast();

        NetworkConfig memory anvilEth = NetworkConfig({
            priceFeed:address(mockPriceFeed)
        });
        return anvilEth;

    }
}