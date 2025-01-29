// lib/blockchain.ts
import { ethers } from 'ethers';

import RentalFactoryArtifact from '@/abis/RentalFactory.json';
import EquipmentNFTArtifact from '@/abis/EquipmentNFT.json';
import RentalAgreementArtifact from '@/abis/RentalAgreement.json';

// interface EthereumProvider {
//   request: (args: { method: string; params?: [] }) => Promise<unknown>;
//   on: (eventName: string, handler: (...args: []) => void) => void;
//   removeListener: (eventName: string, handler: (...args: []) => void) => void;
//   selectedAddress: string | null;
//   isMetaMask?: boolean;
//   isConnected: () => boolean;
//   chainId: string;
// }


// declare global {
//   interface Window {
//     ethereum?: EthereumProvider;
//   }
// }

export const FACTORY_ADDRESS = "0x32e56cC71a628E2d637C6132E67C3c095286D68D";

// Initialize provider and signer
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return ethers.getDefaultProvider('sepolia');
};

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("No Ethereum provider found");
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return new ethers.BrowserProvider(window.ethereum);
};

// Contract initialization helpers
export const getFactoryContract = (signer: ethers.Signer) => {
    const RentalFactoryABI = RentalFactoryArtifact.abi;
  return new ethers.Contract(FACTORY_ADDRESS, RentalFactoryABI, signer);
};

export const getNFTContract = (address: string, signer: ethers.Signer) => {
   const EquipmentNFTABI = EquipmentNFTArtifact.abi; 
  return new ethers.Contract(address, EquipmentNFTABI, signer);
};

export const getRentalContract = (address: string, signer: ethers.Signer) => {
    const RentalAgreementABI = RentalAgreementArtifact.abi;
  return new ethers.Contract(address, RentalAgreementABI, signer);
};

// Core blockchain operations
export const createRentalContracts = async (signer: ethers.Signer) => {
  const factory = getFactoryContract(signer);
  const tx = await factory.createContracts();
  await tx.wait();
  
  const nftAddress = await factory.sellerToNFTContract(await signer.getAddress());
  const rentalAddress = await factory.sellerToRentalContract(await signer.getAddress());
  
  return { nftAddress, rentalAddress };
};

export const mintEquipmentNFT = async (
  nftAddress: string,
  signer: ethers.Signer,
  equipmentData: {
    name: string;
    description: string;
    imageUri: string;
  }
) => {
  const nftContract = getNFTContract(nftAddress, signer);
  const tx = await nftContract.mintEquipment(
    equipmentData.name,
    equipmentData.description,
    equipmentData.imageUri
  );
  const receipt = await tx.wait();
  return receipt.logs[0].args[0]; // Returns tokenId
};

export const listEquipmentForRent = async (
  rentalAddress: string,
  nftAddress: string,
  signer: ethers.Signer,
  tokenId: number,
  dailyRate: number,
  securityDeposit: number
) => {
  const rentalContract = getRentalContract(rentalAddress, signer);
  const tx = await rentalContract.listEquipments(
    tokenId,
    ethers.parseEther(dailyRate.toString()),
    ethers.parseEther(securityDeposit.toString())
  );
  await tx.wait();
};