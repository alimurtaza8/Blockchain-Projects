// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {FundingContract} from "../src/FundingContract.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployFundingContract is Script {

    function run() external returns (FundingContract) {

        HelperConfig helperConfig = new HelperConfig();
        address priceFeed = helperConfig.activeNetworkConfig();

        vm.startBroadcast();
        FundingContract fundingContract = new FundingContract(priceFeed); 
        vm.stopBroadcast();
        return fundingContract;
    }
}

