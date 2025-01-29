"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowRight, Plus, Clock, Zap } from "lucide-react";
import Link from "next/link";
// import { client } from "@/lib/sanity";
import {client} from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/client";
// import { PortableText } from '@portabletext/react';
// import {LucideIcon} from "lucide-react";

import { LucideIcon } from "lucide-react";
import {SanityImage} from "@/sanity/lib/client";

// Add this type definition
type StepItem = [LucideIcon, string, string, string];


interface Equipment {
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
  nftAddress?: string;
  tokenId?: string;
}


const EquipmentMarketplace = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  // const [, setShowAddForm] = useState(false);
  // const [walletConnected, setWalletConnected] = useState(false);

  // const handleConnectWallet = async () => {
  //   try {
  //     const provider = await connectWallet();
  //     const signer = await provider.getSigner();
  //     const address = await signer.getAddress();
      
  //     setWalletConnected(true);
  //     setUserAddress(address);
      
  //     // Check if contracts already exist
  //     const factoryContract = await getFactoryContract(signer);
  //     const nftAddress = await factoryContract.sellerToNFTContract(address);
  //     if (nftAddress !== ethers.ZeroAddress) {
  //       setNftContractAddress(nftAddress);
  //       setRentalContractAddress(await factoryContract.sellerToRentalContract(address));
  //     }
  //   } catch (error) {
  //     console.error('Wallet connection failed:', error);
  //   }
  // };

  // const handleListEquipment = async (sanityData: any) => {
  //   if (!walletConnected) return;
    
  //   try {
  //     const provider = await getProvider();
  //     const signer = await provider.getSigner();
      
  //     // Create contracts if not exists
  //     if (!nftContractAddress) {
  //       const { nftAddress, rentalAddress } = await createRentalContracts(signer);
  //       setNftContractAddress(nftAddress);
  //       setRentalContractAddress(rentalAddress);
  //     }

  //     // Mint NFT
  //     const tokenId = await mintEquipmentNFT(nftContractAddress, signer, {
  //       name: sanityData.name,
  //       description: sanityData.description,
  //       imageUri: sanityData.imageUri
  //     });

  //     // List for rent
  //     await listEquipmentForRent(
  //       rentalContractAddress,
  //       nftContractAddress,
  //       signer,
  //       tokenId,
  //       sanityData.dailyRate,
  //       sanityData.securityDeposit
  //     );

  //     // Update Sanity with NFT address
  //     await client.patch(sanityData._id)
  //       .set({ nftAddress: nftContractAddress })
  //       .commit();

  //   } catch (error) {
  //     console.error('Equipment listing failed:', error);
  //   }
  // };

  // useEffect(() => {
  //   const fetchEquipment = async () => {
  //     try {
  //       const query = `*[_type == "equipment"]{
  //         _id,
  //         name,
  //         slug,
  //         description,
  //         dailyRate,
  //         securityDeposit,
  //         images,
  //         category,
  //         nftAddress
  //       }`;
        
  //       const data = await client.fetch(query);
  //       setEquipment(data);
  //     } catch (error) {
  //       console.error('Error fetching equipment:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEquipment();
  // }, []);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // Modified query to check for unique entries and sort by creation time
        const query = `*[_type == "equipment"] | order(_createdAt desc) {
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
        
        const data = await client.fetch(query);
        
        // Filter out duplicates based on nftAddress and tokenId
        const uniqueEquipment = data.reduce((acc: Equipment[], current: Equipment) => {
          const isDuplicate = acc.find(item => 
            item.nftAddress === current.nftAddress && 
            item.tokenId === current.tokenId
          );
          
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setEquipment(uniqueEquipment);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl font-bold mx-auto text-center py-8">
        Loading equipment...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="mt-4 max-w-7xl mx-auto mb-16">
        {/* Header */}
        {/* <div className="flex justify-between items-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
          >
            ETHRent
          </motion.h1>
          
          <button 
            onClick={() => setWalletConnected(!walletConnected)}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Wallet className="w-5 h-5" />
            {walletConnected ? "0xYOUR...WALLET" : "Connect Wallet"}
          </button>
        </div> */}

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[
            ["342+", "Total Listings"],
            ["5,420 ETH", "Total Volume"],
            ["98%", "Verified Assets"],
            ["0.2s", "Avg. Transaction"]
          ].map(([value, label], index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-gray-600">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-cyan-500 p-8 rounded-3xl mb-16 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">Start Renting in 3 Steps</h2>
            {[
  [Zap, "zap", "Connect Wallet", "Secure blockchain connection"],
  [Plus, "plus", "List Equipment", "Create smart contract listing"],
  [Clock, "clock", "Earn ETH", "Automatic payments & escrow"]
].map(([Icon, id, title, description], index) => (
  <div key={id} className="flex items-center gap-4 mb-6">
    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="font-semibold">{index + 1}. {title}</h3>
      <p className="text-sm opacity-90">{description}</p>
    </div>
  </div>
))}
          </div> */}

<div className="relative z-10 max-w-2xl">
  <h2 className="text-3xl font-bold mb-4">Start Renting in 3 Steps</h2>
  {([
    [Zap, "zap", "Connect Wallet", "Secure blockchain connection"],
    [Plus, "plus", "List Equipment", "Create smart contract listing"],
    [Clock, "clock", "Earn ETH", "Automatic payments & escrow"]
  ] as StepItem[]).map(([Icon, id, title, description], index) => (
    <div key={id} className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold">
          {index + 1}. {title}
        </h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  ))}
</div>

          <div className="absolute right-0 top-0 w-1/3 h-full bg-[url('/images/ethereum-pattern.svg')] bg-cover opacity-20" />
        </motion.div>

        {/* Equipment Grid Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Available Equipment</h2>
          {/* <button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            List Equipment
          </button> */}
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {equipment.map((item) => (
            <Link href={`/equipment/${item.slug.current}`} key={item._id}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                  {item.images?.[0] && (
                    <img
                      src={urlFor(item.images[0]).width(600).url()}
                      alt={item.name}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute top-4 right-4 backdrop-blur-sm bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="text-green-600">Available</span>
                  </div>

                  {item.nftAddress && (
                    <div className="absolute top-4 left-4 backdrop-blur-sm bg-white/80 px-3 py-1 rounded-full flex items-center gap-2">
                      <EthereumIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Daily Rate</span>
                      <span className="text-lg font-bold text-blue-600">
                        {item.dailyRate} ETH
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Collateral</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.securityDeposit} ETH
                      </span>
                    </div>

                    {/* <div className="text-sm text-gray-600">
                      {item.description}
                    </div> */}
                  </div>

                  <button className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2 transition-colors">
                    Rent Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const EthereumIcon = ({ className }: { className: string }) => (
  <svg
    viewBox="0 0 256 417"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
    <path d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
    <path d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
    <path d="M127.962 416.905v-104.72L0 236.585z" />
  </svg>
);

export default EquipmentMarketplace;

