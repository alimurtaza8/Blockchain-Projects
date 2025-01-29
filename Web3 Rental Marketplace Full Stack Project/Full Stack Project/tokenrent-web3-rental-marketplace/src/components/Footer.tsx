"use client";

// import { motion } from "framer-motion";
// import Image from "next/image";
import { Twitter, Github, Linkedin, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">TokenRent</span>
            </div>
            <p className="text-gray-400 mb-6">
              Decentralizing heavy equipment rental through blockchain innovation
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="border-gray-700 text-white">
                <Twitter className="w-5 h-5" />
              </Button>
              {/* <Button variant="outline" className="border-gray-700 text-white">
                <Discord className="w-5 h-5" />
              </Button> */}
              <Button variant="outline" className="border-gray-700 text-white">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-gray-700 text-white">
                <Linkedin className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Marketplace</h3>
            <ul className="space-y-4">
              {['All Equipment', 'Construction', 'Mining', 'Agriculture'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              {['Documentation', 'Blog', 'Security', 'API'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
           <div>
            {/* <h3 className="text-white font-semibold mb-6">Stay Updated</h3>
             <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              />
              <Button className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700">
                Subscribe
              </Button>
            </div> */}

            <div className="mt-6 flex items-center gap-4">
              <Button variant="outline" className="border-gray-700 text-black">
                {/* <Image
                  src="/images/ethereum-logo.png"
                  width={24}
                  height={24}
                  alt="Ethereum"
                  className="h-4 w-4"
                /> */}
                <span className="ml-2">Connect Wallet</span>
              </Button>
            </div>
           </div> 
        
        </div>

        {/* Blockchain Network Status */}
        <div className="mt-16 border-t border-gray-800 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-400 text-sm">
                Ethereum Network: Operational
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Gas Price: 23 Gwei • Last Block: 18,432,901
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center">
              © {new Date().getFullYear()} TokenRent. Decentralizing heavy equipment rental
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-500 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-white text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Ethereum Pattern */}
      {/* <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-8 gap-4">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                className="text-center"
                animate={{ y: [0, 20, 0] }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                }}
              >
                <svg
                  viewBox="0 0 256 417"
                  className="w-full h-auto text-blue-500"
                  preserveAspectRatio="xMidYMid"
                >
                  <path fill="currentColor" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z" />
                  <path fill="currentColor" d="M127.962 0L0 212.32l127.962 75.639V154.158z" />
                  <path fill="currentColor" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z" />
                  <path fill="currentColor" d="M127.962 416.905v-104.72L0 236.585z" />
                </svg>
              </motion.div>
            ))}
          </div>
        </div>
      </div> */}
    </footer>
  );
};

export default Footer;