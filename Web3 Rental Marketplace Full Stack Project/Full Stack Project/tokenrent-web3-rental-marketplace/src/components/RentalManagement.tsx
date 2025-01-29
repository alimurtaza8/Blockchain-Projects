
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentalAgreementABI from '@/abis/RentalAgreement.json';

const RENTAL_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface RentalAgreement {
  renter: string;
  startTime: number;
  duration: number;
  depositAmount: string;
  isActive: boolean;
  timeRemaining: number;
  tokenId: number;
}

export default function RentalManagement({ signer }: { signer: ethers.Signer }) {
  const [activeRentals, setActiveRentals] = useState<RentalAgreement[]>([]);

  const loadRentals = async () => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    const tokens = await rentalContract.getActiveRentals();
    const rentals = await Promise.all(tokens.map(async (tokenId: bigint) => {
      const details = await rentalContract.getRentalDetails(tokenId);
      return { tokenId: Number(tokenId), ...details };
    }));

    setActiveRentals(rentals);
  };

  const handleEndRental = async (tokenId: number) => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    await rentalContract.endRentAgreement(tokenId);
    await loadRentals();
  };

  useEffect(() => { loadRentals(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Active Rentals</h2>
      {activeRentals.map(rental => (
        <div key={rental.tokenId} className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Token #{rental.tokenId}</h4>
              <p>Renter: {rental.renter.slice(0, 6)}...{rental.renter.slice(-4)}</p>
              <p>Time Left: {Math.ceil(rental.timeRemaining / 86400)} days</p>
            </div>
            <button
              onClick={() => handleEndRental(rental.tokenId)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              End Rental
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
