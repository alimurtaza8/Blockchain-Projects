// SPDX-License-Identifier: MIT

// This handler contract will responsible to prevent the waste of function call in variant test
// like calling the deposite function and in deposite function if there is no approve like that approve(msg.sender)
// so The handler will prevent this issue by overcome it

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {DSCEngine} from "../../src/DSCEngine.sol";
import {DecentralizedStableCoin} from "../../src/DecentralizedStableCoin.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {MockV3Aggregator} from "../../test/mocks/MockV3Aggregator.sol";


contract Handler is Test {
    DSCEngine dscEngine;
    DecentralizedStableCoin dsc;
    MockV3Aggregator ethUsdPriceFeed;

    ERC20Mock weth;
    ERC20Mock wbtc;

    uint256 public timesMintCalled;
    address[] public senders;

    uint256 public constant MAX_DEPOSITE_AMOUNT = type(uint96).max;

    // give them both contract in the constructor so the constructor will know how to that handle these two contracts
    constructor(DSCEngine _dscEngine, DecentralizedStableCoin _dsc){
        dscEngine = _dscEngine;
        dsc = _dsc;
        address[] memory collateralTokens = dscEngine.getCollateralTokens();
        weth = ERC20Mock(collateralTokens[0]);
        wbtc = ERC20Mock(collateralTokens[1]);

        ethUsdPriceFeed = MockV3Aggregator(dscEngine.getCollateralTokenPriceFeed(address(weth)));
    }

    // Ok Now In Terms to redeem the collateral first we will make sure have the collateral will be deposit

    function depositeCollateral(uint256 collateralSeed, uint256 collateralAmount) public {
        ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
        collateralAmount = bound(collateralAmount,1,MAX_DEPOSITE_AMOUNT);

        // First min and approve the token than deposite
        vm.startPrank(msg.sender);
        collateral.mint(msg.sender, collateralAmount);
        collateral.approve(address(dscEngine),collateralAmount);

        dscEngine.depositeCollateral(address(collateral) ,collateralAmount);
        vm.stopPrank();
        senders.push(msg.sender);

    }

    function mintDsc(uint256 amount, uint256 collateralSeed ) public {
        if (senders.length == 0){
            return;
        }
        address sender = senders[collateralSeed % senders.length];
        
        // Before minting we have to ensure the the amount will less from totall collateral
        (uint256 totallDscMinted, uint256 collateralValueInUsd) = dscEngine.getAccountInformation(msg.sender);
        // Ok Now We have both values . Now calcualte the maxTotallDscMinted

        int256 maxTotallDscMinted = (int256(collateralValueInUsd) / 2) - int256(totallDscMinted);
        
        if (maxTotallDscMinted < 0){
            return;
        }
        amount = bound(amount,0 ,uint256(maxTotallDscMinted));

        if (amount == 0){
            return;
        }
        // If Everything is ok than proceed to mint

        vm.startPrank(sender);
        dscEngine.mintDsc(amount);
        vm.stopPrank();
        timesMintCalled++;
    }

    function redeemCollateral(uint256 collateralSeed, uint256 collateralAmount) public {
        ERC20Mock collateral = _getCollateralFromSeed(collateralSeed);
        uint256 maxCollateralRedeem = dscEngine.getCollateralBalanceOfUser(address(collateral), msg.sender);
        collateralAmount = bound(collateralAmount,0,maxCollateralRedeem);

        if (collateralAmount == 0){
            return;
        }
        dscEngine.redeemCollateral(address(collateral), collateralAmount);

    }

    function updateCollateralPrice(uint96 newPrice) public  {
        int256 newPriceInt = int256(uint256(newPrice));
        ethUsdPriceFeed.updateAnswer(newPriceInt);
    }

    // Helper Functions

    function _getCollateralFromSeed(uint256 collateral) private view returns (ERC20Mock){

        if (collateral % 2 == 0){
            return weth;
        }
        return wbtc;
    }
}