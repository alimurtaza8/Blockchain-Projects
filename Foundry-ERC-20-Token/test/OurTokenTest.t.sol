// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Test} from "forge-std/Test.sol";
import {DeployOurToken} from "../script/DeployOurToken.s.sol";
import {OurToken} from "../src/OurToken.sol";

contract OurTokenTest is Test {
    OurToken public ourToken;
    DeployOurToken public deployer;

    address person1 = makeAddr("person1");
    address person2 = makeAddr("person2");
    address person3 = makeAddr("person3");


    uint256 public constant STARTING_BALANCE = 100 ether;

    function setUp() public {
        deployer = new DeployOurToken();
        ourToken = deployer.run();

        vm.prank(msg.sender);
        ourToken.transfer(person1, STARTING_BALANCE);
    }

    function testPerson1Balance() public view {
        assertEq(STARTING_BALANCE, ourToken.balanceOf(person1));
    }

    function testAllowncesWorks () public {
        uint256 initialBalance = 1000;

        // Person1 will approve person2 to spend token on there behalf
        vm.prank(person1);
        ourToken.approve(person2,initialBalance);

        uint256 transferAmount = 500;

        vm.prank(person2);
        ourToken.transferFrom(person1, person2, transferAmount);

        assertEq(ourToken.balanceOf(person2), transferAmount);
        assertEq(ourToken.balanceOf(person1), STARTING_BALANCE - 500 );
    }

    // Test: Check total supply after deployment
    function testTotalSupply() public view {
        uint256 totalSupply = ourToken.totalSupply();
        assertEq(totalSupply, STARTING_BALANCE + ourToken.balanceOf(msg.sender));
    }

    // Test: Approve and allowance behavior
    function testAllowanceBehavior() public {
        uint256 allowanceAmount = 25 ether;

        // Approve person2 to spend tokens on behalf of person1
        vm.prank(person1);
        ourToken.approve(person2, allowanceAmount);

        // Check allowance
        uint256 currentAllowance = ourToken.allowance(person1, person2);
        assertEq(currentAllowance, allowanceAmount);

        // Change allowance
        vm.prank(person1);
        ourToken.approve(person2, 10 ether);

        // Check updated allowance
        assertEq(ourToken.allowance(person1, person2), 10 ether);
    }
}