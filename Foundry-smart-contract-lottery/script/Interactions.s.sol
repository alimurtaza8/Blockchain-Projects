// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig, CodeConstants} from "./HelperConfig.s.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";


contract CreateSubscription is Script {
    
    function CreateSubscriptionByUsingConfig() public returns(uint256,address){
        HelperConfig helperConfig = new HelperConfig();
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        address accounts = helperConfig.getConfig().accounts;
        (uint256 subId,) = createSubscription(vrfCoordinator,accounts);
        return (subId,vrfCoordinator);
    }

    function createSubscription(address vrfCoordinator, address accounts) public returns (uint256, address){
        console.log("Creating Subscription ID in Blockchain on ID: ", block.chainid);
        vm.startBroadcast(accounts);
        uint256 subId = VRFCoordinatorV2_5Mock(vrfCoordinator).createSubscription();
        vm.stopBroadcast();
        console.log("Subscription ID is Added..", subId);
        return (subId, vrfCoordinator);
    }

    function run() public {
        CreateSubscriptionByUsingConfig();
    }
}

contract FundSubscription is Script{
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    uint256 public constant FUND_AMOUNT = 10 ether;

    function fundSubscriptionUsingConfig() public {
        HelperConfig helperConfig = new HelperConfig();
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        uint256 subScriptionId = helperConfig.getConfig().subsriptionId;
        address linkToken = helperConfig.getConfig().link;
        address accounts = helperConfig.getConfig().accounts;
        fundSubscription(vrfCoordinator,subScriptionId,linkToken,accounts);

    }

    function fundSubscription(address vrfCoordinator, uint256 subScriptionId, address linkToken, address accounts) public {
        console.log("Funding Token: ", linkToken);
        console.log("Using VRF: ", vrfCoordinator);
        console.log("on ChainID: ", block.chainid);

        if (block.chainid == LOCAL_CHAIN_ID){
            vm.startBroadcast();
            VRFCoordinatorV2_5Mock(vrfCoordinator).fundSubscription(subScriptionId, FUND_AMOUNT * 100);
            vm.stopBroadcast();
        }
        else{
            vm.startBroadcast(accounts);
            // LinkToken.transferAndCall(vrfCoordinator, FUND_AMOUNT, abi.encode(subScriptionId));
            LinkToken linkToken = new LinkToken();
            linkToken.transferAndCall(vrfCoordinator, FUND_AMOUNT, abi.encode(subScriptionId));
            
            vm.stopBroadcast();
        }

    }
    
    function run () public {
        fundSubscriptionUsingConfig();
    }
}


contract AddConsumer is Script {
    
    function addConsumerUsingConfig(address mostRecentDeployedContract) public {
        HelperConfig helperConfig = new HelperConfig();
        uint256 subId = helperConfig.getConfig().subsriptionId;
        address vrfCoordinator = helperConfig.getConfig().vrfCoordinator;
        address accounts = helperConfig.getConfig().accounts;
        addConsumer(mostRecentDeployedContract, vrfCoordinator, subId, accounts);
    }

   function addConsumer(address addressOfRecentDeployedContract, address vrfCoordinator,
   uint256 subId, address accounts) public {
        console.log("Adding consumer in VRF Contract: ", addressOfRecentDeployedContract);
        console.log("To VRF: ", vrfCoordinator);
        console.log("On Block: ", block.chainid);

        vm.startBroadcast(accounts); 
        VRFCoordinatorV2_5Mock(vrfCoordinator).addConsumer(subId,addressOfRecentDeployedContract);
        vm.stopBroadcast();
   } 

    function run() external {
        address mostRecentDeployedContract = DevOpsTools.get_most_recent_deployment("Raffle", block.chainid);
        addConsumerUsingConfig(mostRecentDeployedContract);
    }
}








