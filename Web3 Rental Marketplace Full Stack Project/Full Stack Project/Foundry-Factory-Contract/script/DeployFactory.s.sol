// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
// import {RentalFactory} from "../src/contracts/RentalFactory.sol";
import {RentalFactory} from "../src/RentalFactory.sol";

contract DeployFactory is Script {
    function run() external {
        vm.startBroadcast();
        new RentalFactory();
        vm.stopBroadcast();
    }
}