
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test,console} from "forge-std/Test.sol";
import {VotingSystem} from "../../src/VotingSystem.sol";
import {DeployVotingSystem} from "../../script/DeployVotingSystem.s.sol";
import {VoteVotingSystem, WinVotingSystem} from "../../script/Interactions.s.sol";

contract InteractionsTest is Test {
    VotingSystem votingSystem;

    function setUp() external {
        DeployVotingSystem deployVotingSystem = new DeployVotingSystem();
        votingSystem = deployVotingSystem.run();
    }

    function testUserCanVoteInteractions() public {
        VoteVotingSystem voteVotingSystem = new VoteVotingSystem();
        voteVotingSystem.voteVotingSystem(address(votingSystem));
        
        VotingSystem.VoterInfo memory voterInfo = votingSystem.retreiveVoters(address(0x2));

        // Assert: Check if the voteStatus is true
        assertTrue(voterInfo.voteStatus);

        WinVotingSystem winVotingSystem = new WinVotingSystem();
        winVotingSystem.winVotingSystem(address(votingSystem));
    }
}
