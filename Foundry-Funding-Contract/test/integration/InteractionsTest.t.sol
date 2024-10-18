// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test,console} from "forge-std/Test.sol";
import {FundingContract} from "../../src/FundingContract.sol";
import {DeployFundingContract} from "../../script/DeployFundingContract.s.sol";
import {FundFundingContract,WithdrawFundingContract} from "../../script/Interactions.s.sol";

contract InteractionsTest is Test {

    FundingContract fundingContract;
    address public USER = makeAddr("user");
    uint256 constant SEND_VALUE = 0.1 ether;
    uint256 constant START_BALANCE = 10 ether;

    function setUp() external {
        DeployFundingContract deployFundindContract = new DeployFundingContract();
        fundingContract = deployFundindContract.run();
        vm.deal(USER, START_BALANCE);
    }

    function testUserCanFundInteractions() public {
        FundFundingContract fundFundingContract = new FundFundingContract();
        fundFundingContract.fundFundingContract(address(fundingContract));

        WithdrawFundingContract withdrawFundingContract = new WithdrawFundingContract();
        withdrawFundingContract.withdrawFundingContract(address(fundingContract));

        assert(address(fundingContract).balance == 0);
    } 
}