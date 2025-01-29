"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentalAgreementABI from '@/abis/RentalAgreement.json';

const RENTAL_CONTRACT_ADDRESS = "0x0bcD185c3e5f5Ce70a22ca938A1b12398632B7A5";

interface PendingDeposit {
  id: string;
  amount: number;
  timestamp: Date;
  tokenId: number;
  // Add other relevant properties
}

export default function DepositHandler({ signer }: { signer: ethers.Signer }) {
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);

  const loadDeposits = async () => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    const deposits = await rentalContract.getPendingDeposits();
    setPendingDeposits(deposits);
  };

  const handleClaimDeposit = async (tokenId: number) => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    await rentalContract.claimDeposit(tokenId);
    await loadDeposits();
  };

  useEffect(() => { loadDeposits(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Pending Deposits</h2>
      {pendingDeposits.map((deposit, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">Token #{deposit.tokenId}</h4>
              <p>Amount: {ethers.formatEther(deposit.amount)} ETH</p>
            </div>
            <button
              onClick={() => handleClaimDeposit(deposit.tokenId)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Claim Deposit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}