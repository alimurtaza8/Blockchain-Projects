// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error notOwner();

contract VotingSystem{
    // we need to create some varibles and some functions to implement this project
    // declaring variables some are storage variable and some not
    struct CandidateInfo {
        address CID;
        string name;
        uint256 voteCount;
    }
    mapping (address CID => CandidateInfo) private s_candidates;

    CandidateInfo[] private s_listOfCandidate; 

    struct VoterInfo{
        address VID;
        string name;
        bool voteStatus; 
    } 

    mapping (address VID => VoterInfo) private s_voters;

    event CandidateAdded(address indexed CID, string name);
    event VoteCasted(address indexed VID, address indexed CID);
    // VoterInfo[] public listOfVoters;

    address private immutable i_owner;

    constructor(){
        i_owner = msg.sender;
    }

    function addCandidate(address _CID, string memory _name) public { // For storing candidate info in the blockchain
        // CandidateInfo memory candidates = CandidateInfo (_VID,name);
        s_listOfCandidate.push(CandidateInfo(_CID, _name, 0));
        s_candidates[_CID] = CandidateInfo(_CID,_name,0);
        emit CandidateAdded(_CID, _name);
     }

    function addVoter(address _VID, string memory _name) public { // for storing voter info
        // listOfVoters.push(VoterInfo(_VID, _name, _voteStatus));
        s_voters[_VID] = VoterInfo(_VID, _name,false);
    }

    // main vote function
    function vote(address _VID, address _CID) public {
        // check if the voter caste status is true or false 
        require(s_voters[_VID].VID != address(0),"Not Exits");
       
        require(!s_voters[_VID].voteStatus, "You Already Caste a Vote Man");

        // candidates exits or not
        require(s_candidates[_CID].CID != address(0), "Candidates Does Not Exits");

        // If voter give first time vote
        s_voters[_VID].voteStatus = true;
        s_candidates[_CID].voteCount++;

        emit VoteCasted(_VID, _CID);
    }

    function win() public onlyOnwer view returns (address) {
        // Now How to check which one is win?
        address winningCandidate = address(0);
        uint256 maxVote = 0;
        // loop through the entire candidates list and check the max votecount
        for(uint256 i = 0; i < s_listOfCandidate.length; i++){
            if (s_candidates[s_listOfCandidate[i].CID].voteCount > maxVote){
                winningCandidate = s_listOfCandidate[i].CID;
                maxVote = s_candidates[s_listOfCandidate[i].CID].voteCount;
            }
        }
        return winningCandidate;
    }

    modifier onlyOnwer(){
        if(msg.sender != i_owner){
            revert notOwner();
        }
        _;
    }

    function retreiveCandidate(address _CID) public view returns (CandidateInfo memory){
        return s_candidates[_CID];
    }

    function retreiveVoters(address _VID) public view returns (VoterInfo memory){
        return s_voters[_VID];
    }

    function retreiveOnwner() public view returns (address){
        return i_owner;
    }
}


