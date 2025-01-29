// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

// import {PriceConverter} from "./PriceConverter.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import {KeeperCompatibleInterface} from "@chainlink/contracts/v0.8/automation/interfaces/KeeperCompatibleInterface.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract RentalAgreement is  ReentrancyGuard {

    error NOT_OWNER();
    error EquipmentIsRented();
    error NotRenter(); 
    error ContractPaused();
    error TokenNoTOwner();
    error Invalid_NFT_Address();
    error Not_Listed();
    error IncorrectAmount();
    // constants
    uint256 private constant TIME_UNIT = 1 days;
    uint256 private constant DISPUTE_PERIOD = 7 days;
    uint256 private constant MAX_KEEPER_BATCH  = 10;

    // Added the plateform fee configuration
    uint256 private platformFeeBps = 300 ; // 3%

    event EquipmentListed(uint256 tokenId, uint256 rentAmount, uint256 deposite);
    event RentalCreated(address indexed renter,uint256 tokenId, uint256 renterAmount, uint256 deposite, uint256 rentalStart, uint256 duration);
    event ReleaseDeposite(address indexed renter, uint256 tokenId, uint256 amount);
    event OwnerWithdraw(address indexed owner, uint256 amount);
    event NFTAddressUpdated(address indexed oldAddress, address indexed newAddress);
    // event InsuranceUpdated(uint256 tokenId, address provider, uint256 coverage);
    // event EmergencyPaused(bool paused);
    // event PlatformFeeUpdated(uint256 plateformUpdateFee);

    // Data Struct For Holding the Data of Equipmemnt and The status of equipemnt
    struct Equipment {
        address owner;
        uint256 rentalPrice;
        uint256 securityDepositePrice;
        bool isListed;
    }

    struct RentAgreement{
        address renter;
        uint256 startTime;
        uint256 depositeAmount;
        uint256 duration;
        bool isActive; 
        uint256 totallPaid;
        uint256 lastPaymentTime;
    }

    // for dispute
    struct Dispute{
        uint256 releaseTimeForDispute;
        uint256 depositeAmount;
        bool exits;
    }

    // state variables
    address private immutable i_owner;
    address private nft_address;
    // bool private paused;
    uint256[] private activeRentals;
    // uint256 private upkeepCursor;
    
    mapping(uint256 tokenId => Equipment) private equipmentDetails;
    mapping(uint256 tokenId => RentAgreement) private rentAgreementDetails;
    mapping(uint256 => Dispute) private depositDisputes;
    mapping (address => uint256) private ownerPendingWithdrawls;
    mapping(address => uint256) private pendingDeposits;
    

    constructor( address _nftAddress,address _owner){
        i_owner = _owner;
        nft_address = _nftAddress;
    }

    modifier onlyOwner(){
        if(msg.sender != i_owner){
            revert NOT_OWNER();
        }
        _;
    }

    modifier notRented(uint256 tokenId){
        if(rentAgreementDetails[tokenId].isActive){
            revert EquipmentIsRented();
        }
        _;
    }

    modifier onlyRenter(uint256 tokenId){
        if(rentAgreementDetails[tokenId].renter != msg.sender){
            revert NotRenter();
        }
        _;
    }

    // modifier whenNotPaused(){
    //     if(paused){
    //         revert ContractPaused();
    //     }
    //     _;
    // }

    function listEquipments(uint256 tokenId, uint256 rentAmount, uint256 securityDepositeAmount) external onlyOwner notRented(tokenId)  {
        // first check the Nft Belong to the owner whose try to list it
        IERC721 nft = IERC721(nft_address);
        // if(nft.ownerOf(tokenId) != i_owner){
        //     revert TokenNoTOwner();
        // }

        address actualOwner = nft.ownerOf(tokenId);
        equipmentDetails[tokenId].owner = actualOwner;
        
        // Check The Approval of the Token so it wil transfer to the renter
          require(
            nft.isApprovedForAll(i_owner, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Contract not approved"
        );

        // add equipment
        equipmentDetails[tokenId] = Equipment({
            owner: i_owner,
            rentalPrice: rentAmount,
            securityDepositePrice: securityDepositeAmount,
            isListed: true
        });

        // now emit the event to successfull logs on blockchain
        emit EquipmentListed(tokenId,rentAmount,securityDepositeAmount);
    }

    function setNFTAddress(address newNFTaddress) external onlyOwner{
        // require(newNFTaddress != address(0), "InValid NFT Address");
        if(newNFTaddress == address(0)){
            revert Invalid_NFT_Address();
        }
        emit NFTAddressUpdated(nft_address,newNFTaddress);
        nft_address = newNFTaddress;
    }

    // main function which holds the rentValue and store Security Deposite
    function startRentAgreement(uint256 tokenId, uint256 rentalDurationInDays) external payable nonReentrant notRented(tokenId)  {
        // convert days into secs
        uint256 duration = rentalDurationInDays * TIME_UNIT;
        
        Equipment memory item = equipmentDetails[tokenId];
        // first check the item is list or not
        // require(item.isListed, "Not Listed");
        if(!item.isListed){
            revert Not_Listed();
        }

        uint256 totallRentRequired = item.rentalPrice * rentalDurationInDays;
        uint256 fee = (totallRentRequired * platformFeeBps) / 10000;
        uint256 totallRequiredAmount = totallRentRequired + item.securityDepositePrice;
        // require (msg.value >= totallRequiredAmount, "Incorrect Amount");
        if(msg.value < totallRequiredAmount){
            revert IncorrectAmount();
        }

        IERC721 nft = IERC721(nft_address);
        require(nft.ownerOf(tokenId) == item.owner, "Invalid ownership");

        // update the rentalAgreement
        rentAgreementDetails[tokenId] = RentAgreement({
            renter: msg.sender,
            startTime: block.timestamp,
            depositeAmount: item.securityDepositePrice,
            duration: duration,
            isActive: true,
            totallPaid: totallRentRequired,
            lastPaymentTime: block.timestamp
        });

        // Now send the rental Amount to the owner with cut of the plateform fee
        ownerPendingWithdrawls[item.owner] += totallRentRequired - fee;
        // ownerPendingWithdrawls[treasury] += fee;

        // for track the tokens of nft
        activeRentals.push(tokenId);
        
        // now transfer the nft to renter 
        nft.safeTransferFrom(item.owner, msg.sender, tokenId);
        // emit the event so it logs are stored on the blockchain     
        emit RentalCreated(msg.sender, tokenId, totallRentRequired,item.securityDepositePrice, block.timestamp,duration);
    }

    // The Function Which End The Agreement After the condition will met
    function endRentAgreement(uint256 tokenId) public onlyOwner nonReentrant {
        RentAgreement storage agreement = rentAgreementDetails[tokenId];
        require(agreement.isActive, "Rental not active");

        // Get The Renter Address and Amount
        address renter = agreement.renter;
        // uint256 depositeAmount = agreement.depositeAmount;

        IERC721 nft = IERC721(nft_address);
        // require(nft.ownerOf(tokenId) == renter, "Error: Token not owned by renter");
        // This Check For Dispute That the renter transfer the NFT or not?
        if(nft.ownerOf(tokenId) == renter){
            nft.safeTransferFrom(renter, equipmentDetails[tokenId].owner,tokenId);
        }

        address equipmentOwner = equipmentDetails[tokenId].owner;
        if(nft.ownerOf(tokenId) == equipmentOwner){
            _releaseDeposit(tokenId);
        }
        else{
            depositDisputes[tokenId] = Dispute({
                releaseTimeForDispute: block.timestamp + DISPUTE_PERIOD,
                depositeAmount: agreement.depositeAmount,
                exits: true
            });
        }
        // Now Remove the token From Active Rental and Make the Status is False 
        _removeFromActiveRentals(tokenId);
        agreement.isActive = false;

        // // Now Return back The Deposite to Renter
        // (bool success,) = renter.call{value: depositeAmount}("");
        // require(success, "Deposite Not Transfered");

        // // Now Clear back The Rental Agreement
        // agreement.isActive = false;

        // emit ReleaseDeposite(renter, tokenId, depositeAmount);
    }

    // Function for Renter To Claim The Deposite
    // function claimDeposit(uint256 tokenId) external nonReentrant {
    //     Dispute storage dispute = depositDisputes[tokenId];
    //     // check if exits or not
    //     require(dispute.exits, "No Dispute");
    //     // if trying to get deposte earlier
    //     require(block.timestamp >= dispute.releaseTimeForDispute, "Too Early");
        
    //     pendingDeposits[msg.sender] += dispute.depositeAmount;
    //     delete depositDisputes[tokenId];
    // }

    function claimDeposit(uint256 tokenId) external nonReentrant {
    require(pendingDeposits[msg.sender] > 0, "No deposit");
    uint256 amount = pendingDeposits[msg.sender];
    pendingDeposits[msg.sender] = 0;
    (bool success,) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}

    // function withdraw so Owner can withdraw amount
    function withdraw() external onlyOwner nonReentrant(){
        uint256 amount = ownerPendingWithdrawls[msg.sender];
        require(amount > 0, "No Balance");

        ownerPendingWithdrawls[msg.sender] = 0;

        // transfer to owner
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Amount not transfer");

        emit OwnerWithdraw(msg.sender, amount);
    }

    function isApprovedForToken(address owner, uint256 tokenId) public view returns (bool) {
        IERC721 nft = IERC721(nft_address);
        return nft.isApprovedForAll(owner, address(this)) || nft.getApproved(tokenId) == address(this);
    }

    // chainlink Automation This Function will return the bool to check the time is pass or not
    //  function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
    //     uint256 count = 0;
    //     uint256[] memory expired = new uint256[](MAX_KEEPER_BATCH);
        
    //     uint256 end = upkeepCursor + MAX_KEEPER_BATCH;
    //     uint256 maxIndex = activeRentals.length > 0 ? activeRentals.length - 1 : 0;
    //     end = end > maxIndex ? maxIndex : end;

    //     for (uint256 i = upkeepCursor; i <= end; i++) {
    //         uint256 tokenId = activeRentals[i];
    //         RentAgreement memory agreement = rentAgreementDetails[tokenId];
            
    //         if(agreement.isActive && (block.timestamp > agreement.startTime + agreement.duration)) {
    //             expired[count] = tokenId;
    //             count++;
    //         }
    //     }

    //     upkeepNeeded = count > 0;
    //     performData = abi.encode(expired, count, upkeepCursor);
    // }

    // function performUpkeep(bytes calldata performData) external override {
    //     (uint256[] memory tokenIds, uint256 count, uint256 cursor) = 
    //         abi.decode(performData, (uint256[], uint256, uint256));
        
    //     for (uint256 i = 0; i < count; i++) {
    //         uint256 tokenId = tokenIds[i];
    //         if(rentAgreementDetails[tokenId].isActive) {
    //             endRentAgreement(tokenId);
    //         }
    //     }
        
    //     // Changed: Update cursor position
    //     upkeepCursor = cursor + count;
    //     if(upkeepCursor >= activeRentals.length) {
    //         upkeepCursor = 0;
    //     }
    // }

    // function emergencyPause(bool pause) external onlyOwner {
    //     paused = pause;
    //     emit EmergencyPaused(pause);
    // }

    // function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
    //     require(newFeeBps <= 1000, "Fee too high"); // Max 10%
    //     platformFeeBps = newFeeBps;
    //     emit PlatformFeeUpdated(newFeeBps);
    // }

       // Helper functions
    function _releaseDeposit(uint256 tokenId) private {
        RentAgreement memory agreement = rentAgreementDetails[tokenId];
        pendingDeposits[agreement.renter] += agreement.depositeAmount;
        emit ReleaseDeposite(agreement.renter, tokenId, agreement.depositeAmount);
    }

    function _removeFromActiveRentals(uint256 tokenId) private {
        for(uint256 i = 0; i < activeRentals.length; i++) {
            if(activeRentals[i] == tokenId) {
                // Add index boundary check
                if(i < activeRentals.length - 1) {
                    activeRentals[i] = activeRentals[activeRentals.length - 1];
                }
                activeRentals.pop();
                break;
            }
        }
    }

    // View Functions
    function getEquipmentDetails(uint256 tokenId) external view returns (uint256 rentalPrice, uint256 depositRequired, bool isListed, bool isRented) {
        Equipment memory item = equipmentDetails[tokenId];
        RentAgreement memory rental = rentAgreementDetails[tokenId];
        
        return (
            item.rentalPrice,
            item.securityDepositePrice,
            item.isListed,
            rental.isActive
        );
    }

    function getRentalDetails(uint256 tokenId) external view returns (address renter,uint256 startTime,uint256 duration,uint256 deposit,bool isActive,uint256 timeRemaining) {
        RentAgreement memory rental = rentAgreementDetails[tokenId];
        uint256 endTime = rental.startTime + rental.duration;
        uint256 remaining = block.timestamp >= endTime ? 0 : endTime - block.timestamp;
        
        return (
            rental.renter,
            rental.startTime,
            rental.duration,
            rental.depositeAmount,
            rental.isActive,
            remaining
        );
    }

    function getNFTCurrentOwner(uint256 tokenId) external view returns (address) {
        IERC721 nft = IERC721(nft_address);
        return nft.ownerOf(tokenId);
    }   

    function getOwner() external view returns (address){
        return i_owner;
    }
    
    function getDisputeDays() public pure returns (uint256){
        return DISPUTE_PERIOD;
    }

    function getNFTAddress() public view returns (address){
        return nft_address;
    }


    fallback() external payable {}
    receive() external payable {}

}

