// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {Script} from "forge-std/Script.sol";
import {MerkleAirDrop} from "../src/MerkleAirDrop.sol";

contract ClaimAirdrop is Script {

    error __ClaimAirdropScript__InvalidSignature();

    address public CLAIMING_ADDRESS = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 public CLAIMING_AMOUNT = 25 * 1e18;
    bytes32 public PROOF_ONE = 0xd1445c931158119b00449ffcac3c947d028c0c359c34a6646d95962b3b55c6ad;
    bytes32 public PROOF_TWO = 0xe5ebd1e1b5a5478a944ecab36a9a954ac3b6b8216875f6524caa7a1d87096576;
    bytes32[] public proof = [PROOF_ONE, PROOF_TWO];

    // this signature is always change when we redeploy
    bytes private SIGNATURE = hex"fbd2270e6f23fb5fe9248480c0f4be8a4e9bd77c3ad0b1333cc60b5debc511602a2a06c24085d8d7c038bad84edc53664c8ce0346caeaa3570afec0e61144dc11c";

    function claimAirdrop(address airdrop) public {
        vm.startBroadcast();
        (uint8 v, bytes32 r,bytes32 s) = splitSignature(SIGNATURE);
        MerkleAirDrop(airdrop).claim(CLAIMING_ADDRESS, CLAIMING_AMOUNT, proof,v,r,s);
        vm.stopBroadcast();
    }

    function splitSignature(bytes memory signature) public pure returns (uint8 v, bytes32 r,bytes32 s){
        if(signature.length != 65){
            revert __ClaimAirdropScript__InvalidSignature();
        }
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
    }

    function run() external {
        address mostRecentDeployContract = DevOpsTools.get_most_recent_deployment("MerkleAirdrop",block.chainid);
        claimAirdrop(mostRecentDeployContract);
    }

}

