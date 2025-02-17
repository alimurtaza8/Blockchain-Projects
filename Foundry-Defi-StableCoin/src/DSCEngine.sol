// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {DecentralizedStableCoin} from "../src/DecentralizedStableCoin.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {OracleLib} from "./libraries/OracleLib.sol";

/**
 * @title DCSEngine
 * @author Ali Murtaza
 * 
 * This system is designed to be a minimal as possible and have the token maintain that 1 token == 1$ peg
 * This StableCoin has the properties:
 * - Exogenous Collateral
 * - Dollar Pegged
 * - Algoritmically Stable
 * 
 * It is similar to DAI If DAI Has no governance and was only backed by weth and wbtc.
 * 
 * Our DSC System should always be "overCollateral" At no point. Shoudld the value of all collateral <= the 
 * $ backed value for the DSC
 * 
 * @notice This contract is the core of the DSC Syste. It Handles all the logic of minting and reedeming DSC.
 * As well as depositing and withdrawing collateral
 * 
 * @notice This contract is lossely based on MakerDAO DSS (DAI) System
 */

contract DSCEngine is ReentrancyGuard {

    // Errors
    error DSCEngine__AmountShouldBeGreaterThanzero();
    error DCSEngine__LengthOfTokenAddressAndPriceFeedAddressMustBeSame();
    error DCSEngine__TokenNotAllowed();
    error DCSEngine__TransferFailed();
    error DCSEngine__BreaksHealthFactor();
    error DCSEngine__FailedMinted();
    error DCSEngine__HealthFactorOK();
    error DSCEngine__HealthFactorIsNotImproved();

    // Types

    using OracleLib for AggregatorV3Interface;

    // state variables

    uint256 private constant ADDITIONAL_FEED_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    uint256 private constant LIQUADIATION_THRESHOLD = 50;
    uint256 private constant LIQUADIATION_PRECISION = 100;
    uint256 private constant MIN_HEATH_FACTOR = 1e18;
    uint256 private constant FEED_PRECISION = 1e8;
    uint256 private constant LIQUADIATION_BONUS = 10;

    mapping(address token => address priceFeed) private s_priceFeed;
    mapping(address user => mapping(address token => uint256 amount)) private s_collateralDeposite;
    mapping(address user => uint256 amountDscMinted) private s_DSCMinted;
    DecentralizedStableCoin private immutable i_dscAddress;
    address[] private s_collateralTokens;

    // events
    event CollateralDeposite(address indexed user, address indexed token, uint256 indexed amount);
    event RedeemCollateral(address indexed redeemFrom,address indexed redeemTo, address indexed token, uint256 amount);

    // Modifier

    modifier moreThanzero(uint256 amount){
        if(amount == 0){
            revert DSCEngine__AmountShouldBeGreaterThanzero();
        }
        _;
    }

    modifier isAllowedToken(address token){
        if(s_priceFeed[token] ==  address(0)){
            revert DCSEngine__TokenNotAllowed();
        }
        _;
    }
    // set the priceFeed address so the only priceFeed address our contract will aprove. like eth, btc etc
    constructor(address[] memory tokenAddresses, address[] memory priceFeedAddresses, address dscEngine){
        // first map the tokenAddresses to priceAddresses
        // check the both priceFeedAddress and tokenAddress should be equall length
        if(tokenAddresses.length != priceFeedAddresses.length){
            revert DCSEngine__LengthOfTokenAddressAndPriceFeedAddressMustBeSame();
        }

        // Now map the addresses
        for(uint256 i = 0; i < tokenAddresses.length; i++){
            s_priceFeed[tokenAddresses[i]] = priceFeedAddresses[i];
            s_collateralTokens.push(tokenAddresses[i]);
        }

        // set the dscAddress
        i_dscAddress = DecentralizedStableCoin(dscEngine);
    }

    /*
     * @params tokenCollateralAddress The address of the token which will deposite as collateral (think like security Deposite)
     * @params amountCollateral The amount of collateral is deposite
     * @params amountDscToMint the amount of DSC to mint
     * @notice This function will be actually the Main function which will deposite the collateral and mint DSC in one transaction
     */
    function depositeCollateralAndMintDsc(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountDscToMint) external {
        // First Call the despositeCollateral and Than call the minDsc Function
        depositeCollateral(tokenCollateralAddress, amountCollateral);
        mintDsc(amountDscToMint);
    }

    /*
     * @notice Follows CEI which is Check Effects Interactions
     * @param tokenCollateralAddress is a address of token to deposite as collateral
     * @param amountCollateral is a amount of collateral which will deposite
     */
    function depositeCollateral(address tokenCollateralAddress, uint256 amountCollateral) public moreThanzero(amountCollateral)
     isAllowedToken(tokenCollateralAddress) nonReentrant {

        s_collateralDeposite[msg.sender][tokenCollateralAddress] += amountCollateral;
        // update the event
        emit CollateralDeposite(msg.sender, tokenCollateralAddress, amountCollateral);
        // Ok Now Wrap this into the ERC20 standard so amount will collateral should transfer successfull
        bool success = IERC20(tokenCollateralAddress).transferFrom(msg.sender, address(this), amountCollateral);
        if(!success){
            revert DCSEngine__TransferFailed();
        }
    }

    /* 
     * @param tokenCollateralAddress The collateral address to redeem
     * @param amountCollateral the collateral amount to redeem
     * @param amountDscToBurn The amount of DSC to burn
     * @notice This function will burn and reedem collateral in one transactions
     */
    function redeemCollateralForDsc(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountDscToBurn) external {
        burnDsc(amountDscToBurn);
        redeemCollateral(tokenCollateralAddress,amountCollateral);
    }

    // How to redeem collateral?.
    // In Order to reedeem the health factor should be over 1 after the pulled (means after the collateral deposite)
    function redeemCollateral(address tokenAddress, uint256 amountCollateral) public moreThanzero(amountCollateral) nonReentrant {
        _redeemCollateral(msg.sender,msg.sender,tokenAddress,amountCollateral);
        _revertIfHealthFactoreIsBroken(msg.sender);
    }

    /*
     * @notice follow the CEI
     * @param amountDscToMint the amount of DSC to mint
     * 
     * They Have a more collateral Value than the minimum threshold
     */
    function mintDsc(uint256 amountDscToMint) public moreThanzero(amountDscToMint) nonReentrant {
        s_DSCMinted[msg.sender] += amountDscToMint;
        // If They collateral is too much than it should revert
        _revertIfHealthFactoreIsBroken(msg.sender);

        // if not then mint
        bool minted = i_dscAddress.mint(msg.sender, amountDscToMint);
        if(!minted){
            revert DCSEngine__FailedMinted();
        }

    }

    function burnDsc(uint256 amount) public moreThanzero(amount) {
        _burnDsc(amount,msg.sender,msg.sender);
        _revertIfHealthFactoreIsBroken(msg.sender); //May be this line of code will not need. Like its never hit.
    }

    /* 
     * @param collateral The Erc20 collateral address to liquidate from user
     * @param user The user who has broken the health factor, _healthFactor should be below the MIN_Health_Factor
     * @param deptToCover The amount of DSC you want to burn to improve the users health factor
     * @notice you can partially liquidate user position and You will get the bonus of this
     * Check Effects Interactions
     */
    function liquidate(address collateral, address user, uint256 deptToCover) external isAllowedToken(collateral) moreThanzero(deptToCover) nonReentrant {
        uint256 startingUserHealthFactor = _healthFactor(user);
        // Check if its healther factor greather than 1 
        if(startingUserHealthFactor >= MIN_HEATH_FACTOR){
            revert DCSEngine__HealthFactorOK();
        }
        // after checking the health factor.
        // we want to burn their DSC dept and take their collateral basically the purpose is remove the user from this system
        uint256 tokenAmountFromDeptCovered = getTokenAmountFromUsd(collateral, deptToCover);

        uint256 bounusCollateral = (tokenAmountFromDeptCovered * LIQUADIATION_BONUS) / LIQUADIATION_PRECISION;
        uint256 totallCollateralToRedeem = tokenAmountFromDeptCovered + bounusCollateral;
        // Here the collateral will transfer from the user to the liquidator
        _redeemCollateral(user, msg.sender, collateral,totallCollateralToRedeem);
        // Now Burn the DSC from the user account
        _burnDsc(deptToCover,user, msg.sender);

        uint256 endingHealthFactor = _healthFactor(user);
        if(endingHealthFactor <= startingUserHealthFactor){
            revert DSCEngine__HealthFactorIsNotImproved();
        }
        _revertIfHealthFactoreIsBroken(msg.sender);
    }

    // Private and Internal view Functions
    /*
     * Returns how close to liquidation a user is
     *  If the user goes to 1, than it can be liquidated.
     */
    function _healthFactor(address user) private view returns (uint256){
        // totall DSC Minted
        // totall collateral Value

        (uint256 totallDscMinted, uint256 collateralValueInUsd) = _getAccountInformation(user);
        return _calculateHealthFactor(totallDscMinted, collateralValueInUsd);
    }

    // calculate Heath factor code
    function _calculateHealthFactor(uint256 totalDscMinted,uint256 collateralValueInUsd) internal pure returns (uint256){
        if (totalDscMinted == 0) return type(uint256).max;
        
        uint256 collateralAdjustedForThreshold = (collateralValueInUsd * LIQUADIATION_THRESHOLD) / LIQUADIATION_PRECISION;
        return (collateralAdjustedForThreshold * PRECISION) / totalDscMinted;
    }

        // Check Health factor is have enough collateral
        // revert if they don't
    function _revertIfHealthFactoreIsBroken(address user) internal view {
        uint256 userHealthFactor = _healthFactor(user);
        
        if(userHealthFactor < MIN_HEATH_FACTOR){
            revert DCSEngine__BreaksHealthFactor();
        }
    }
    // public view functions

    function getTokenAmountFromUsd(address token, uint256 usdAmountInWei) public view returns(uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeed[token]);
        (,int256 answer,,,) = priceFeed.staleCheckLatestRoundData();

        // Now Here do some math
        return (usdAmountInWei * PRECISION) / (uint256(answer) * ADDITIONAL_FEED_PRECISION);
    }

    function getAccountColleteralValue(address user) public view returns (uint256 totallCollateralValueInUsd){
        // loop through each collateral token and get the amount which they have deposite and map it to
        // the priceFeed and get the usd value

        for(uint256 i=0; i < s_collateralTokens.length; i++){
            // First get the token
            address token = s_collateralTokens[i];
            uint256 amount = s_collateralDeposite[user][token];
            // what here we do . We do here actually get the value of all priceFeed we set in usd.
            totallCollateralValueInUsd += getValueInUsd(token,amount);
        }

        return totallCollateralValueInUsd;
    }

    function getValueInUsd(address token, uint256 amount) public view returns (uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(s_priceFeed[token]);
        (,int256 answer,,,) = priceFeed.staleCheckLatestRoundData();
        // Now doing some math here because the priceFeed price is the long number and we have to first convert it to 
        // and than divide so we get the usd

        // 1 eth = 1000$
        // The return value from chainlink is a 1000 * 1e18 which is a massive number

        // (1000 * 1e18) * amount / 1e18

        return ((uint256(answer) * ADDITIONAL_FEED_PRECISION) * amount) / PRECISION; 
    }

    // private functions

    /*
     * @dev Low-Level internal Function , do not call it unless the function calling it
     * to the factor being broken 
     */
    function _burnDsc(uint256 amountDscToBurn, address onBehalfOf, address dscFrom) private {
        s_DSCMinted[onBehalfOf] -= amountDscToBurn;
        // Now transfer the dsc tokens which the user will hold now transfer to the engine so it will destroy (burn)
        bool success = i_dscAddress.transferFrom(dscFrom, address(this), amountDscToBurn);
        if(!success){
            revert DCSEngine__TransferFailed();
        }
        i_dscAddress.burn(amountDscToBurn);
    }

    function _redeemCollateral(address from, address to, address tokenCollateralAddress, uint256 amountCollateral) private {
        // First substract the amount from collateral 
        s_collateralDeposite[from][tokenCollateralAddress] -= amountCollateral;
        // After changing the state we have to emit the event so the log will sucessfully create
        emit RedeemCollateral(from,to, tokenCollateralAddress, amountCollateral);
        // Now transfter the actually priceFeed token back to user 
        bool sucess = IERC20(tokenCollateralAddress).transfer(to, amountCollateral);
        if(!sucess){
            revert DCSEngine__TransferFailed();
        }
        _revertIfHealthFactoreIsBroken(msg.sender);
    }

    function _getAccountInformation(address user) private view returns (uint256 totallDscMinted, uint256 collateralValueInUsd){
        totallDscMinted = s_DSCMinted[user];
        collateralValueInUsd = getAccountColleteralValue(user);
    }

    // external view functions 

    function calculateHealthFactor(uint256 totalDscMinted,uint256 collateralValueInUsd) external pure returns (uint256){
        return _calculateHealthFactor(totalDscMinted, collateralValueInUsd);
    }

    function getCollateralBalanceOfUser(address user, address token) external view returns (uint256) {
        return s_collateralDeposite[user][token];
    }

    function getAccountInformation(address user) external view returns (uint256 totallDscMinted, uint256 collateralValueInUsd){
        (totallDscMinted, collateralValueInUsd) = _getAccountInformation(user);
    }

    function getLiquadiationThreshold() external pure returns (uint256){
        return LIQUADIATION_THRESHOLD;
    }

    function getHealthFactor(address user) external view returns (uint256) {
        return _healthFactor(user);
        
    }

     function getPrecision() external pure returns (uint256) {
        return PRECISION;
    }

    function getAdditionalFeedPrecision() external pure returns (uint256) {
        return ADDITIONAL_FEED_PRECISION;
    }

    function getLiquidationBonus() external pure returns (uint256) {
        return LIQUADIATION_BONUS;
    }

    function getLiquidationPrecision() external pure returns (uint256) {
        return LIQUADIATION_PRECISION;
    }

    function getMinHealthFactor() external pure returns (uint256) {
        return MIN_HEATH_FACTOR;
    }

     function getCollateralTokens() external view returns (address[] memory) {
        return s_collateralTokens;
    }

    function getDsc() external view returns (address) {
        return address(i_dscAddress);
    }

    function getCollateralTokenPriceFeed(address token) external view returns (address) {
        return s_priceFeed[token];
    }   
}


