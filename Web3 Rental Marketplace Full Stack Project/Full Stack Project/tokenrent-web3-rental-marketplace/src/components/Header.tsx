"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet } from 'lucide-react';
import connectWallet from '@/lib/metamask';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);



  return (
    <header className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-md border-b border-gray-800 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-400 hover:text-white transition-colors duration-200">
              <span className="text-blue-400">Token</span>Rent
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              href="/"
            >
              Marketplace
            </a>
            <a
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              href="/list-equipment"
            >
              List Equipment
            </a>
            <a
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              href="https://blockchain-blog-iota.vercel.app/"
            >
              Web3 Blogs
            </a>
            <a
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              href="/about-us"
            >
              About
            </a>

            <a
              className="text-gray-400 hover:text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium"
              href="/auth"
            >
              SignIn
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              className="text-gray-400 border-gray-600 hover:bg-white/5 hover:text-white hover:border-gray-300 transition-colors duration-200"
              size="sm"
              // onClick={connectWallet}
              onClick={(event) => {
                event.preventDefault();
                connectWallet();
              }}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/50 backdrop-blur-sm rounded-lg mt-2 border border-gray-800">
            <div className="px-2 pt-2 pb-4 space-y-1">
              <a
                className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200 text-sm"
                href="/"
              >
                Marketplace
              </a>
              <a
                className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200 text-sm"
                href="/list-equipment"
              >
                List Equipment
              </a>
              <a
                className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200 text-sm"
                href="https://blockchain-blog-iota.vercel.app/"
              >
                 Web3 Blogs
              </a>
              <a
                className="block px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors duration-200 text-sm"
                href="about-us"
              >
                About
              </a>
              <div className="mt-2 px-3">
                <Button
                  variant="outline"
                  className="w-full text-gray-400 border-gray-600 hover:bg-white/5 hover:text-white hover:border-gray-400"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    connectWallet();
                  }}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;