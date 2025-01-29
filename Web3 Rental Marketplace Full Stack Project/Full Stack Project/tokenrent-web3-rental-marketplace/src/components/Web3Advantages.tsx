"use client";

import { motion } from "framer-motion";
import { Shield,  Coins, Clock, Globe, Scale, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Web3Advantages = () => {
  const router = useRouter();
  
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Unbreakable Security",
      description: "Immutable smart contracts replace paper agreements",
      traditional: "Vulnerable paper contracts",
      web3: "Blockchain-secured deals"
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Zero Middlemen",
      description: "Peer-to-peer transactions with no commission fees",
      traditional: "15-30% platform fees",
      web3: "0% commission structure"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Settlements",
      description: "Automated crypto payments upon delivery",
      traditional: "30-60 day payments",
      web3: "Real-time settlements"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Access",
      description: "Borderless transactions in multiple cryptocurrencies",
      traditional: "Regional limitations",
      web3: "Worldwide marketplace"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Fair Dispute Resolution",
      description: "Decentralized arbitration through DAO governance",
      traditional: "Costly legal processes",
      web3: "Community-powered justice"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Green Operations",
      description: "Carbon-neutral transactions with proof-of-stake",
      traditional: "High paper waste",
      web3: "Eco-friendly blockchain"
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Revolutionizing Equipment Rental
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mt-2">
              Web3 vs Traditional
            </span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Experience the future of industrial rentals with blockchain-powered solutions
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-6">{feature.description}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600">
                  <div className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm">{feature.traditional}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">{feature.web3}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Comparison */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 bg-blue-900 text-white rounded-2xl p-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">10x</div>
            <div className="text-gray-300">Faster Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">$0</div>
            <div className="text-gray-300">Hidden Fees</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">24/7</div>
            <div className="text-gray-300">Global Access</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-xl px-8 py-6 text-lg"
            onClick={() => router.push('/auth')}
          >
            Join the Rental Revolution
          </Button>
          <p className="text-gray-600 mt-4 text-sm">
            Still using traditional methods? 
            <a href="#" className="text-blue-600 hover:underline ml-2">
              Compare full features
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Web3Advantages;