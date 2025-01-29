"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RentalAgreementABI from '@/abis/RentalAgreement.json';

const RENTAL_CONTRACT_ADDRESS = "0x0bcD185c3e5f5Ce70a22ca938A1b12398632B7A5";

export default function WithdrawPanel({ signer }: { signer: ethers.Signer }) {
  const [pendingAmount, setPendingAmount] = useState<string>('0');

  const loadPendingAmount = async () => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    const amount = await rentalContract.getPendingWithdrawals();
    setPendingAmount(ethers.formatEther(amount));
  };

  const handleWithdraw = async () => {
    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    await rentalContract.withdraw();
    await loadPendingAmount();
  };

  useEffect(() => { loadPendingAmount(); }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h2 className="text-xl font-bold mb-4">Withdraw Funds</h2>
      <p className="mb-4">Pending Amount: {pendingAmount} ETH</p>
      <button
        onClick={handleWithdraw}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Withdraw
      </button>
    </div>
  );
}