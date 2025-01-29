"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import imageUrlBuilder from '@sanity/image-url';
import { useRouter } from 'next/navigation';
import { SanityImage } from "@/sanity/lib/client";

interface SanityEquipment {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  dailyRate: number;
  images: SanityImage[];
  status: 'available' | 'limited' | 'booked';
  nftAddress?: string;
  tokenId?: string;
}

const builder = imageUrlBuilder(client);

const EquipmentCollection = () => {
  const router = useRouter();
  const [equipment, setEquipment] = useState<SanityEquipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        // Modified query to get first 4 items without specific ordering
        const query = `*[_type == "equipment"][0...5] {
          _id,
          name,
          slug,
          dailyRate,
          images,
          status,
          nftAddress,
          tokenId
        }`;

        const data = await client.fetch<SanityEquipment[]>(query);

        // Remove duplicates based on NFT address and token ID
        const uniqueEquipment = data.reduce((acc: SanityEquipment[], current: SanityEquipment) => {
          const isDuplicate = acc.find(item => 
            item.nftAddress === current.nftAddress && 
            item.tokenId === current.tokenId
          );
          
          if (!isDuplicate) {
            acc.push(current);
          }
          return acc;
        }, []);

        if (!data || data.length === 0) {
          throw new Error('No equipment found');
        }

        setEquipment(uniqueEquipment);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load equipment');
      } finally {
        setLoading(false);
      }
    };
  
    fetchEquipment();
  }, []);

  const getImageUrl = (image: SanityImage) => {
    return builder.image(image).width(800).height(800).url();
  };

  if (loading) {
    return (
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Blockchain-Verified
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mt-2">
              Equipment Marketplace
            </span>
          </motion.h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Secure, transparent rentals powered by smart contracts
          </p>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {equipment.map((item) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image Container */}
              <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                {item.images?.[0] && (
                  <Image
                    src={getImageUrl(item.images[0])}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                
                {/* Status Ribbon */}
                <div className="absolute top-4 right-0 bg-white/95 backdrop-blur-sm px-4 py-2 shadow-sm">
                  <span className={`text-sm font-medium ${
                    item.status === 'available' 
                      ? 'text-green-600'
                      : item.status === 'limited'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Verification Badge */}
                {item.nftAddress && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <EthereumIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Verified
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                      {item.dailyRate} ETH/day
                    </span>
                  </div>
                  <button 
                    onClick={() => router.push(`/equipment/${item.slug.current}`)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span className="font-medium">Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <button 
            onClick={() => router.push('/list-equipment')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:shadow-xl transition-all font-medium flex items-center gap-2 mx-auto"
          >
            Explore Full Collection
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// Ethereum Icon Component
const EthereumIcon = ({ className }: { className?: string }) => (
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

export default EquipmentCollection;