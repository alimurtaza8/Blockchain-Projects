// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title Raffle A Smart Contract
 * @author Ali Murtaza  
 * @notice This is a simple lottery smart contract
 */

contract Raffle is VRFConsumerBaseV2Plus {

    /* Errors **/
    error Raffle__SendMoreEntranceFee();
    error Raffle__TransferFail();
    error Raffle_ISBusyToCalculating();
    error RAFFLE__UPKEEPNOTNEEDED();

    /* Type Declarations */

    enum RaffleState {
        OPEN,
        CALCULATING }

    /* State Variables */
    uint16 private constant REQUEST_CONFRIMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private immutable i_entranceFee;
    uint256 private immutable i_interval;
    bytes32 private immutable i_keyHash;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    address payable[] private  s_players;
    uint256 private  s_lastTimeStamp;
    address private s_recentWinner;
    RaffleState private s_raffleState; 

    /* Event**/
    event EnteredRaffle(address indexed player);
    event Winner(address indexed winner);
    event WinnerRequestId(uint256 indexed requestId);

    constructor (uint256 enteranceFee, uint256 interval, address vrfCoordinator,bytes32 gasLane,
    uint256 subsriptionId, uint32 callbackGasLimit) 
    VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_entranceFee = enteranceFee;
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;
        i_keyHash = gasLane;
        i_subscriptionId = subsriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
    }

    function enterRaffle() external payable {
        if(msg.value < i_entranceFee) {
            revert Raffle__SendMoreEntranceFee();
        }
        if (s_raffleState != RaffleState.OPEN){
            revert Raffle_ISBusyToCalculating(); 
        }
        s_players.push(payable(msg.sender));
        emit EnteredRaffle(msg.sender);
    }

    function checkUpkeep(bytes memory /*callData*/) public view  returns 
    (bool upkeepNeeded, bytes memory /* performData */) {

       bool timeHasPassed = ((block.timestamp - s_lastTimeStamp) >= i_interval);
       bool isOpen = s_raffleState == RaffleState.OPEN;
       bool hasBalance = address(this).balance > 0;
       bool hasPlayers = s_players.length > 0;
       upkeepNeeded = timeHasPassed && isOpen && hasBalance && hasPlayers;
       
       return (upkeepNeeded, "");
    } 

    function performUpkeep(bytes calldata /* performData */) external  {
        // if ((block.timestamp - s_lastTimeStamp) < i_interval) {
        //     revert();
        // }
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded){
            revert RAFFLE__UPKEEPNOTNEEDED();
        }

        s_raffleState = RaffleState.CALCULATING;

        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest(
            {
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFRIMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    // Set nativePayment to true to pay for VRF requests with Sepolia ETH instead of LINK
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )

            }
        );
    
         uint256 requestId = s_vrfCoordinator.requestRandomWords(request);
         emit WinnerRequestId(requestId);
    }
    
    /** 
     Getter Functions 
     */

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] calldata randomWords) internal override{
        // do the mod so the winner will pick 
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        s_lastTimeStamp = block.timestamp;
        emit Winner(s_recentWinner);
        
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success){
            revert Raffle__TransferFail();
        }
        
    }

    function getEntranceFee() external view returns (uint256) {
        return i_entranceFee;
    }

    function getRaffleState() external view returns (RaffleState){
        return s_raffleState;
    }

    function getPlayers(uint256 indexOfPlayer) public view returns (address){
        return s_players[indexOfPlayer];
    }

    function getLastTimeStamp() public view returns (uint256){
        return s_lastTimeStamp;
    }

    function getRecentWinner() public view returns (address){
        return s_recentWinner;
    }

}
