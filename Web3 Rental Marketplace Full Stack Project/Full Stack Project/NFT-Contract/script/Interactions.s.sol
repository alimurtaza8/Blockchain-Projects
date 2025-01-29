// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
import {EquipmentNFT} from "../src/EquipmentNFT.sol";

contract MintEquipmentNFT is Script {
    // Temporary static IPFS URI for all equipment
    string public constant STATIC_IPFS_URI = 
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    function run() external {
        address mostRecentDeployed = DevOpsTools.get_most_recent_deployment(
            "EquipmentNFT", 
            block.chainid
        );
        
        require(mostRecentDeployed != address(0), "No EquipmentNFT deployment found");

        _mintWithStaticURI(
            mostRecentDeployed, 
            "Drill Machine", 
            "Heavy-duty industrial drill"
        );
    }

    function _mintWithStaticURI(
        address contractAddress,
        string memory name,
        string memory description
    ) internal {
        uint256 initialSupply = EquipmentNFT(contractAddress).getTotalSupply();
        
        vm.startBroadcast();
        EquipmentNFT(contractAddress).mintEquipment(
            name,
            description,
            STATIC_IPFS_URI // Using constant URI
        );
        vm.stopBroadcast();

        // Verification and logging
        uint256 newSupply = EquipmentNFT(contractAddress).getTotalSupply();
        require(newSupply == initialSupply + 1, "Mint verification failed");
        console.log("Minted NFT ID %s with static URI:", initialSupply);
        console.log(STATIC_IPFS_URI);
    }
}