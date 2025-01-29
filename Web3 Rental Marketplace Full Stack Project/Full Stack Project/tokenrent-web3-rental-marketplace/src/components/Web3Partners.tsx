"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Web3Partners = () => {
  // Updated partners array with consistent image property
  const partners = [
    { name: "MetaMask", image: "/images/c-1.png" },
    { name: "OpenSea", image: "/images/c-2.jpg" },
    { name: "Polygon", image: "/images/c-4.png" },
    { name: "Chainlink", image: "/images/c-5.jpg" },
    { name: "Uniswap", image: "/images/c-7.jpeg" },
    { name: "Alchemy", image: "/images/c-8.jpeg" },
  ];


  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Ethereum Pattern Background */}
      <div className="absolute inset-0 opacity-10 z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${40 + Math.random() * 60}px`,
            }}
            animate={{
              y: [0, 40, 0],
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, 360],
            }}
            transition={{
              duration: 12 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <svg viewBox="0 0 256 417" className="text-blue-200">
              <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
              <path fill="currentColor" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
              <path fill="currentColor" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
              <path fill="currentColor" d="M127.962 416.905v-104.72L0 236.585z"/>
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by the 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              {" "}Web3 Ecosystem
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Partnered with leading decentralized protocols and platforms
          </p>
        </motion.div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-200"
            >
              <div className="relative aspect-square">
                <Image
                  src={partner.image}
                  alt={partner.name}
                  fill
                  className="object-contain p-2  grayscale-0 transition-all duration-300 opacity-90 group-hover:opacity-100"
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { value: "1.2M+", label: "Daily Transactions" },
            { value: "98%", label: "Success Rate" },
            { value: "50+", label: "Supported Chains" },
            { value: "24/7", label: "Protocol Monitoring" },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-200 transition-colors">
              <div className="text-3xl font-bold text-blue-600">
                {stat.value}
              </div>
              <div className="text-gray-600 text-sm mt-2">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Web3Partners;