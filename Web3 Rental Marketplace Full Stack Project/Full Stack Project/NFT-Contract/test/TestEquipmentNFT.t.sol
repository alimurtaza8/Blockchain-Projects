// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {EquipmentNFT} from "../src/EquipmentNFT.sol";
import {DeployEquipmentNFT} from "../script/DeployEquipmentNFT.s.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";


contract TestEquipmentNFT is Test {
    DeployEquipmentNFT public deployer;
    EquipmentNFT public equipmentNft;
    address public constant USER = address(1);

    string public constant TEST_NAME = "Test Equipment";
    string public constant TEST_DESCRIPTION = "This is a test equipment.";
    string public constant TEST_IMAGE_URI = "ipfs://test-uri";

    function setUp() public {
        deployer = new DeployEquipmentNFT();
        equipmentNft = deployer.run();
        vm.deal(USER, 1 ether); // Fund USER with 1 ether for gas
    }

    function testNFTNameIsCorrect() public view {
        string memory expectedName = "Equipment NFT";
        string memory actualName = equipmentNft.name();
        assertEq(expectedName, actualName, "NFT name is incorrect");
    }

    function testNFTSymbolIsCorrect() public view{
        string memory expectedSymbol = "EQPT";
        string memory actualSymbol = equipmentNft.symbol();
        assertEq(expectedSymbol, actualSymbol, "NFT symbol is incorrect");
    }

    function testOwnerCanMintNFT() public {
        vm.prank(USER); // USER is the msg.sender
        uint256 tokenId = equipmentNft.mintEquipment(TEST_NAME, TEST_DESCRIPTION, TEST_IMAGE_URI);

        assertEq(equipmentNft.balanceOf(USER), 1, "USER should own 1 NFT");
        assertEq(equipmentNft.ownerOf(tokenId), USER, "USER should be the owner of the minted NFT");

        EquipmentNFT.Equipment memory equipment = equipmentNft.getEquipment(tokenId);
        assertEq(equipment.name, TEST_NAME, "Equipment name mismatch");
        assertEq(equipment.description, TEST_DESCRIPTION, "Equipment description mismatch");
        assertEq(equipment.imageUri, TEST_IMAGE_URI, "Equipment image URI mismatch");
    }

    function testMintedNFTHasCorrectTokenURI() public {
        vm.prank(USER);
        uint256 tokenId = equipmentNft.mintEquipment(TEST_NAME, TEST_DESCRIPTION, TEST_IMAGE_URI);

        string memory expectedTokenURI = string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        '{"name": "', TEST_NAME,
                        '", "description": "', TEST_DESCRIPTION,
                        '", "image": "', TEST_IMAGE_URI,
                        '", "attributes": [{"trait_type": "Listed", "value": "false"}, {"trait_type": "Mint Time", "value": "',
                        Strings.toString(block.timestamp),
                        '"}]}'
                    )
                )
            )
        );

        assertEq(equipmentNft.tokenURI(tokenId), expectedTokenURI, "Token URI mismatch");
    }

    function testGetEquipmentRevertsForNonExistentToken() public {
        vm.expectRevert("Token does not exist");
        equipmentNft.getEquipment(9999);
    }

    function testSetRentalContract() public {
        vm.prank(msg.sender);
        address rentalContract = address(2);
        equipmentNft.setRentalContract(rentalContract);

        assertEq(equipmentNft.rentalContractAddress(), rentalContract);
    }

    function testSetRentalContractRevertsIfNotOwner() public {
        address rentalContract = address(2);
        vm.prank(USER);
        vm.expectRevert();
        equipmentNft.setRentalContract(rentalContract);
    }

    // function testTokenTransferApprovesRentalContract() public {
    //     vm.prank(msg.sender);
    //     uint256 tokenId = equipmentNft.mintEquipment(TEST_NAME, TEST_DESCRIPTION, TEST_IMAGE_URI);
    //     console.log("The contract token is : " , tokenId);

    //     vm.prank(msg.sender);
    //     address rentalContract = address(2);
    //     equipmentNft.setRentalContract(rentalContract);

    //     vm.prank(msg.sender);
    //     equipmentNft.setApprovalForAll(rentalContract,true);

    //     vm.prank(msg.sender);
    //     equipmentNft.transferFrom(msg.sender, address(3), tokenId);

    //     vm.prank(msg.sender);
    //     equipmentNft.safeTransferFrom(msg.sender, address(3),tokenId);

    //     assertEq(equipmentNft.getApproved(tokenId), rentalContract);
    // }
}
