
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, Clock, Loader, AlertCircle, Ban } from 'lucide-react';
import { client } from '@/sanity/lib/client';
// import imageUrlBuilder from '@sanity/image-url';
import { ethers } from 'ethers';
import RentalAgreementABI from '@/abis/RentalAgreement.json';
// import { Image } from 'sanity';
import {SanityImage,urlFor} from "@/sanity/lib/client";

interface SanityEquipment {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description: string;
  dailyRate: number;
  securityDeposit: number;
  images: SanityImage[];
  category: string;
  nftAddress: string;
  tokenId: string;
}

interface RentalDetails {
  isActive: boolean;
  timeRemaining: number;
  renter: string;
  startTime: number;
  duration: number;
}

const RENTAL_CONTRACT_ADDRESS = "0xF70CB025c530463370EE1173231d1554fC897901";

// const builder = imageUrlBuilder(client);

const EquipmentDetail = () => {
  const router = useRouter();
  const params = useParams();
  const [equipment, setEquipment] = useState<SanityEquipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentalDays, setRentalDays] = useState<number>(1);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [rentalDetails, setRentalDetails] = useState<RentalDetails | null>(null);

  useEffect(() => {
    const initWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setProvider(provider);
          setSigner(signer);
        } catch (error) {
          console.error("Wallet connection error:", error);
        }
      }
    };
    initWallet();
  }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const query = `*[_type == "equipment" && slug.current == $slug][0] {
          _id,
          name,
          slug,
          description,
          dailyRate,
          securityDeposit,
          images,
          category,
          nftAddress,
          tokenId
        }`;

        const data = await client.fetch<SanityEquipment>(query, { slug: params.slug });
        if (!data) throw new Error('Equipment not found');
        setEquipment(data);
        checkRentalStatus(data.tokenId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };

    const checkRentalStatus = async (tokenId: string) => {
      if (!provider) return;
      
      try {
        const rentalContract = new ethers.Contract(
          RENTAL_CONTRACT_ADDRESS,
          RentalAgreementABI.abi,
          provider
        );

        const details = await rentalContract.getRentalDetails(tokenId);
        setRentalDetails({
          isActive: details.isActive,
          timeRemaining: Number(details.timeRemaining),
          renter: details.renter,
          startTime: Number(details.startTime),
          duration: Number(details.duration)
        });
      } catch (error) {
        console.error("Error fetching rental status:", error);
        setRentalDetails(null);
      }
    };

    fetchEquipment();
  }, [params.slug, provider]);

  const handleRent = async () => {
    if (!equipment || !signer || !rentalDetails) return;

    if (rentalDetails.isActive) {
      setError("This equipment is currently rented");
      return;
    }

    setTransactionLoading(true);
    setError(null);

    try {
      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT_ADDRESS,
        RentalAgreementABI.abi,
        signer
      );

      const totalRent = ethers.parseEther(
        (equipment.dailyRate * rentalDays).toString()
      );
      const deposit = ethers.parseEther(equipment.securityDeposit.toString());
      const totalAmount = totalRent + deposit;

      const tx = await rentalContract.startRentAgreement(
        equipment.tokenId,
        rentalDays,
        { value: totalAmount }
      );

      await tx.wait();
      router.push('/dashboard');
    } catch (err) {
      console.error('Rental error:', err);
      setError('Transaction failed');
    } finally {
      setTransactionLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    if (!seconds) return "0 days";
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return `${days}d ${hours}h remaining`;
  };

  // const getImageUrl = (image: Image) => builder.image(image).width(800).height(800).url();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <AlertCircle className="h-8 w-8 mb-4" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  if (!equipment) return null;

  return (
    <div className="mt-8 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </motion.button>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {equipment.images?.[0] && (
              <img
                src={urlFor(equipment.images[0]).url()}
                alt={equipment.name}
                className="w-full h-full object-cover aspect-square"
              />
            )}
          </motion.div>

          <motion.div className="space-y-8">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {equipment.name}
                </h1>
                {rentalDetails?.isActive && (
                  <div className="bg-red-100 px-4 py-2 rounded-full flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-semibold">
                      Currently Rented
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-blue-600">
                  {equipment.dailyRate} ETH/day
                </span>
              </div>
              <p className="text-gray-600 mb-8">
                {equipment.description}
              </p>
            </div>

            {rentalDetails?.isActive && (
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-700">
                    Rental Period Ends In:
                  </span>
                </div>
                <p className="text-yellow-700">
                  {formatTimeRemaining(rentalDetails.timeRemaining)}
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Rental Duration</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={rentalDays}
                      onChange={(e) => setRentalDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-3 py-2 border rounded-lg"
                      disabled={rentalDetails?.isActive}
                    />
                    <span>days</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {(equipment.dailyRate * rentalDays + equipment.securityDeposit).toFixed(4)} ETH
                  </div>
                </div>
              </div>

              <button
                className={`w-full text-white py-4 rounded-xl transition-colors font-semibold flex items-center justify-center gap-3 ${
                  rentalDetails?.isActive 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                onClick={handleRent}
                disabled={transactionLoading || rentalDetails?.isActive}
              >
                {transactionLoading ? (
                  <Loader className="animate-spin h-6 w-6" />
                ) : rentalDetails?.isActive ? (
                  'Currently Unavailable'
                ) : signer ? (
                  <>
                    <Wallet className="w-6 h-6" />
                    Confirm Rental
                  </>
                ) : (
                  'Connect Wallet to Rent'
                )}
              </button>

              {error && (
                <div className="text-red-500 text-center mt-4">
                  <AlertCircle className="inline-block mr-2" />
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;