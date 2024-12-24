// SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

import {Test,console2} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {DeployRaffle} from "../../script/DeployRaffle.s.sol";
import {HelperConfig, CodeConstants} from "../../script/HelperConfig.s.sol";
import {Raffle} from "../../src/Raffle.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "../mocks/LinkToken.sol";


contract RaffleTest is Test, CodeConstants {
    Raffle public raffle;
    HelperConfig public helperConfig;

    address public PLAYER = makeAddr("player");
    uint256 public constant PLAYER_BALANCE = 10 ether;

    uint256 enteranceFee;
    uint256 interval;
    address vrfCoordinator;
    bytes32 gasLane;
    uint256 subsriptionId;
    uint32 callbackGasLimit;
    LinkToken link;

       /* Event**/
    event EnteredRaffle(address indexed player);
    event Winner(address indexed winner);

    function setUp() external {
        DeployRaffle deployRaffle = new DeployRaffle();
        (raffle,helperConfig) = deployRaffle.run();
        vm.deal(PLAYER, PLAYER_BALANCE);

        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        enteranceFee = config.enteranceFee;
        interval = config.interval;
        vrfCoordinator = config.vrfCoordinator;
        // vrfCoordinatorV2_5 = config.
        gasLane = config.gasLane;
        subsriptionId = config.subsriptionId;
        callbackGasLimit = config.callbackGasLimit;
        link = LinkToken(config.link);

        // vm.deal(PLAYER, PLAYER_BALANCE);

        vm.startPrank(msg.sender);
        if (block.chainid == LOCAL_CHAIN_ID) {
            link.mint(msg.sender, PLAYER_BALANCE);
            VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subsriptionId, PLAYER_BALANCE);
        }
        link.approve(vrfCoordinator, PLAYER_BALANCE);
        vm.stopPrank();
       
    }



    function testRaffleStateIsOpen() public view {
        assert(raffle.getRaffleState() == Raffle.RaffleState.OPEN);
    }

    function testEntranceFeeIsNotEnoughPayed() public {
        // Arrange
        vm.prank(PLAYER);
        // Asserts
        vm.expectRevert(Raffle.Raffle__SendMoreEntranceFee.selector);
        // Acts
        raffle.enterRaffle();
    }

    function testRecordesAreStoredInRaffle() public {
        vm.prank(PLAYER);

        raffle.enterRaffle{value: enteranceFee}();
        address playerRecorded = raffle.getPlayers(0);
        assert(playerRecorded == PLAYER);
    }

    function testEnteringPlayersEvents() public {
        vm.prank(PLAYER);

        vm.expectEmit(true, false, false , false, address(raffle));
        emit EnteredRaffle(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
    }

    function testDontAllowPeopleToEnterWhileCalculation() public {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);
        raffle.performUpkeep("");
        // Act
        vm.expectRevert(Raffle.Raffle_ISBusyToCalculating.selector);
        // Assert
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();

    }

    function testCheckUpkeedNeededReturnsFalseIfNoBalance() public {
        // Arrange
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);

        // Act
        (bool upKeepNeeded,) = raffle.checkUpkeep("");
        // Assert
       assert(!upKeepNeeded);
    }

    function testCheckUpKeepNeededReturnsFalseIfIsNotOpen() public {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);
        raffle.performUpkeep("");

        // Act
        (bool upKeepNeeded,) = raffle.checkUpkeep("");
        // Assert
        assert(!upKeepNeeded);
    }

    // Writing Some Perform Up keep Test

    function testPerformUpKeepCheckIfUpNeedIsTrue() public {
         // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);
        // raffle.performUpkeep("");

        // Act/Assert
        raffle.performUpkeep("");
    }

    function testPerformUpKeepCheckIfUpNeedIsFalse() public {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();

        vm.expectRevert(Raffle.RAFFLE__UPKEEPNOTNEEDED.selector);

        raffle.performUpkeep("");
    }

    function testPerformKeepCheckUpdatesRaffleStateAndEmitsRequestId() public {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);

        // Act
        vm.recordLogs();
        raffle.performUpkeep("");
        Vm.Log[] memory entries = vm.getRecordedLogs();
        bytes32 requestId = entries[1].topics[1];

        // Assert
        Raffle.RaffleState raffleState = raffle.getRaffleState();
        assert(uint256(requestId) > 0); 
        assert(uint256(raffleState) == 1);
    } 

      modifier skipFork() {
        if (block.chainid != 31337) {
            return;
        }
        _;
    }


    // Test oF fulfillRandomWords

    function testFullFillRandomWordsCallsAfterPerformUpKeep(uint256 randomRequestId) public skipFork {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);

        // Act/ Assert
        vm.expectRevert(VRFCoordinatorV2_5Mock.InvalidRequest.selector);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(randomRequestId, address(raffle));
    }

    function testFulfillRandomWordsPicksAWinnerResetsAndSendsMoney() public skipFork {
        // Arrange
        vm.prank(PLAYER);
        raffle.enterRaffle{value: enteranceFee}();
        vm.warp(block.timestamp + interval + 1);
        vm.roll(block.number + 1);

        address expectedWinner = address(1);

        // Arrange
        uint256 additionalEntrances = 3;
        uint256 startingIndex = 1; // We have starting index be 1 so we can start with address(1) and not address(0)

        for (uint256 i = startingIndex; i < startingIndex + additionalEntrances; i++) {
            address player = address(uint160(i));
            hoax(player, 1 ether); // deal 1 eth to the player
            raffle.enterRaffle{value: enteranceFee}();
        }

        uint256 startingTimeStamp = raffle.getLastTimeStamp();
        uint256 startingBalance = expectedWinner.balance;

        // Act
        vm.recordLogs();
        raffle.performUpkeep(""); // emits requestId
        Vm.Log[] memory entries = vm.getRecordedLogs();
        console2.logBytes32(entries[1].topics[1]);
        bytes32 requestId = entries[1].topics[1]; // get the requestId from the logs

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(uint256(requestId), address(raffle));

        // Assert
        address recentWinner = raffle.getRecentWinner();
        Raffle.RaffleState raffleState = raffle.getRaffleState();
        uint256 winnerBalance = recentWinner.balance;
        uint256 endingTimeStamp = raffle.getLastTimeStamp();
        uint256 prize = enteranceFee * (additionalEntrances + 1);

        assert(recentWinner == expectedWinner);
        assert(uint256(raffleState) == 0);
        assert(winnerBalance == startingBalance + prize);
        assert(endingTimeStamp > startingTimeStamp);
    }

}