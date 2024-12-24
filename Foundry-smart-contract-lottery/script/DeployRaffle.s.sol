// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
// import {Raffle} from "../src/Raffle.sol"
import {Raffle} from "../src/Raffle.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {CreateSubscription, FundSubscription, AddConsumer} from "./Interactions.s.sol";

contract DeployRaffle is Script {

    function run () public {
        deployContract();
    }

    function deployContract() public returns (Raffle, HelperConfig){
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        if(config.subsriptionId == 0){
            // create subscription
            CreateSubscription createSubscription = new CreateSubscription();
            (config.subsriptionId, config.vrfCoordinator) = createSubscription.createSubscription(config.vrfCoordinator, config.accounts);

            // Fund it
            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(config.vrfCoordinator, config.subsriptionId, config.link,  config.accounts);

        }

        vm.startBroadcast(config.accounts);
        Raffle raffle = new Raffle(
            config.enteranceFee,
            config.interval,
            config.vrfCoordinator,
            config.gasLane,
            config.subsriptionId,
            config.callbackGasLimit
        );
        vm.stopBroadcast();
        AddConsumer addConsumer = new AddConsumer();
        addConsumer.addConsumer(address(raffle), config.vrfCoordinator, config.subsriptionId, config.accounts);
        return (raffle,helperConfig);
    }
}


