// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {DeployMoodNFT} from "../../script/DeployMoodNFT.s.sol";

contract TestDeployMoodNFT is Test {

    DeployMoodNFT deployMoodNft;

    function setUp() public {
        deployMoodNft = new DeployMoodNFT();
    }

    function testConvertSvgToUri() public view {
        string memory expectedUri = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCI+PHRleHQgeD0iMCIgeT0iMTUiIGZpbGw9ImJsYWNrIj5IaSEgWW91ciBicm93c2VyIGRlY29kZWQgdGhpczwvdGV4dD48L3N2Zz4=";

        string memory svg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="500"><text x="0" y="15" fill="black">Hi! Your browser decoded this</text></svg>';

        string memory actualUri = deployMoodNft.svgToImageURI(svg);

        // now check the is it equall
        assert(keccak256(abi.encodePacked(expectedUri)) == keccak256(abi.encodePacked(actualUri)));

    }
}
