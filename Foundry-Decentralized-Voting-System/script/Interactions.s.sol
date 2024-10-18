// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script,console} from "forge-std/Script.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {VotingSystem} from "../src/VotingSystem.sol";

contract VoteVotingSystem is Script {

    address candidate1;
    address voter1;

    function voteVotingSystem(address mostRecentDeployedContractAddress) public { 
        candidate1 = address(0x1);
        voter1 = address(0x2);
        
        vm.startBroadcast();
        
        VotingSystem votingSystem = VotingSystem(mostRecentDeployedContractAddress);
        votingSystem.addCandidate(candidate1, "Candidate 1 Name");
        votingSystem.addVoter(voter1, "Voter 1 Name");
        votingSystem.vote(voter1, candidate1);
        
        vm.stopBroadcast();
        console.log("Voted in VotingSystem with voter %s and candidate %s", voter1, candidate1);
    }

    function run() external {
        address mostRecentDeployedContractAddress = DevOpsTools.get_most_recent_deployment(
            "VotingSystem", 
            block.chainid
            );
            vm.startBroadcast();
            voteVotingSystem(mostRecentDeployedContractAddress);
            vm.stopBroadcast();
    }
}

contract WinVotingSystem is Script {
    address candidate1;
    address voter1;
    
    function winVotingSystem(address mostRecentDeployedContractAddress) public { 
        candidate1 = address(0x1);
        voter1 = address(0x2);
        
        vm.startBroadcast();
        
        VotingSystem votingSystem = VotingSystem(mostRecentDeployedContractAddress);
        votingSystem.addCandidate(candidate1, "Candidate 1 Name");
        votingSystem.addVoter(voter1, "Voter 1 Name");
        votingSystem.vote(voter1, candidate1);
        
        votingSystem.win();
        vm.stopBroadcast();
    }

    function run() external {
        address mostRecentDeployedContractAddress = DevOpsTools.get_most_recent_deployment(
            "VotingSystem", 
            block.chainid
            );
            vm.startBroadcast();
            winVotingSystem(mostRecentDeployedContractAddress);
            vm.stopBroadcast();
    }
}

