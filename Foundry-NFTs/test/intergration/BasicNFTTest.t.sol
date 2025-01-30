// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {BasicNFT} from "../../src/BasicNFT.sol";
import {DeployBasicNFT} from "../../script/DeployBasicNFT.s.sol";

contract BasicNFTTest is Test {
    DeployBasicNFT public deployer;
    BasicNFT public basicNft; 
    address  public constant USER = address(1);
    string public constant PUG =  "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    function setUp() public {
        deployer = new DeployBasicNFT();
        basicNft = deployer.run();
    }

    function testNFTNameIsCorrect() public pure {
        string memory expectedName = "Dogee";
        string memory actualName = "Dogee";

        assert(keccak256(abi.encodePacked(expectedName)) == keccak256(abi.encodePacked(actualName)));
    }

    function testMintNftAndHaveBalance() public  {
        vm.prank(USER);
        basicNft.mintNFT(PUG);

        assert(basicNft.balanceOf(USER) == 1);
        assert(keccak256(abi.encodePacked(PUG)) == keccak256(abi.encodePacked(basicNft.tokenURI(0))));
    }
}
