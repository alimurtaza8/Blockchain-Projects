// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import {Script} from "forge-std/Script.sol";

import {RentalAgreement} from "../src/RentalAgreement.sol";

contract DeployRentalAgreement is Script {
   
     function run() external returns (RentalAgreement) {

        vm.startBroadcast();
        RentalAgreement rentalAgreement = new RentalAgreement(); 
        vm.stopBroadcast();
        return rentalAgreement;
    }

}