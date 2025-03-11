// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {CrawToken} from "../src/CrawToken.sol";
import {MerkleAirDrop} from "../src/MerkleAirDrop.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract DeployMerkleAirDrop is Script {

    uint256 public s_amountToTransfer = 4* 25 * 1e18;

    bytes32 private s_merkleRoot = 0xaa5d581231e596618465a56aa0f5870ba6e20785fe436d5bfb82b08662ccc7c4;
    

 
    function deployMerkleAirdrop() public returns (CrawToken, MerkleAirDrop){
        vm.startBroadcast();
        CrawToken token = new CrawToken();
        MerkleAirDrop airdrop = new MerkleAirDrop(s_merkleRoot,IERC20(address(token)));
        token.mint(token.owner(),s_amountToTransfer);
        token.transfer(address(airdrop),s_amountToTransfer);
        vm.stopBroadcast();
        return (token,airdrop);

    }

    function run() external returns (CrawToken,MerkleAirDrop){
        return deployMerkleAirdrop();
    }
}