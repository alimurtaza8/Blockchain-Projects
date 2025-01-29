// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EquipmentNFT.sol";
import "./RentalAgreement.sol";

contract RentalFactory {
    mapping(address => address) public sellerToNFTContract;
    mapping(address => address) public sellerToRentalContract;

    function createContracts() external {
        // Deploy fresh contracts for caller
        EquipmentNFT nft = new EquipmentNFT(msg.sender); // Seller becomes owner
        RentalAgreement rental = new RentalAgreement(address(nft), msg.sender);
        
        // Link them together
        nft.setRentalContract(address(rental));
        
        // Store mappings
        sellerToNFTContract[msg.sender] = address(nft);
        sellerToRentalContract[msg.sender] = address(rental);
    }
}