// SPDX-License-Identifier: MIT

// // Invariant are the properties which actually over system will hold like variable alwaysLow = 0

// //Ok Great Now Think what are the variants in our code system?

// // 1 The totall supply (which is actually the dept amount) which should be less than the value of collateral
// // 2 Our getter functions which should be not revert 


// pragma solidity ^0.8.19;

// import {Test} from "forge-std/Test.sol";
// import {StdInvariant} from "forge-std/StdInvariant.sol";
// // import {DCSEngine} from "../../src/DSCEngine.sol";
// import {DSCEngine} from "../../src/DSCEngine.sol";
// import {DecentralizedStableCoin} from "../../src/DecentralizedStableCoin.sol";
// import {DeployDSC} from "../../script/DeployDSC.s.sol";
// import {HelperConfig} from "../../script/HelperConfig.s.sol";
// import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// contract OpenInvariantsTest is StdInvariant, Test{

//     DeployDSC deployer;
//     DSCEngine dscEngine;
//     DecentralizedStableCoin dsc;
//     HelperConfig helperConfig;
//     address weth;
//     address wbtc;

//     function setUp() external {
//         deployer = new DeployDSC();
//         (dsc, dscEngine, helperConfig) = deployer.run();
//         (,,weth,wbtc,)= helperConfig.activeNetworkConfig();
        
//     }

//     function invariant_protocolMustHaveMoreValueThanSupply() public {
//         // Now here we actually compare the totall supply with all our dept (like dsc coins)

//         // First get the totall supply
//         uint256 totallSupply = dsc.totalSupply();

//         // Get the token deposited value

//         uint256 totallWethDeposited = IERC20(weth).balanceOf(address(dscEngine));
//         uint256 totallWbtcDeposited = IERC20(wbtc).balanceOf(address(dscEngine));

//         // Now Get this token value in usd

//         uint256 EthTokenValueInUsd = dscEngine.getValueInUsd(weth, totallWethDeposited);
//         uint256 BtcTokenValueInUsd = dscEngine.getValueInUsd(wbtc,totallWbtcDeposited);

//         // Now Check the totall supply with all collateral

//         assert(EthTokenValueInUsd + BtcTokenValueInUsd >= totallSupply);
//     }

// }