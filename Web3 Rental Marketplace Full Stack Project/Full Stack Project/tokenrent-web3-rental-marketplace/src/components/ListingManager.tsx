"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import RentalAgreementABI from '@/abis/RentalAgreement.json';

const RENTAL_CONTRACT_ADDRESS = "0x0bcD185c3e5f5Ce70a22ca938A1b12398632B7A5";

export default function ListingManager({ signer }: { signer: ethers.Signer }) {
  const [tokenId, setTokenId] = useState<number>(0);
  const [rentAmount, setRentAmount] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');

  const handleUpdateListing = async () => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    await rentalContract.listEquipments(
      tokenId,
      ethers.parseEther(rentAmount),
      ethers.parseEther(depositAmount)
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Update Listing</h2>
      <input
        type="number"
        placeholder="Token ID"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setTokenId(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Rent Amount (ETH)"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setRentAmount(e.target.value)}
      />
      <input
        type="number"
        placeholder="Deposit Amount (ETH)"
        className="w-full mb-3 p-2 border rounded"
        onChange={(e) => setDepositAmount(e.target.value)}
      />
      <button
        onClick={handleUpdateListing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Update Listing
      </button>
    </div>
  );
}