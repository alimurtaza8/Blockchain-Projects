// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MerkleAirDrop is EIP712 {
    // What we do in this contract? We actually list the members so we have the addresses of it
    // And Than select someone to claim the token or airdrop

    using SafeERC20 for IERC20;

    error MerkleAirDrop__InvalidProof();
    error MerkleAirDrop__AlreadyClaimedMan();
    error MerkleAirDrop__InvaliedSignature();

    event Claim(address account, uint256 amount);
    
    address[] claimers;

    struct AirdropClaim {
        address account;
        uint256 amount;
    }

    mapping(address claimer => bool claimed) private s_hashClaimed;

    bytes32 private immutable i_merkleRoot;
    IERC20 private immutable i_airdropTokens;
    bytes32 private constant MESSAGE_TYPEHASH = keccak256("AirdropClaim(address account,uint256 amount)");
        


    constructor(bytes32 merkleRoot, IERC20 airdropTokens) EIP712("MerkleAirdrop","1") {
        i_merkleRoot = merkleRoot;
        i_airdropTokens = airdropTokens;
    }

    // Claim function
    function claim (address account, uint256 amount, bytes32[] calldata merkleProof, uint8 v, bytes32 r, bytes32 s) external {
        // But Before doing anything lets check the claimer has claimed the token or not
        if(s_hashClaimed[account]){
            revert MerkleAirDrop__AlreadyClaimedMan();
        }
        // Ok Now Check the signature
        if(!_isValidSignature(account, getMessageHash(account, amount),v,r,s)){
            revert MerkleAirDrop__InvaliedSignature();
            }
        // First calculate the hash
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, amount))));
        // Now verifying the merkel proof that the address is exits or not
        if(!MerkleProof.verify(merkleProof,i_merkleRoot,leaf)){
            revert MerkleAirDrop__InvalidProof();
        }
        s_hashClaimed[account] = true;
        // Ok If the user will verify than emit the log
        emit Claim(account, amount);
        // Now SafeTransfer the token to the token claimer
        i_airdropTokens.safeTransfer(account, amount);
    }

    function getMessageHash(address account, uint256 amount) public view returns (bytes32){
        return _hashTypedDataV4(keccak256(abi.encode(MESSAGE_TYPEHASH, AirdropClaim({account: account, amount: amount}))));
    }

    function _isValidSignature(address account, bytes32 digest, uint8 v, bytes32 r,  bytes32 s) internal pure returns (bool){
        (address actualSigner , ,) = ECDSA.tryRecover(digest,v,r,s);
        return actualSigner == account;
    }

    function getMerkleRoot() external view returns (bytes32){
        return i_merkleRoot;
    }

    function getAirdropToken() external view returns (IERC20){
        return i_airdropTokens;
    }

}