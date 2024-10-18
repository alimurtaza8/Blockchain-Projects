// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script,console} from "forge-std/Script.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {FundingContract} from "../src/FundingContract.sol";

contract FundFundingContract is Script {

    uint256 constant SEND_VALUE = 0.01 ether;

    function fundFundingContract(address mostRecentDeployedContractAddress) public { 
        vm.startBroadcast();
        FundingContract(payable(mostRecentDeployedContractAddress)).fund{value: SEND_VALUE}();
         vm.stopBroadcast();
        console.log("Funded in FundingContract %s", SEND_VALUE);
    }

    function run() external {
        address mostRecentDeployedContractAddress = DevOpsTools.get_most_recent_deployment(
            "FundingContract", 
            block.chainid
            );
            vm.startBroadcast();
            fundFundingContract(mostRecentDeployedContractAddress);
            vm.stopBroadcast();
    }

}

contract WithdrawFundingContract is Script {
    
    uint256 constant SEND_VALUE = 0.01 ether;

    function withdrawFundingContract(address mostRecentDeployedContractAddress) public { 
        vm.startBroadcast();
        FundingContract(payable(mostRecentDeployedContractAddress)).withdraw();
        vm.stopBroadcast();
    }

    function run() external {
        address mostRecentDeployedContractAddress = DevOpsTools.get_most_recent_deployment(
            "FundingContract", 
            block.chainid
            );
            vm.startBroadcast();
            withdrawFundingContract(mostRecentDeployedContractAddress);
            vm.stopBroadcast();
    }
}

