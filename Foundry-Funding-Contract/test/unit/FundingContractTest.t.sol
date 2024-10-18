// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test,console} from "forge-std/Test.sol";
import {FundingContract} from "../../src/FundingContract.sol";
import {DeployFundingContract} from "../../script/DeployFundingContract.s.sol";

contract FundingContractTest is Test {

    FundingContract fundingContract;
    address public USER = makeAddr("user");
    uint256 public SEND_VALUE = 10 ether;
    
    function setUp() external {
        DeployFundingContract deployFundindContract = new DeployFundingContract();
        fundingContract = deployFundindContract.run();
        vm.deal(USER, SEND_VALUE);
    }

    function testMINIMUM_USDIsFive() public view{
        assertEq(fundingContract.MINIMUM_USD(),5e18);
    }

    function testIsOwner() public view {
        // console.log("Is Owner: ",fundingContract.i_owner());
        // console.log("Is Owner: ?",address(this));
        // assertEq(fundingContract.i_owner(),address(this));
        assertEq(fundingContract.getOwner(),msg.sender);
    }

    function testGetVersionIsAccurate() public view {
        uint256 version = fundingContract.getVersion();
        assertEq(version,4);
    }

    function testFundFailedWithOutEnoughEth() public  {
        vm.expectRevert(); // This line should revert if we send less than 5 eth
        fundingContract.fund();
    }

    modifier funded(){
        vm.prank(USER);
        fundingContract.fund{value: SEND_VALUE}();
        _;
    }

    function testFundUpdatesFunderDataStructure() public funded {
        // vm.prank(USER);
        // fundingContract.fund{value: SEND_VALUE}();
        uint256 amountFunded = fundingContract.s_addressToAmountFunded(USER);
        assertEq(amountFunded,SEND_VALUE);
    }

    function testAddrFundersToArrayFunders() public funded {
        // vm.prank(USER);
        // fundingContract.fund{value: SEND_VALUE}();
        address funders = fundingContract.s_funders(0);
        assertEq(funders,USER);
    }

    function testOnlyOwnerCanWithdraw() public funded {
        // vm.prank(USER);
        // fundingContract.fund{value: SEND_VALUE}();

        vm.expectRevert();
        vm.prank(USER);
        fundingContract.withdraw();
    }

    function testWithDrawOnlyOwner() public {
    // Set the test contract's msg.sender to the owner
        hoax(fundingContract.getOwner());
    
    // Now the withdraw function will pass because msg.sender is the owner
        fundingContract.withdraw();
    }

    function testWithdrawWithSingleFunder() public funded {
        // Arrange
        uint256 startOnwerBalance = fundingContract.getOwner().balance;
        uint256 startContractBalance = address(fundingContract).balance;
        
        // Act
        vm.prank(fundingContract.getOwner());
        fundingContract.withdraw();
        
        // Assert
        uint256 endingOnwerBalance = fundingContract.getOwner().balance;
        uint256 endingBalanceOfContract = address(fundingContract).balance;
        assertEq(endingBalanceOfContract, 0);
        assertEq(startOnwerBalance + startContractBalance, endingOnwerBalance); // this line checks that all eth transfer to owner
    }

    function testWithdrawWithALLFunder() public funded {
        // Arrange
        uint160 numberOfFunders = 10;
        uint160 startFundIndex = 1;

        for(uint160 i = startFundIndex; i < numberOfFunders; i++){
            hoax(address(i), SEND_VALUE);
            fundingContract.fund{value: SEND_VALUE}();
        }

        uint256 startOnwerBalance = fundingContract.getOwner().balance;
        uint256 startContractBalance = address(fundingContract).balance;
        console.log("Balance of contract", startContractBalance);
        
        // Act
        vm.startPrank(fundingContract.getOwner());
        fundingContract.withdraw();
        vm.stopPrank();
        
        // Assert
        assert(address(fundingContract).balance == 0);
        assert(startContractBalance + startOnwerBalance == fundingContract.getOwner().balance);
    }

    function testCheaperWithdrawWithALLFunder() public funded {
        // Arrange
        uint160 numberOfFunders = 10;
        uint160 startFundIndex = 1;

        for(uint160 i = startFundIndex; i < numberOfFunders; i++){
            hoax(address(i), SEND_VALUE);
            fundingContract.fund{value: SEND_VALUE}();
        }

        uint256 startOnwerBalance = fundingContract.getOwner().balance;
        uint256 startContractBalance = address(fundingContract).balance;
        console.log("Balance of contract", startContractBalance);
        
        // Act
        vm.startPrank(fundingContract.getOwner());
        fundingContract.cheaperWithdraw();
        vm.stopPrank();
        
        // Assert
        assert(address(fundingContract).balance == 0);
        assert(startContractBalance + startOnwerBalance == fundingContract.getOwner().balance);
    }

}


// These tests are example of unit test because I am just specific code to test like owner and minimum usd 