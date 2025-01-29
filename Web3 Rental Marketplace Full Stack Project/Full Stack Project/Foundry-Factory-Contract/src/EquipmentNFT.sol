// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract EquipmentNFT is ERC721, Ownable {
    using Strings for uint256;

    struct Equipment {
        string name;
        string description;
        string imageUri;
        bool isListed;
        uint256 mintTime;
    }

    uint256 private s_tokenCounter;
    mapping(uint256 => Equipment) private s_equipments;
    address public rentalContractAddress;

    event EquipmentMinted(uint256 indexed tokenId, string name, address owner);
    event RentalContractSet(address indexed rentalContract);

    constructor(address initialOwner) ERC721("Equipment NFT", "EQPT") Ownable(initialOwner) {
        s_tokenCounter = 0;
    }

    // ========== FIXED EXISTENCE CHECK ========== //
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Use ERC721's built-in existence check via ownerOf()
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        Equipment memory equipment = s_equipments[tokenId];
        bytes memory json = abi.encodePacked(
            '{"name": "', equipment.name,
            '", "description": "', equipment.description,
            '", "image": "', equipment.imageUri,
            '", "attributes": [{"trait_type": "Listed", "value": "', 
            equipment.isListed ? 'true' : 'false',
            '"}, {"trait_type": "Mint Time", "value": "',
            Strings.toString(equipment.mintTime),
            '"}]}'
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(json)
            )
        );
    }

    // ========== UPDATED TRANSFER LOGIC ========== //
    function transferFrom(address from, address to, uint256 tokenId) public override {
        super.transferFrom(from, to, tokenId);
        _autoApproveRentalContract(to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        super.safeTransferFrom(from, to, tokenId);
        _autoApproveRentalContract(to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        super.safeTransferFrom(from, to, tokenId, data);
        _autoApproveRentalContract(to, tokenId);
    }

    // ========== INTERNAL HELPERS ========== //
    function _autoApproveRentalContract(address to, uint256 tokenId) private {
        if (rentalContractAddress != address(0)) {
            _approve(rentalContractAddress, tokenId, to);
        }
    }

    // ========== SAFE MINTING ========== //
    function mintEquipment(
        string memory name,
        string memory description,
        string memory imageUri
    ) public returns (uint256) {
        require(bytes(imageUri).length > 0, "Invalid empty URI");
        require(bytes(name).length > 0, "Name required");

        uint256 newTokenId = s_tokenCounter++;
        _safeMint(msg.sender, newTokenId);
        
        s_equipments[newTokenId] = Equipment({
            name: name,
            description: description,
            imageUri: imageUri,
            isListed: false,
            mintTime: block.timestamp
        });

        if (rentalContractAddress != address(0)) {
            _approve(rentalContractAddress, newTokenId, msg.sender);
        }

        emit EquipmentMinted(newTokenId, name, msg.sender);
        return newTokenId;
    }

    // ========== REMAINING FUNCTIONS ========== //
    function setRentalContract(address _rentalContract) external onlyOwner {
        require(_rentalContract != address(0), "Zero address");
        rentalContractAddress = _rentalContract;
        emit RentalContractSet(_rentalContract);
    }

    function getEquipment(uint256 tokenId) external view returns (Equipment memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return s_equipments[tokenId];
    }

    function getTotalSupply() external view returns (uint256) {
        return s_tokenCounter;
    }
}