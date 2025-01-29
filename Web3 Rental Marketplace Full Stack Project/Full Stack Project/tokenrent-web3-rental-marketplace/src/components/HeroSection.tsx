

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="min-h-screen bg-[#0d0f17] overflow-hidden relative">
      {/* Ethereum Network Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 text-cyan-400/90">
        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
        <span className="text-sm font-mono">Ethereum Mainnet</span>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Ethereum Node Connections Animation */}
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{
            backgroundImage: [
              "radial-gradient(circle at 50% 50%, #4f46e530 0%, transparent 30%)",
              "radial-gradient(circle at 30% 70%, #4f46e530 0%, transparent 40%)",
              "radial-gradient(circle at 70% 30%, #4f46e530 0%, transparent 40%)",
            ]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Modified Ethereum Blockchain Animation */}
        <motion.div
          className="absolute right-1/2 translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1, 0.8],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox="0 0 256 417"
            className="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px] text-cyan-400/10"
            preserveAspectRatio="xMidYMid"
          >
            <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
            <path fill="currentColor" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
            <path fill="currentColor" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
            <path fill="currentColor" d="M127.962 416.905v-104.72L0 236.585z" />
          </svg>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left relative"
          >
            {/* Ethereum Blockchain Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute z-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -80, 0],
                  x: [0, 40, 0],
                  opacity: [0, 0.4, 0],
                }}
                transition={{
                  duration: 6 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full blur-[1px]" />
              </motion.div>
            ))}

            {/* Content */}
            {/* <div className="relative z-10"> */}
            <div className="relative z-10 w-full">
              {/* Updated Banner Container for Better Mobile Centering */}
              <div className="w-full flex justify-center lg:justify-start mb-6">
                <div className="flex items-center gap-3 max-w-fit mx-auto lg:mx-0">
                  <div className="w-8 h-8 flex-shrink-0">
                    <Zap className="w-full h-full text-cyan-400 fill-current" />
                  </div>
                  <div className="border border-cyan-400/30 px-3 py-1 rounded-full">
                    <span className="font-mono text-cyan-400/90 text-sm whitespace-nowrap">
                      Powered by Ethereum Smart Contracts
                    </span>
                  </div>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-100 leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                  Decentralized
                </span>
                <br />
                Heavy Equipment Marketplace
              </h1>
              
              <motion.p
                className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Trustless equipment rentals powered by Ethereum smart contracts. 
                Enjoy automated escrow, instant settlements, and transparent 
                transaction history recorded on-chain.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 group"
                  size="lg"
                >
                  Explore Equipment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  className="text-cyan-400 border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/60 hover:text-cyan-300 font-medium"
                  size="lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Smart Search
                </Button>
              </motion.div>

              {/* Blockchain Stats Grid */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { value: "5.2K+", label: "Active Contracts" },
                  { value: "<0.1Ξ", label: "Avg. Gas Fee" },
                  { value: "2.4s", label: "Block Time" },
                  { value: "12.8K", label: "Transactions" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-cyan-400/20 hover:border-cyan-400/40 transition-colors group"
                  >
                    <div className="text-2xl font-bold text-cyan-400 mb-1 group-hover:text-cyan-300 transition-colors">
                      {stat.value}
                    </div>
                    <div className="text-sm text-cyan-200/90">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Equipment Showcase */}
          <motion.div
            className="relative group"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-cyan-400/30 transform transition-all group-hover:border-cyan-400/60 bg-gradient-to-br from-cyan-400/10 to-transparent">
              <Image
                src="/images/NFT.jpeg"
                alt="Heavy Equipment"
                fill
                className="object-cover"
                priority
              />
              
              {/* Price in ETH with USD Conversion */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-900/90 to-transparent">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-cyan-100">Caterpillar 320F</h3>
                    <p className="text-cyan-300/90">Hydraulic Excavator</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      0.45 ETH <span className="text-sm text-cyan-300/80">($1,620)</span>
                    </div>
                    <div className="text-sm text-green-400/90 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Available Now
                    </div>
                  </div>
                </div>
              </div>

              {/* Ethereum Verification Badge */}
              <div className="absolute top-4 right-4 bg-cyan-400/20 px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm border border-cyan-400/30">
                <svg
                  viewBox="0 0 256 417"
                  className="w-5 h-5 text-cyan-400"
                  preserveAspectRatio="xMidYMid"
                >
                  <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                </svg>
                <span className="text-sm text-cyan-400 font-medium">Ethereum Verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;