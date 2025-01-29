// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {EquipmentNFT} from "../src/EquipmentNFT.sol";

contract DeployEquipmentNFT is Script {

    function run() external returns (EquipmentNFT){
        vm.startBroadcast();
        EquipmentNFT equipmentNft = new EquipmentNFT(msg.sender);
        vm.stopBroadcast();
        return equipmentNft;
    }
}