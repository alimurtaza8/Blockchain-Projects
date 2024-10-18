// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VotingSystem} from "../../src/VotingSystem.sol";
import {DeployVotingSystem} from "../../script/DeployVotingSystem.s.sol";

contract VotingSystemTest is Test {
    VotingSystem votingSystem;

    function setUp() external {
        DeployVotingSystem deployVotingSystem = new DeployVotingSystem();
        votingSystem = deployVotingSystem.run();
    }

    function testIsOwner() public view{
        assertEq(votingSystem.retreiveOnwner(),msg.sender);
    }

    function testVoterHasVoted() public {
       address voter = address(0x1);
       address candidate = address(0x2);

       votingSystem.addVoter(voter, "Voter Name");
       votingSystem.addCandidate(candidate, "Candidate Name");

       assertEq(votingSystem.retreiveVoters(voter).voteStatus, false);
       votingSystem.vote(voter,candidate);

       assertEq(votingSystem.retreiveVoters(voter).voteStatus, true);
    }

    function testAddCandidate() public {
        address candidate = address(0x1);
        string memory name = "Candidate Name";
        votingSystem.addCandidate(candidate, name);
        assertEq(votingSystem.retreiveCandidate(candidate).CID, candidate);
        assertEq(votingSystem.retreiveCandidate(candidate).name, name);
    }

    function testAddVoter() public {
        address voter = address(0x1);
        string memory name = "voter Name";

        votingSystem.addVoter(voter,name);
        assertEq(votingSystem.retreiveVoters(voter).VID, voter);
        assertEq(votingSystem.retreiveVoters(voter).name, name);
    }

    function testAddCandidateTwice() public {
        address candidate = address(0x1);

        votingSystem.addCandidate(candidate, "Candidate Name");
        votingSystem.addCandidate(candidate, "updated Candidate Name");
        assertEq(votingSystem.retreiveCandidate(candidate).name, "updated Candidate Name");
    }

     function testAddVoterTwice() public {
        address voter = address(0x1);

        votingSystem.addVoter(voter, "voter Name");
        votingSystem.addVoter(voter, "updated voter Name");
        assertEq(votingSystem.retreiveVoters(voter).name, "updated voter Name");
    }

    function testVoterCanNotVoteTwice() public {
        address voter = address(0x1);
        address candidate = address(0x2);

        votingSystem.addVoter(voter, "Voter Name");
        votingSystem.addCandidate(candidate, "Candidate Name");

        votingSystem.vote(voter,candidate);
        
        vm.expectRevert("You Already Caste a Vote Man");
        votingSystem.vote(voter,candidate);
    }

    function testNotExitsVoterCanNotVote() public {
        address voter = address(0x1);
        address candidate = address(0x2);

        votingSystem.addCandidate(candidate, "candidate Name");

        vm.expectRevert("Not Exits");
        votingSystem.vote(voter,candidate);
    }

    function testNotExitsCandidateCanNotVote() public {
        address voter = address(0x1);
        address candidate = address(0x2);

        votingSystem.addVoter(voter, "Voter Name");

        vm.expectRevert("Candidates Does Not Exits");
        votingSystem.vote(voter,candidate);
    }

    function testCorrectWinner() public {
        address candidate1 = address(0x1);
        address candidate2 = address(0x2);

        votingSystem.addCandidate(candidate1, "Candidate1 Name");
        votingSystem.addCandidate(candidate2, "Candidate2 Name");

        address voter1 = address(0x3);
        address voter2 = address(0x4);

        votingSystem.addVoter(voter1, "Voter1 Name");
        votingSystem.addVoter(voter2, "Voter2 Name");

        votingSystem.vote(voter1,candidate1);
        votingSystem.vote(voter2,candidate1);

        hoax(votingSystem.retreiveOnwner());

        assertEq(votingSystem.win(), candidate1);
    }

    function testCallWinOnlyOwner() public {
    // Set the test contract's msg.sender to the owner
        hoax(votingSystem.retreiveOnwner());
    
    // Now the withdraw function will pass because msg.sender is the owner
        votingSystem.win();
    }
}
