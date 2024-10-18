// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VotingSystem} from "../src/VotingSystem.sol";
import {Script} from "forge-std/Script.sol";

contract DeployVotingSystem is Script {
    // VotingSystem public votingSystem;

    function run () external returns (VotingSystem){
        vm.startBroadcast();
        VotingSystem votingSystem = new VotingSystem();
        vm.stopBroadcast();
        return votingSystem;
    }
}