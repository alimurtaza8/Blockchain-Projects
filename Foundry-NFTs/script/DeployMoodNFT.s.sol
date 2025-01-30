// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Script, console} from "forge-std/Script.sol";
import {MoodNFT} from "../src/MoodNFT.sol";

contract DeployMoodNFT is Script {

    function run() external returns (MoodNFT){
        string memory sadSvg = vm.readFile("./images/sad.svg");
        string memory happySvg = vm.readFile("./images/happy.svg");
        
        vm.startBroadcast();
        MoodNFT moodNft = new MoodNFT(svgToImageURI(sadSvg), svgToImageURI(happySvg));
        vm.stopBroadcast();
        return moodNft;
    }

    function svgToImageURI(string memory svg) public pure returns (string memory){

        string memory baseURL = "data:image/svg+xml;base64,";
        string memory svgToBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(baseURL,svgToBase64Encoded));
    }

}