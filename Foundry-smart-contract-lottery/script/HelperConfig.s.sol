// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {LinkToken} from "../test/mocks/LinkToken.sol";

abstract contract CodeConstants {
    uint256 public constant ETH_SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    uint96 public constant MOCK_BASE_FEE = 0.25 ether;
    uint96 public constant MOCK_GAS_PRICE_LINK = 1e9;
    int256 public constant MOCK_WEI_PER_UNIT_LINK = 4e15;
    uint256 public constant FUND_AMOUNT = 10 ether;
}

contract HelperConfig is CodeConstants, Script {

    error HelperConfig__INVALID_CHAIN_ID();

    struct NetworkConfig {
        uint256 enteranceFee;
        uint256 interval;
        address vrfCoordinator;
        bytes32 gasLane;
        uint256 subsriptionId;
        uint32 callbackGasLimit;
        address link;
        address accounts;
    }

    NetworkConfig public LocalNetWorkConfig;
    mapping (uint256 chainID => NetworkConfig) public networkConfigs;

    constructor(){
        networkConfigs[ETH_SEPOLIA_CHAIN_ID] = getSepoliaEthConfig();

    }

    function getConfigByChainID(uint256 chainID) public returns (NetworkConfig memory){
        if (networkConfigs[chainID].vrfCoordinator != address(0)){
            return networkConfigs[chainID];
        }
        else if (chainID == LOCAL_CHAIN_ID){
            return getOrCreateAnvilEthConfig();
        }
        else {
            revert HelperConfig__INVALID_CHAIN_ID();
        }
    }

    function getConfig() public returns (NetworkConfig memory){
        return getConfigByChainID(block.chainid);
    }

      function setConfig(uint256 chainId, NetworkConfig memory networkConfig) public {
        networkConfigs[chainId] = networkConfig;
    }

    function getSepoliaEthConfig() public pure returns (NetworkConfig memory){
        return NetworkConfig({
            enteranceFee: 0.01 ether,
            interval: 30,
            vrfCoordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625,
            gasLane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c,
            subsriptionId: 0,
            callbackGasLimit: 500000,
            link: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            accounts: 0x5E64eC4d4BcE73195BC6F180c2b20c4160f83D53
            // deployerKey: vm.envUint("PRIVATE_KEY")
        });
    }

    function getOrCreateAnvilEthConfig() public returns (NetworkConfig memory){
        if (LocalNetWorkConfig.vrfCoordinator != address(0)){
            return LocalNetWorkConfig;
        }
        vm.startBroadcast();
        VRFCoordinatorV2_5Mock vrfCoordinatorMock = new VRFCoordinatorV2_5Mock(
            MOCK_BASE_FEE,
            MOCK_GAS_PRICE_LINK,
            MOCK_WEI_PER_UNIT_LINK
        );
        LinkToken linkToken = new LinkToken();
        vm.stopBroadcast();

        LocalNetWorkConfig = NetworkConfig({
            enteranceFee: 0.01 ether,
            interval: 30,
            vrfCoordinator: address(vrfCoordinatorMock),
            gasLane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c,
            subsriptionId: 0,
            callbackGasLimit: 500000,
            link: address(linkToken),
            accounts: 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38
        });

        return LocalNetWorkConfig;
    }

}