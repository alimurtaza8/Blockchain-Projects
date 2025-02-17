// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {DeployDSC} from "../../script/DeployDSC.s.sol";
import {DecentralizedStableCoin} from "../../src/DecentralizedStableCoin.sol";
import {DSCEngine} from "../../src/DSCEngine.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract DSCEngineTest is Test {

    DeployDSC deployer;
    DecentralizedStableCoin dsc;
    DSCEngine dscEngine;
    HelperConfig config;

    address wethUsdPriceFeed;
    address wbtcUsdPriceFeed;
    address weth;
    address public USER = makeAddr("user");
    uint256 public constant AMOUNT_COLLATERAL = 10 ether;
    uint256 public constant STARTING_BALANCE = 10 ether;
    uint256 private constant LIQUADIATION_THRESHOLD = 50;

    uint256 private constant MIN_HEATH_FACTOR = 1e18;

    // uint256 private constant MIN_HEATH_FACTOR = 1;

    address[] public tokenAddresses;
    address[] public priceFeedAddresses;

    function setUp() public {
        deployer = new DeployDSC();
        (dsc,dscEngine,config) = deployer.run();

        // now get some values from the helperconfig so we actually test
        (wethUsdPriceFeed,wbtcUsdPriceFeed,weth,,) = config.activeNetworkConfig();
        ERC20Mock(weth).mint(USER, STARTING_BALANCE);

    }

    // Test constructor 
    
    function testRevertIfTokenAddressesDoesnotMatchPriceFeedAddresses() public {
        tokenAddresses.push(weth);
        priceFeedAddresses.push(wethUsdPriceFeed);
        priceFeedAddresses.push(wbtcUsdPriceFeed);

        vm.expectRevert(DSCEngine.DCSEngine__LengthOfTokenAddressAndPriceFeedAddressMustBeSame.selector);
        new DSCEngine(tokenAddresses, priceFeedAddresses,address(dsc));
    }

    function testgetValueInUsd() public view {
        uint256 ethAmount = 15e18;
        // 15e18 * 2000/eth = 30_000e18;
        uint256 expectedUSD = 30000e18;
        uint256 actualUsd = dscEngine.getValueInUsd(weth,ethAmount);

        assertEq(expectedUSD, actualUsd);
    }

    function testGetTokenAmountFromUsd() public view {
        // This test is a reverse of testgetValueInUsd Because here we check the usd value in terms of wei.
        uint256 usdAmount = 100 ether;
        // Math Here : lets say we have 200 /Eth, 100dollar divide this to get the wei value. 
        // 200/100 = 0.5 wei
        uint256 expectedWei = 0.05 ether;
        uint256 actualWei = dscEngine.getTokenAmountFromUsd(weth,usdAmount);
        assertEq(expectedWei, actualWei);

    }

    function testRevertIfCollateralIszero() public {
        vm.prank(USER);

        ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);

        vm.expectRevert(DSCEngine.DSCEngine__AmountShouldBeGreaterThanzero.selector);
        dscEngine.depositeCollateral(weth,0);
        vm.stopPrank();
    }

    function testRevertWithUnApprovedCollateral() public {
        ERC20Mock randomToken = new ERC20Mock();
        vm.prank(USER);

        vm.expectRevert(DSCEngine.DCSEngine__TokenNotAllowed.selector);
        dscEngine.depositeCollateral(address(randomToken), AMOUNT_COLLATERAL);
        vm.stopPrank();
    }

    modifier depositeCollateral() {
        vm.startPrank(USER);
        ERC20Mock(weth).approve(address(dscEngine),AMOUNT_COLLATERAL);
        dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL);
        vm.stopPrank();
        _;
    }

    function testCanDepositeCollateralAndGetAccountInfo() public depositeCollateral{
        (uint256 totallDscMinted, uint256 collateralValueInUsd) = dscEngine.getAccountInformation(USER);

        uint256 expectedTotallDscMinted = 0;
        uint256 expectedDepositeAmount = dscEngine.getTokenAmountFromUsd(weth,collateralValueInUsd);
        assertEq(expectedTotallDscMinted, totallDscMinted);
        assertEq(expectedDepositeAmount,AMOUNT_COLLATERAL);
    }

    
    // Test Minting DSC

    function testRevertsIfMintDscBreaksHealthFactor() public depositeCollateral {
        (, uint256 collateralValueInUsd) = dscEngine.getAccountInformation(USER);
        uint256 maxDscToMint = collateralValueInUsd / 2; // Assuming 200% collateralization
        vm.prank(USER);
        dscEngine.mintDsc(maxDscToMint); // Should work

        vm.prank(USER);
        // vm.expectRevert(abi.encodeWithSelector(DSCEngine.DCSEngine__BreaksHealthFactor.selector, 0.5 ether));
        // vm.expectRevert(DSCEngine.DCSEngine__BreaksHealthFactor.selector, 0.1 ether);
        vm.expectRevert(DSCEngine.DCSEngine__BreaksHealthFactor.selector);
        dscEngine.mintDsc(1); // Exceeding collateral
    }

    function testCanMintDsc() public depositeCollateral {
        uint256 mintAmount = 100 ether;
        vm.prank(USER);
        dscEngine.mintDsc(mintAmount);
        assertEq(dsc.balanceOf(USER), mintAmount);
    }

    // Test Burning DSC

    // function testBurnDSC() public depositeCollateral {
    // vm.prank(USER);
    // // ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
    // dscEngine.mintDsc(100 ether);
    // uint256 burnAmount = 30 ether;
    // vm.prank(USER);
    // dsc.approve(address(dscEngine), burnAmount);
    // dscEngine.burnDsc(burnAmount);
    // assertEq(dsc.balanceOf(USER), 30 ether);
    // }

// function testBurnDscRevertsIfTransferFails() public depositeCollateral {
//     vm.prank(USER);
//     dscEngine.mintDsc(100 ether);
//     vm.prank(USER);
//     dsc.approve(address(dscEngine), 50 ether);
//     // Mock transfer failure
//     vm.mockCall(address(dsc), abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(false));
//     vm.expectRevert(DSCEngine.DCSEngine__TransferFailed.selector);
//     dscEngine.burnDsc(50 ether);
// }

    // Test Liquidation

//     function testLiquidateImprovesHealthFactor() public {
//     // Setup undercollateralized user
//     address liquidator = makeAddr("liquidator");
//     vm.prank(liquidator);
//     ERC20Mock(weth).mint(liquidator, STARTING_BALANCE);
//     vm.prank(USER);
//     ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
//     dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL);
//     vm.prank(USER);
//     dscEngine.mintDsc(5000 ether); // Assume this makes HF < 1

//     // Liquidate
//     uint256 deptToCover = 100 ether;
//     vm.prank(liquidator);
//     dscEngine.liquidate(weth, USER, deptToCover);
//     // Check HF improved
//     assertGt(dscEngine.getHealthFactor(USER), MIN_HEATH_FACTOR);
// }

function testLiquidateRevertsIfHealthFactorOk() public depositeCollateral {
    vm.prank(USER);
    dscEngine.mintDsc(1 ether); // Safe amount
    vm.expectRevert(DSCEngine.DCSEngine__HealthFactorOK.selector);
    dscEngine.liquidate(weth, USER, 1 ether);
}

    // Test Redeeming Collateral

    function testRedeemCollateralRevertsIfHealthFactorBreaks() public depositeCollateral {
    vm.prank(USER);
    dscEngine.mintDsc(5000 ether); // Assume HF becomes 1 after
    vm.prank(USER);
    vm.expectRevert(abi.encodeWithSelector(DSCEngine.DCSEngine__BreaksHealthFactor.selector));
    dscEngine.redeemCollateral(weth, AMOUNT_COLLATERAL); // Redeem all, HF <1
}

    // Test Health Factor Calculation
    // function testHealthFactorCalculation() public depositeCollateral {
    // vm.prank(USER);
    // dscEngine.mintDsc(30000 ether); // collateralValueInUsd = 30,000 (AMOUNT_COLLATERAL=10e18, price=2000)
    // (uint256 dscMinted, uint256 collateralValue) = dscEngine.getAccountInformation(USER);
    // uint256 expectedHealthFactor = (collateralValue * LIQUADIATION_THRESHOLD * 1e18) / (dscMinted * 100);
    // assertEq(dscEngine.getHealthFactor(USER), expectedHealthFactor);
    // }

    // Test Deposit & Mint in One Tx

    function testDepositAndMintInOneTx() public {
    vm.startPrank(USER);
    ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
    dscEngine.depositeCollateralAndMintDsc(weth, AMOUNT_COLLATERAL, 100 ether);
    assertEq(dsc.balanceOf(USER), 100 ether);
    (uint256 minted, ) = dscEngine.getAccountInformation(USER);
    assertEq(minted, 100 ether);
}

    // Test Reentrancy Guards

    // Mock malicious contract    
    

function testReentrancyOnDeposit() public {
    ReentrancyAttacker attacker = new ReentrancyAttacker();
    ERC20Mock(weth).mint(address(attacker), 2 ether);
    vm.prank(address(attacker));
    ERC20Mock(weth).approve(address(dscEngine), 2 ether);
    vm.expectRevert(); // ReentrancyGuard reversion
    attacker.attack(dscEngine);
}

    // Test Event Emissions

    function testDepositEmitsEvent() public {
    vm.startPrank(USER);
    ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
    vm.expectEmit(true, true, true, true);
    emit DSCEngine.CollateralDeposite(USER, weth, AMOUNT_COLLATERAL);
    dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL);
}

    // Test Multiple Collateral Types

    function testMultipleCollateralDeposits() public {
    // Assuming WBTC is configured in setup
    ( , , , address wbtc, ) = config.activeNetworkConfig();
    ERC20Mock(wbtc).mint(USER, STARTING_BALANCE);
    
    vm.startPrank(USER);
    ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
    ERC20Mock(wbtc).approve(address(dscEngine), AMOUNT_COLLATERAL);
    dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL);
    dscEngine.depositeCollateral(wbtc, AMOUNT_COLLATERAL);
    
    (, uint256 collateralValue) = dscEngine.getAccountInformation(USER);
    assertGt(collateralValue, 3000 ether); // WETH + WBTC value
}

    //  Test Liquidation Bonus

//    function testLiquidationBonus() public {
//     // Setup USER with HF <1
//     vm.startPrank(USER);
//     ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL); // Approve the engine to spend USER's tokens
//     dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL); // Deposit collateral

//     // Mint a large amount of DSC to make the health factor drop below 1
//     uint256 largeDscToMint = 30000 ether; // Adjust this value to force HF < 1
//     dscEngine.mintDsc(largeDscToMint);
//     vm.stopPrank();

//     // Verify health factor is below 1e18
//     (uint256 totalDscMinted, uint256 collateralValueInUsd) = dscEngine.getAccountInformation(USER);
//     uint256 healthFactor = (collateralValueInUsd * dscEngine.getLiquadiationThreshold() * 1e18) / (totalDscMinted * 100);
//     assertLt(healthFactor, 1e18, "Health factor should be below 1");

//     // Setup liquidator
//     address liquidator = makeAddr("liquidator");
//     ERC20Mock(weth).mint(liquidator, STARTING_BALANCE); // Give liquidator some WETH
//     uint256 debtToCover = 100 ether;
//     uint256 expectedCollateral = dscEngine.getTokenAmountFromUsd(weth, debtToCover) * 110 / 100; // Calculate expected collateral with bonus

//     // Liquidate
//     vm.prank(liquidator);
//     dscEngine.liquidate(weth, USER, debtToCover);

//     // Assert liquidator received the correct amount of collateral
//     assertEq(ERC20Mock(weth).balanceOf(liquidator), expectedCollateral, "Liquidator did not receive the correct amount of collateral");
// }

    // Test Transfer Failures
    function testDepositRevertsOnTransferFailure() public {
    vm.prank(USER);
    ERC20Mock(weth).approve(address(dscEngine), AMOUNT_COLLATERAL);
    // Force transferFrom to fail
    vm.mockCall(weth, abi.encodeWithSelector(IERC20.transferFrom.selector), abi.encode(false));
    vm.expectRevert(DSCEngine.DCSEngine__TransferFailed.selector);
    dscEngine.depositeCollateral(weth, AMOUNT_COLLATERAL);
}

}

// mock
contract ReentrancyAttacker {
    function attack(DSCEngine engine) external {
        engine.depositeCollateral(address(this), 1 ether);
    }
    function onERC20Received(address, address, uint256, bytes memory) public returns (bytes4) {
        DSCEngine(msg.sender).depositeCollateral(address(this), 1 ether); // Reentrant call
        return this.onERC20Received.selector;
    }
} 



