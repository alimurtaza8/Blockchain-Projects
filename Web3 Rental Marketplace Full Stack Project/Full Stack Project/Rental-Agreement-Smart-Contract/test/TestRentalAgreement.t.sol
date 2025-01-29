// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {RentalAgreement} from "../src/RentalAgreement.sol";
import {DeployRentalAgreement} from "../script/DeployRentalAgreement.s.sol";
import {MockERC721} from "../test/Mocks/MockERC721.sol";

contract TestRentalAgreement is Test {
    RentalAgreement rentalAgreement;
    MockERC721 mockNFT;
    
    address public OWNER = makeAddr("owner");
    address public RENTER = makeAddr("renter");
    address public USER = makeAddr("user1");
    address public NEW_NFT_ADDRESS = makeAddr("NFT");
    
    uint256 public constant INITIAL_BALANCE = 100 ether;
    uint256 public constant RENT_AMOUNT = 1 ether;
    uint256 public constant SECURITY_DEPOSIT = 2 ether;
    uint256 public constant RENTAL_DURATION = 7;
    uint256 public constant TOKEN_ID = 1;
    

    event RentalCreated(address indexed renter, uint256 tokenId, uint256 renterAmount, uint256 deposite, uint256 rentalStart, uint256 duration);
    event ReleaseDeposite(address indexed renter, uint256 tokenId, uint256 amount);
    event OwnerWithdraw(address indexed owner, uint256 amount);

    function setUp() external {
        // Deploy contracts
        vm.startPrank(OWNER);
        mockNFT = new MockERC721();
        rentalAgreement = new RentalAgreement();
        
        // Setup NFT
        mockNFT.mint(OWNER, TOKEN_ID);
        rentalAgreement.setNFTAddress(address(mockNFT));
        
        // List equipment
        rentalAgreement.listEquipments(TOKEN_ID, RENT_AMOUNT, SECURITY_DEPOSIT);
        
        // Approve rental contract
        mockNFT.setApprovalForAll(address(rentalAgreement), true);
        vm.stopPrank();

        // Fund renter and user
        vm.deal(RENTER, INITIAL_BALANCE);
        vm.deal(USER, INITIAL_BALANCE);
    }

        /// @notice Test ownership of the contract
    function testIsOwner() public view {
        address contractOwner = rentalAgreement.getOwner();
        console.log("Owner of the contract:", contractOwner);
        assertEq(contractOwner, OWNER , "Contract owner should match the deployer");
    }

    /// @notice Test updating the NFT address by the owner
    function testSetNFTAddress() public {
        vm.prank(OWNER); // Simulate OWNER calling the function
        rentalAgreement.setNFTAddress(NEW_NFT_ADDRESS);

        address currentNFTAddress = rentalAgreement.getNFTAddress();
        assertEq(currentNFTAddress, NEW_NFT_ADDRESS);
    }

    /// @notice Test that only the owner can update the NFT address
    function testSetNFTAddressByNonOwner() public {
        vm.prank(USER); // Simulate a non-owner calling the function
        // vm.expectRevert();
        vm.expectRevert("You are not Owner");

        rentalAgreement.setNFTAddress(NEW_NFT_ADDRESS);
    }

    /// @notice Test listing equipment
    function testListEquipment() public {
        uint256 tokenId = 1;
        uint256 rentAmount = 1 ether;
        uint256 deposit = 0.5 ether;

        vm.prank(OWNER);
        rentalAgreement.listEquipments(tokenId, rentAmount, deposit);

        // Verify equipment details
        (uint256 rentalPrice, uint256 securityDeposit, bool isListed,bool isActive) = rentalAgreement.getEquipmentDetails(tokenId);
        assertEq(rentalPrice, rentAmount, "Rental price mismatch");
        assertEq(securityDeposit, deposit, "Deposit amount mismatch");
        assertEq(isListed, true, "Equipment should be listed");
    }

    
    /// @notice Test event emission for updating NFT address
    function testSetNFTAddressEmitsEvent() public {
        vm.prank(OWNER);
        // vm.expectEmit(true, true, false, true);
        emit RentalAgreement.NFTAddressUpdated(address(0), NEW_NFT_ADDRESS);
        rentalAgreement.setNFTAddress(NEW_NFT_ADDRESS);
    }


    function testStartRentAgreement() public {
        uint256 totalAmount = (RENT_AMOUNT * RENTAL_DURATION) + SECURITY_DEPOSIT;
        
        vm.startPrank(RENTER);
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

        // Verify rental agreement details
        (
            address renter,
            ,  // startTime (unused)
            uint256 duration,
            uint256 deposit,
            bool isActive,
            
        ) = rentalAgreement.getRentalDetails(TOKEN_ID);

        assertEq(renter, RENTER, "Incorrect renter address");
        assertEq(duration, RENTAL_DURATION, "Incorrect rental duration");
        assertEq(deposit, SECURITY_DEPOSIT, "Incorrect security deposit");
        assertTrue(isActive, "Rental should be active");
        assertEq(mockNFT.ownerOf(TOKEN_ID), RENTER, "NFT not transferred to renter");
        vm.stopPrank();
    }

    function testEndRentAgreement() public {
        // First start a rental agreement
        uint256 totalAmount = (RENT_AMOUNT * RENTAL_DURATION) + SECURITY_DEPOSIT;
        vm.prank(RENTER);
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

        // Fast forward to end of rental period
        vm.warp(block.timestamp + RENTAL_DURATION);

        // Record balances before ending rental
        uint256 renterBalanceBefore = RENTER.balance;

        // End rental agreement
        vm.startPrank(OWNER);
        rentalAgreement.endRentAgreement(TOKEN_ID);
        vm.stopPrank();

        // Verify end state
        (,,,,bool isActive,) = rentalAgreement.getRentalDetails(TOKEN_ID);
        assertFalse(isActive, "Rental should be inactive");
        assertEq(mockNFT.ownerOf(TOKEN_ID), msg.sender, "NFT not returned to owner");
        assertEq(
            RENTER.balance - renterBalanceBefore,
            SECURITY_DEPOSIT,
            "Security deposit not returned"
        );
    }

    function testOwnerWithdraw() public {
        // Start rental agreement
        uint256 totalAmount = (RENT_AMOUNT * RENTAL_DURATION) + SECURITY_DEPOSIT;
        vm.prank(RENTER);
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

        uint256 expectedRentAmount = RENT_AMOUNT * RENTAL_DURATION;
        uint256 ownerBalanceBefore = OWNER.balance;

        // Owner withdraws rent amount
        vm.prank(OWNER);
        rentalAgreement.withdraw();

        assertEq(
            OWNER.balance - ownerBalanceBefore,
            expectedRentAmount,
            "Incorrect withdrawal amount"
        );
    }

    // function testChainlinkAutomation() public {
    //     // Start rental agreement
    //     uint256 rentTotal = RENT_AMOUNT * RENTAL_DURATION;
    //     uint256 totalAmount = rentTotal + SECURITY_DEPOSIT;
        
    //     vm.prank(RENTER);
    //     rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

    //     // Fast forward past rental duration
    //     vm.warp(block.timestamp + RENTAL_DURATION + 1);

    //     // Check if upkeep is needed
    //     (bool upkeepNeeded, bytes memory performData) = rentalAgreement.checkUpkeep("");
    //     assertTrue(upkeepNeeded, "Upkeep should be needed");

    //     // Get initial balances
    //     uint256 renterBalanceBefore = RENTER.balance;

    //     // Perform upkeep as the owner
    //     vm.prank(OWNER);
    //     rentalAgreement.performUpkeep(performData);

    //     // Verify rental ended
    //     (,,,,bool isActive,) = rentalAgreement.getRentalDetails(TOKEN_ID);
    //     assertFalse(isActive, "Rental should be inactive after automation");
    //     assertEq(mockNFT.ownerOf(TOKEN_ID), OWNER, "NFT not returned to owner");
        
    //     // Verify security deposit returned
    //     assertEq(
    //         RENTER.balance - renterBalanceBefore,
    //         SECURITY_DEPOSIT,
    //         "Security deposit not returned correctly"
    //     );
    // }

    function testFailInsufficientPayment() public {
        uint256 insufficientAmount = SECURITY_DEPOSIT; // Only sending security deposit
        
        vm.prank(RENTER);
        vm.expectRevert("Error");
        rentalAgreement.startRentAgreement{value: insufficientAmount}(TOKEN_ID, RENTAL_DURATION);
    }

    function testFailUnauthorizedEndRental() public {
        // Start rental agreement
        uint256 totalAmount = (RENT_AMOUNT * RENTAL_DURATION) + SECURITY_DEPOSIT;
        vm.prank(RENTER);
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

        // Attempt to end rental with unauthorized user
        vm.prank(USER);
        vm.expectRevert("Errr Man. Your are not Onwer");
        rentalAgreement.endRentAgreement(TOKEN_ID);
    }

    function testFailRentAlreadyRentedEquipment() public {
        // First rental
        uint256 totalAmount = (RENT_AMOUNT * RENTAL_DURATION) + SECURITY_DEPOSIT;
        vm.prank(RENTER);
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);

        // Attempt second rental while first is active
        vm.prank(USER);
        vm.expectRevert("Equipment is Rented");
        rentalAgreement.startRentAgreement{value: totalAmount}(TOKEN_ID, RENTAL_DURATION);
    }
}