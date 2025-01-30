// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract MoodNFT is ERC721 {

    error MoodNFT__CantFlipMoodNotOwner();

    uint256 private s_tokenCounter;
    string private sadSvgImageURI;
    string private happySvgImageURI;

    enum  Mood {
        HAPPY,
        SAD
    }
    // map
    mapping(uint256 => Mood) private s_tokenIdToMood;
    
    constructor(string memory sadSvg, string memory happySvg) ERC721("Mood NFT", "MN"){
        s_tokenCounter = 0;
        sadSvgImageURI = sadSvg;
        happySvgImageURI = happySvg;
    }

    function mintNFT() public  {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenIdToMood[s_tokenCounter] = Mood.HAPPY;
        s_tokenCounter++;
    }

    function flipMood(uint256 tokenId) public {
        if(getApproved(tokenId) != msg.sender && ownerOf(tokenId) != msg.sender){
            revert MoodNFT__CantFlipMoodNotOwner();
        }
        if(s_tokenIdToMood[tokenId] == Mood.HAPPY){
            s_tokenIdToMood[tokenId] = Mood.SAD;
        }
        else{
            s_tokenIdToMood[tokenId] = Mood.HAPPY;
        }
    }

    function _baseURI() internal pure override returns (string memory){
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory){
        string memory imageURI;
        if(s_tokenIdToMood[tokenId] == Mood.HAPPY){
           imageURI = happySvgImageURI;
        }
        else {
            imageURI = sadSvgImageURI;
        }

        return
            string(
                abi.encodePacked(
                _baseURI(),
                     Base64.encode(bytes(abi.encodePacked( '{"name":"',
                            name(), // You can add whatever name here
                            '", "description":"An NFT that reflects the mood of the owner, 100% on Chain!", ',
                            '"attributes": [{"trait_type": "moodiness", "value": 100}], "image":"',
                            imageURI,
                            '"}')))));

        // return Base64(tokenMetaData);
    }

}