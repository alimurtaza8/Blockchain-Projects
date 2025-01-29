
"use client";

import {ethers} from "ethers";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {motion} from "framer-motion";
import { Shield,UserPlus,AlertCircle,Loader,ArrowRight} from 'lucide-react';
import Error from "next/error";
import { ErrorProps } from "next/error";
// import { Input } from "postcss";
// import { Eip1193Provider } from 'ethers';


// declare global {
//   interface Window {
//       ethereum: ethers.Eip1193Provider;
//   }
// }

const AuthPage = () =>{
    // use state and other variable is here
    const router = useRouter();
    const [authMethod,setAuthMethod] = useState('web3');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [loading,setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connectedAccount,setConnectedAccount] = useState('');

    // Web3 Auth Logic 

    const connectWallet = async (walletType = "metamask") => {
        try{
            setLoading(true);
            setError('');

            if (typeof window.ethereum  == 'undefined'){
                if (walletType == "metamask"){
                    window.open('https://metamask.io/download/', '_blank');
                    // throw new Error({message: "Please Install MetaMask"});
                    throw new Error("Please Install MetaMask" as "Please Install MetaMask" & ErrorProps);


                }
            }

            // create provider here

            // const provider = new ethers.BrowserProvider(window.ethereum);
            const provider = new ethers.BrowserProvider(
              window.ethereum as ethers.Eip1193Provider
            );
           
            const accounts = await provider.send("eth_requestAccounts",[]);

            if (accounts.length === 0){
                // throw new Error("No Account Found");
                throw new Error("No Account Found" as "No Account Found" & ErrorProps);
            }

                  // Store address in localStorage and state
      const address = accounts[0];
      localStorage.setItem('connectedAddress', address);
      setConnectedAccount(address);
      router.push('./dashboard');

            // setConnectedAccount(accounts[0]);
             await handleWeb3SignIn(accounts[0]);
        }
        catch(err){
          console.error("Wallet connection failed:", err);
            setError("wallet connection failed");
        }
        finally{
            setLoading(false);
        }
    };

    // backend logic
    const handleWeb3SignIn = async (address: string) => {
        try{
            console.log("Authentication Address: ", address);
            router.push('./dashboard');
        }
        catch(err){
          console.error("Wallet connection failed:", err);
            setError("Authentication failed");
        }
    }

    const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try{
            console.log("Signing up with: ", {email ,password} );
            router.push('./dashboard');
        }
        catch(err){
          console.error("Wallet connection failed:", err);
            setError("Signup Failded");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div className=" min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ethereum Background Pattern */}
          <div className="absolute inset-0 z-0 opacity-10">
            <svg 
              viewBox="0 0 256 417" 
              className="w-full h-full text-cyan-900/20"
              preserveAspectRatio="xMidYMid"
            >
              <path 
                fill="currentColor" 
                d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z M127.962 0L0 212.32l127.962 75.639V154.158z M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z M127.962 416.905v-104.72L0 236.585z"
              />
            </svg>
          </div>
    
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 relative z-10"
          >
            <div className="mt-10 text-center mb-8">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">
                Join the Decentralized Future
              </h1>
              <p className="text-gray-400">
                Secure access through Web3 or traditional authentication
              </p>
            </div>
    
            {/* Auth Method Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setAuthMethod('web3')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  authMethod === 'web3' 
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Web3 Login
              </button>
              <button
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  authMethod === 'email'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Email Signup
              </button>
            </div>
    
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 bg-red-900/30 border border-red-400/50 p-4 rounded-xl mb-6"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </motion.div>
            )}
    
            {authMethod === 'web3' ? (
              <div className="space-y-4">
                {/* <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connectWallet('metamask')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-gray-100 p-4 rounded-xl transition-all"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img 
                        src="/svg/metamask-icon.svg" 
                        alt="MetaMask" 
                        className="w-6 h-6"
                      />
                      Connect with MetaMask
                    </>
                  )}
                </motion.button> */}
    
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => connectWallet('walletconnect')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gray-700 hover:bg-gray-600 text-gray-100 p-4 rounded-xl transition-all"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <img 
                        src="/svg/metamask-icon.svg"  
                        alt="WalletConnect" 
                        className="w-6 h-6"
                      />
                      Connect with WalletConnect
                    </>
                  )}
                </motion.button>
    
                {connectedAccount && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-cyan-400 mt-4"
                  >
                    Connected: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
                  </motion.div>
                )}
              </div>
            ) : (
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 text-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="name@company.com"
                  />
                </div>
    
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-700 text-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
    
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <UserPlus className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
    
            <div className="mt-8 text-center text-sm text-gray-400">
              By continuing, you agree to our{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-cyan-400 hover:text-cyan-300">
                Privacy Policy
              </a>
            </div>
    
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
              <span>Already have an account?</span>
              <button 
                onClick={() => router.push('/login')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      );

}


export default AuthPage;