"use client";

import { motion } from "framer-motion";
import { CheckCircle, Warehouse, Wallet, Shield, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const SellerOnboarding = () => {
  const router = useRouter();

  const steps = [
    {
      title: "Connect Wallet",
      description: "Secure blockchain authentication using your Web3 wallet",
      icon: <Wallet className="w-6 h-6" />
    },
    {
      title: "Verify Identity",
      description: "Decentralized KYC process with privacy protection",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "List Equipment",
      description: "Create smart contract-powered rental agreements",
      icon: <Warehouse className="w-6 h-6" />
    }
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Become a Verified
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mt-2">
              Equipment Partner
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our decentralized marketplace and monetize your heavy equipment securely
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Process Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          >
            <div className="mb-8">
              <Coins className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Seller Benefits
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>0% Platform Fees for First 6 Months</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Smart Contract Escrow Protection</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Real-time Equipment Tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Instant Crypto Payments</span>
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 border-t pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-sm text-gray-600">Transaction Success</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24h</div>
                <div className="text-sm text-gray-600">Support Response</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
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
            Start Selling Now
          </Button>
          <p className="text-gray-600 mt-4 text-sm">
            Already a partner? 
            <a href="./auth" className="text-blue-600 hover:underline ml-2">
              Access your dashboard
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerOnboarding;