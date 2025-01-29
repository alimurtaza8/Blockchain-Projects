"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { checkForDuplicate} from "@/sanity/lib/client";
import {createEquipmentListing} from "@/sanity/lib/client";
// import { client } from "@/sanity/lib/client"; // Make sure this import exists
import {urlFor} from "@/sanity/lib/image";
import {uploadImageToSanity} from "@/sanity/lib/client";
// import {ethers} from 'ethers';
import { Plus, AlertCircle, CheckCircle, Loader} from 'lucide-react';
import RentalAgreementABI from '@/abis/RentalAgreement.json';
import EquipmentNFTABI from '@/abis/EquipmentNFT.json';


const RENTAL_CONTRACT_ADDRESS = "0xF70CB025c530463370EE1173231d1554fC897901";
const NFT_CONTRACT_ADDRESS = "0xB6bE67aB0a647Df76C4e728F7657ae2a49295bDb";

interface Equipment {
  tokenId: number;
  name: string;
  imageUri: string;
  rentalPrice: string;
  deposit: string;
  isListed: boolean;
  isRented: boolean;
  isPending?: boolean;
  rentalDetails?: RentalAgreement;
}

interface RentalAgreement {
  renter: string;
  startTime: number;
  duration: number;
  depositAmount: string;
  isActive: boolean;
  timeRemaining: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [optimisticEquipment, setOptimisticEquipment] = useState<Equipment[]>([]);
  const [displayEquipments, setDisplayEquipments] = useState<Equipment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setPendingTransactions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const fileInputRef = useRef(null);
  // const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // const [previewImage, setPreviewImage] = useState(null);
  // const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    description: '',
    imageUri: '',
    dailyPrice: '',
    deposit: ''
  });
 

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          
          setProvider(provider);
          setSigner(signer);
          setWalletAddress(address);
          localStorage.setItem('connectedAddress', address);
          
          await loadEquipment();
        } catch (error) {
          console.error("Wallet connection error:", error);
          router.push('/');
        }
      } else {
        router.push('/');
      }
    };
    
    init();
  }, [router]);

  useEffect(() => {
    // Combine real and optimistic equipments for display
    const combined = [
      ...equipments,
      ...optimisticEquipment.filter(opt => 
        !equipments.some(eq => eq.tokenId === opt.tokenId)
      )
    ].sort((a, b) => b.tokenId - a.tokenId);
    
    setDisplayEquipments(combined);
  }, [equipments, optimisticEquipment]);


  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // const uploadImageToSanity = async (file: File) => {
  //   if (!file) return null;

  //   try {
  //     // Create a new FormData instance
  //     const formData = new FormData();
  //     formData.append('file', file);

  //     // Upload file to Sanity
  //     const response = await client.assets.upload('image', file, {
  //       filename: file.name
  //     });

  //     // Return the asset reference
  //     return {
  //       _type: 'image',
  //       asset: {
  //         _type: "reference",
  //         _ref: response._id
  //       }
  //     };
  //   } catch (error) {
  //     console.error('Error uploading image:', error);
  //     throw new Error('Failed to upload image to Sanity');
  //   }
  // };


  const loadEquipment = async () => {
    if (!provider || !signer || !walletAddress) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        EquipmentNFTABI.abi,
        signer
      );
  
      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT_ADDRESS,
        RentalAgreementABI.abi,
        signer
      );
  
      // Get total minted tokens
      const totalSupply = Number(await nftContract.getTotalSupply());
      const tokens: bigint[] = [];
  
      // Fetch all tokens owned by the user
      for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
        try {
          const owner = await nftContract.ownerOf(tokenId);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            tokens.push(BigInt(tokenId));
          }
        } catch (error) {
          console.error(`Token ${tokenId} not found or error:`, error);
        }
      }

      
        interface NFTData {
          name: string;
          imageUri: string;
          // Add other fields from your contract as needed
        }
      
  
      // Process equipment data
      const equipmentData = await Promise.all(
        tokens.map(async (tokenIdBigInt) => {
          const tokenId = Number(tokenIdBigInt);
          try {
            const nftData = await nftContract.getEquipment(tokenId) as NFTData;
            
            const [rentalPrice, deposit, isListed, isRented] = 
              await rentalContract.getEquipmentDetails(tokenId)
                .catch(() => [0, 0, false, false]);
  
            const rentalDetails = isRented ? 
              await rentalContract.getRentalDetails(tokenId).catch(() => null) : 
              null;
  
          //   return {
          //     tokenId,
          //     name: nftData.name,
          //     imageUri: nftData.imageUri,
          //     rentalPrice: ethers.formatEther(rentalPrice),
          //     deposit: ethers.formatEther(deposit),
          //     isListed: isListed === true,
          //     isRented: isRented === true,
          //     rentalDetails: rentalDetails ? {
          //       renter: rentalDetails.renter,
          //       startTime: Number(rentalDetails.startTime),
          //       duration: Number(rentalDetails.duration),
          //       depositAmount: ethers.formatEther(rentalDetails.depositAmount),
          //       isActive: rentalDetails.isActive,
          //       timeRemaining: Number(rentalDetails.timeRemaining)
          //     } : undefined
          //   };
          // } catch (error) {
          //   console.error(`Error processing token ${tokenId}:`, error);
          //   return null;
          return {
            tokenId,
            name: nftData.name, // Now properly typed as string
            imageUri: nftData.imageUri, // Now properly typed as string
            rentalPrice: ethers.formatEther(rentalPrice),
            deposit: ethers.formatEther(deposit),
            isListed: isListed === true,
            isRented: isRented === true,
            rentalDetails: rentalDetails ? {
              renter: rentalDetails.renter,
              startTime: Number(rentalDetails.startTime),
              duration: Number(rentalDetails.duration),
              depositAmount: ethers.formatEther(rentalDetails.depositAmount),
              isActive: rentalDetails.isActive,
              timeRemaining: Number(rentalDetails.timeRemaining)
            } : undefined
          } as Equipment; // Explicit cast here
        } catch (error) {
          console.error("Error processing token", tokenId, ":", error);
          return null;
          }
        })
      );
  
      // Filter out null entries and sort by newest first
      // setEquipments(equipmentData
      //   .filter((e): e is Equipment => e !== null)
      //   .sort((a, b) => b.tokenId - a.tokenId)
      // );

      setEquipments(equipmentData
        .filter((e): e is Equipment => e !== null)
        .sort((a, b) => b.tokenId - a.tokenId) as Equipment[]
      );
  
  
    } catch (error) {
      console.error("Error loading equipment:", error);
      setError("Failed to load equipment data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // correct code but without sanity
  // const mintAndListEquipment = async () => {
  //   if (!signer) return;

  //   setLoading(true);
  //   setError(null);
  //   setSuccess(null);

  //   // Create optimistic equipment object
  //   const tempId = Date.now();
  //   const optimisticItem: Equipment = {
  //     tokenId: tempId,
  //     name: newEquipment.name,
  //     imageUri: newEquipment.imageUri,
  //     rentalPrice: newEquipment.dailyPrice,
  //     deposit: newEquipment.deposit,
  //     isListed: true,
  //     isRented: false,
  //     isPending: true
  //   };

  //   // Add to optimistic display immediately
  //   setOptimisticEquipment(prev => [...prev, optimisticItem]);
  //   setShowAddModal(false);

  //   try {
  //     const nftContract = new ethers.Contract(
  //       NFT_CONTRACT_ADDRESS,
  //       EquipmentNFTABI.abi,
  //       signer
  //     );

  //     const rentalContract = new ethers.Contract(
  //       RENTAL_CONTRACT_ADDRESS,
  //       RentalAgreementABI.abi,
  //       signer
  //     );

  //     // Mint NFT
  //     const mintTx = await nftContract.mintEquipment(
  //       newEquipment.name,
  //       newEquipment.description,
  //       newEquipment.imageUri
  //     );
      
  //     setPendingTransactions(prev => new Set(prev).add(mintTx.hash));
  //     const mintReceipt = await mintTx.wait();
      
  //     const transferEvent = mintReceipt.logs.find(
  //       (log: any) => log.fragment && log.fragment.name === 'Transfer'
  //     );
  //     const tokenId = transferEvent?.args[2];

  //     // Approve rental contract
  //     const approveTx = await nftContract.approve(RENTAL_CONTRACT_ADDRESS, tokenId);
  //     await approveTx.wait();

  //     // List for rental
  //     const dailyPriceWei = ethers.parseEther(newEquipment.dailyPrice);
  //     const depositWei = ethers.parseEther(newEquipment.deposit);
      
  //     const listTx = await rentalContract.listEquipments(
  //       tokenId,
  //       dailyPriceWei,
  //       depositWei
  //     );
  //     await listTx.wait();

  //     // Remove optimistic item and update real data
  //     setOptimisticEquipment(prev => 
  //       prev.filter(item => item.tokenId !== tempId)
  //     );
      
  //     // Wait for a few blocks for data consistency
  //     await new Promise(resolve => setTimeout(resolve, 5000));
  //     await loadEquipment();
      
  //     setSuccess("Equipment listed successfully!");
      
  //   } catch (error: any) {
  //     console.error("Transaction error:", error);
  //     // Remove failed optimistic update
  //     setOptimisticEquipment(prev => 
  //       prev.filter(item => item.tokenId !== tempId)
  //     );
  //     setError(error.reason || "Failed to list equipment.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

// code with sanity

// const mintAndListEquipment = async () => {
//   if (!signer) return;

//   setLoading(true);
//   setError(null);
//   setSuccess(null);

//   // Create optimistic equipment object
//   const tempId = Date.now();
//   const optimisticItem: Equipment = {
//     tokenId: tempId,
//     name: newEquipment.name,
//     imageUri: newEquipment.imageUri,
//     rentalPrice: newEquipment.dailyPrice,
//     deposit: newEquipment.deposit,
//     isListed: true,
//     isRented: false,
//     isPending: true
//   };

//   // Add to optimistic display immediately
//   setOptimisticEquipment(prev => [...prev, optimisticItem]);
//   setShowAddModal(false);

//   try {
//     const nftContract = new ethers.Contract(
//       NFT_CONTRACT_ADDRESS,
//       EquipmentNFTABI.abi,
//       signer
//     );

//     const rentalContract = new ethers.Contract(
//       RENTAL_CONTRACT_ADDRESS,
//       RentalAgreementABI.abi,
//       signer
//     );

//     // Mint NFT
//     const mintTx = await nftContract.mintEquipment(
//       newEquipment.name,
//       newEquipment.description,
//       newEquipment.imageUri
//     );
    
//     setPendingTransactions(prev => new Set(prev).add(mintTx.hash));
//     const mintReceipt = await mintTx.wait();
    
//     const transferEvent = mintReceipt.logs.find(
//       (log: any) => log.fragment && log.fragment.name === 'Transfer'
//     );
//     const tokenId = transferEvent?.args[2];

//     // Approve rental contract
//     const approveTx = await nftContract.approve(RENTAL_CONTRACT_ADDRESS, tokenId);
//     await approveTx.wait();

//     // List for rental
//     const dailyPriceWei = ethers.parseEther(newEquipment.dailyPrice);
//     const depositWei = ethers.parseEther(newEquipment.deposit);
    
//     const listTx = await rentalContract.listEquipments(
//       tokenId,
//       dailyPriceWei,
//       depositWei
//     );
//     await listTx.wait();

//     // Save to Sanity
//     const equipmentData = {
//       name: newEquipment.name,
//       description: newEquipment.description,
//       dailyRate: parseFloat(newEquipment.dailyPrice),
//       securityDeposit: parseFloat(newEquipment.deposit),
//       nftAddress: NFT_CONTRACT_ADDRESS,
//       tokenId: tokenId.toString(),
//       images: [{ _type: 'image', asset: { _ref: newEquipment.imageUri } }],
//     };

//     // Check for duplicates
//     const duplicate = await checkForDuplicate(NFT_CONTRACT_ADDRESS, tokenId.toString());
//     if (duplicate) {
//       throw new Error('This product already exists in Sanity.');
//     }

//     // Save to Sanity
//     await createEquipmentListing(equipmentData);

//     // Remove optimistic item and update real data
//     setOptimisticEquipment(prev => 
//       prev.filter(item => item.tokenId !== tempId)
//     );
    
//     // Wait for a few blocks for data consistency
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     await loadEquipment();
    
//     setSuccess("Equipment listed successfully!");
    
//   } catch (error: any) {
//     console.error("Transaction error:", error);
//     // Remove failed optimistic update
//     setOptimisticEquipment(prev => 
//       prev.filter(item => item.tokenId !== tempId)
//     );
//     setError(error.reason || error.message || "Failed to list equipment.");
//   } finally {
//     setLoading(false);
//   }
// };


// const mintAndListEquipment = async () => {
//   if (!signer || !imageFile) return;

//   setLoading(true);
//   setError(null);
//   setSuccess(null);

//   try {
//     // First upload image to Sanity
//     const imageAsset = await uploadImageToSanity(imageFile);
//     if (!imageAsset) {
//       throw new Error('Failed to upload image');
//     }

//     // Create optimistic equipment object
//     const tempId = Date.now();
//     const optimisticItem: Equipment = {
//       tokenId: tempId,
//       name: newEquipment.name,
//       imageUri: previewUrl || '', // Use preview URL for optimistic UI
//       rentalPrice: newEquipment.dailyPrice,
//       deposit: newEquipment.deposit,
//       isListed: true,
//       isRented: false,
//       isPending: true
//     };

//     // Add to optimistic display
//     setOptimisticEquipment(prev => [...prev, optimisticItem]);
//     setShowAddModal(false);

//     // Continue with NFT minting and listing
//     const nftContract = new ethers.Contract(
//       NFT_CONTRACT_ADDRESS,
//       EquipmentNFTABI.abi,
//       signer
//     );

//     const rentalContract = new ethers.Contract(
//       RENTAL_CONTRACT_ADDRESS,
//       RentalAgreementABI.abi,
//       signer
//     );

//     // Use the Sanity CDN URL for the NFT metadata
//     const imageUrl = client.image(imageAsset.asset._ref).url();

//     // Mint NFT with the Sanity image URL
//     const mintTx = await nftContract.mintEquipment(
//       newEquipment.name,
//       newEquipment.description,
//       imageUrl
//     );
    
//     setPendingTransactions(prev => new Set(prev).add(mintTx.hash));
//     const mintReceipt = await mintTx.wait();
    
//     const transferEvent = mintReceipt.logs.find(
//       (log: any) => log.fragment && log.fragment.name === 'Transfer'
//     );
//     const tokenId = transferEvent?.args[2];

//     // Approve and list for rental
//     const approveTx = await nftContract.approve(RENTAL_CONTRACT_ADDRESS, tokenId);
//     await approveTx.wait();

//     const dailyPriceWei = ethers.parseEther(newEquipment.dailyPrice);
//     const depositWei = ethers.parseEther(newEquipment.deposit);
    
//     const listTx = await rentalContract.listEquipments(
//       tokenId,
//       dailyPriceWei,
//       depositWei
//     );
//     await listTx.wait();

//     // Save to Sanity with the uploaded image
//     const equipmentData = {
//       name: newEquipment.name,
//       description: newEquipment.description,
//       dailyRate: parseFloat(newEquipment.dailyPrice),
//       securityDeposit: parseFloat(newEquipment.deposit),
//       nftAddress: NFT_CONTRACT_ADDRESS,
//       tokenId: tokenId.toString(),
//       images: [imageAsset]
//     };

//     // Check for duplicates
//     const duplicate = await checkForDuplicate(NFT_CONTRACT_ADDRESS, tokenId.toString());
//     if (duplicate) {
//       throw new Error('This product already exists in Sanity.');
//     }

//     // Save to Sanity
//     await createEquipmentListing(equipmentData);

//     // Cleanup
//     setOptimisticEquipment(prev => prev.filter(item => item.tokenId !== tempId));
//     await loadEquipment();
//     setSuccess("Equipment listed successfully!");
    
//   } catch (error: any) {
//     console.error("Transaction error:", error);
//     setOptimisticEquipment(prev => prev.filter(item => item.tokenId !== tempId));
//     setError(error.reason || error.message || "Failed to list equipment.");
//   } finally {
//     setLoading(false);
//     // Clean up preview URL
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
//     setImageFile(null);
//     setPreviewUrl(null);
//   }
// };

// Modified mintAndListEquipment function - replace the existing one in your dashboard
const mintAndListEquipment = async () => {
  if (!signer || !imageFile) {
    setError("Please select an image file");
    return;
  }

  setLoading(true);
  setError(null);
  setSuccess(null);

  const tempId = Date.now();

  try {
    // First upload image to Sanity
    const imageAsset = await uploadImageToSanity(imageFile);
    if (!imageAsset) {
      throw new Error('Failed to upload image');
    }

    // Create optimistic equipment object
    
    const optimisticItem: Equipment = {
      tokenId: tempId,
      name: newEquipment.name,
      imageUri: previewUrl || '',
      rentalPrice: newEquipment.dailyPrice,
      deposit: newEquipment.deposit,
      isListed: true,
      isRented: false,
      isPending: true
    };

    // Add to optimistic display
    setOptimisticEquipment(prev => [...prev, optimisticItem]);
    setShowAddModal(false);

    // Create NFT contract instance
    const nftContract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      EquipmentNFTABI.abi,
      signer
    );

    const rentalContract = new ethers.Contract(
      RENTAL_CONTRACT_ADDRESS,
      RentalAgreementABI.abi,
      signer
    );

    // Get the Sanity image URL
    const imageUrl = urlFor(imageAsset).url();

    // Mint NFT
    const mintTx = await nftContract.mintEquipment(
      newEquipment.name,
      newEquipment.description,
      imageUrl
    );
    
    setPendingTransactions(prev => new Set(prev).add(mintTx.hash));
    const mintReceipt = await mintTx.wait();

    // const transferEventInterface = nftContract.interface.getEvent('Transfer');
    
    // const transferEvent = mintReceipt.logs.find(
    //   (log: ethers.Log | ethers.LogDescription) => log.fragment?.name === 'Transfer'
    // );

    // const transferEvent = mintReceipt.logs.find(log => {
    //   try {
    //     const parsed = nftContract.interface.parseLog({
    //       topics: log.topics,
    //       data: log.data
    //     });
    //     return parsed.name === 'Transfer';
    //   } catch {
    //     return false;
    //   }
    // });

    // const transferLog = mintReceipt.logs.find(log => {
    //   try {
    //     const parsed = nftContract.interface.parseLog(log);
    //     return parsed?.name === 'Transfer';
    //   } catch {
    //     return false;
    //   }
    // });

    const transferLog = mintReceipt.logs.find((log: ethers.Log) => {
      try {
        const parsed = nftContract.interface.parseLog(log);
        return parsed?.name === 'Transfer';
      } catch {
        return false;
      }
    });
    
    // const tokenId = transferLog ? nftContract.interface.parseLog(transferLog).args[2] : undefined;
  //   const tokenId = transferLog 
  // ? (nftContract.interface.parseLog(transferLog)?.args as any[])?.[2] 
  // : undefined;

  const parsedLog = transferLog ? nftContract.interface.parseLog(transferLog) : null;
  const tokenId = parsedLog?.args instanceof Array ? parsedLog.args[2]?.toString() : undefined;
    
    // const tokenId = transferEvent?.args[2];
  

    // Approve rental contract
    const approveTx = await nftContract.approve(RENTAL_CONTRACT_ADDRESS, tokenId);
    await approveTx.wait();

    // List for rental
    const dailyPriceWei = ethers.parseEther(newEquipment.dailyPrice);
    const depositWei = ethers.parseEther(newEquipment.deposit);
    
    const listTx = await rentalContract.listEquipments(
      tokenId,
      dailyPriceWei,
      depositWei
    );
    await listTx.wait();

    // Prepare Sanity document data
    const equipmentData = {
      name: newEquipment.name,
      description: newEquipment.description,
      dailyRate: parseFloat(newEquipment.dailyPrice),
      securityDeposit: parseFloat(newEquipment.deposit),
      nftAddress: NFT_CONTRACT_ADDRESS,
      tokenId: tokenId.toString(),
      images: [imageAsset],
      category: 'Other', // You can add a category selector to your form if needed
      blockchainData: {
        nftAddress: NFT_CONTRACT_ADDRESS,
        tokenId: tokenId.toString(),
        rentalContract: RENTAL_CONTRACT_ADDRESS
      }
    };

    // Check for duplicates
    const duplicate = await checkForDuplicate(NFT_CONTRACT_ADDRESS, tokenId.toString());
    if (duplicate) {
      throw new Error('This product already exists in Sanity.');
    }

    // Save to Sanity
    await createEquipmentListing(equipmentData);

    // Cleanup and refresh
    setOptimisticEquipment(prev => prev.filter(item => item.tokenId !== tempId));
    await loadEquipment();
    setSuccess("Equipment listed successfully!");
    
  } catch (error) {
    console.error("Transaction error:", error);
    setOptimisticEquipment(prev => prev.filter(item => item.tokenId !== tempId));
    setError("Failed to list equipment.");
  } finally {
    setLoading(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImageFile(null);
    setPreviewUrl(null);
  }
};

  const endRentalAgreement = async (tokenId: number) => {
    if (!signer) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT_ADDRESS,
        RentalAgreementABI.abi,
        signer
      );

      const tx = await rentalContract.endRentAgreement(tokenId);
      await tx.wait();

      setSuccess("Rental agreement ended successfully!");
      await loadEquipment();
    } catch (error) {
      console.error("Error ending rental:", error);
      setError("Failed to end rental agreement.");
    } finally {
      setLoading(false);
    }
  };

  const claimDeposit = async (tokenId: number) => {
    if (!signer) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT_ADDRESS,
        RentalAgreementABI.abi,
        signer
      );

      const tx = await rentalContract.claimDeposit(tokenId);
      await tx.wait();

      setSuccess("Deposit claimed successfully!");
      await loadEquipment();
    } catch (error) {
      console.error("Error claiming deposit:", error);
      setError("Failed to claim deposit.");
    } finally {
      setLoading(false);
    }
  };


  // withdraw functions needs to complete
  // const withdrawFunds = async () => {
  //   if (!signer) return;

  //   setLoading(true);
  //   setError(null);
  //   setSuccess(null);

  //   try {
  //     const rentalContract = new ethers.Contract(
  //       RENTAL_CONTRACT_ADDRESS,
  //       RentalAgreementABI.abi,
  //       signer
  //     );
      

  //     const tx = await rentalContract.withdraw();
  //     await tx.wait();

  //     setSuccess("Funds withdrawn successfully!");
  //   } catch (error) {
  //     console.error("Error withdrawing funds:", error);
  //     setError("Failed to withdraw funds.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const withdrawFunds = async () => {
    if (!signer) return;
  
    setLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const rentalContract = new ethers.Contract(
        RENTAL_CONTRACT_ADDRESS,
        RentalAgreementABI.abi,
        signer
      );
  
      // Get the current connected address
      const currentAddress = await signer.getAddress();
      
      // Get the contract owner
      const owner = await rentalContract.getOwner();
  
      // Check if the current user is the owner
      if (currentAddress.toLowerCase() !== owner.toLowerCase()) {
        setError("Only the contract owner can withdraw funds.");
        return;
      }
  
      const tx = await rentalContract.withdraw();
      await tx.wait();
  
      setSuccess("Funds withdrawn successfully!");
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setError("Failed to withdraw funds.");
    } finally {
      setLoading(false);
    }
  };

  // const handleDisconnect = () => {
  //   localStorage.removeItem('connectedAddress');
  //   router.push('/');
  // };

  // for image Handling From Computer


  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const EquipmentCard = ({ equipment }: { equipment: Equipment  }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border ${
      equipment.isPending ? 'border-yellow-200 animate-pulse' : 'border-gray-200'
    }`}>
      {equipment.isPending && (
        <div className="mb-2 text-sm text-yellow-600 flex items-center gap-1">
          <Loader className="animate-spin w-4 h-4" />
          <span>Transaction pending...</span>
        </div>
      )}
      <img 
        src={equipment.imageUri} 
        alt={equipment.name}
        className="w-full h-48 object-cover mb-4 rounded"
      />
      <h4 className="text-lg font-semibold mb-2">{equipment.name}</h4>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Daily Price:</span>
          <span className="font-medium">{equipment.rentalPrice} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Deposit:</span>
          <span className="font-medium">{equipment.deposit} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            equipment.isRented ? 'bg-red-100 text-red-700' : 
            equipment.isListed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {equipment.isRented ? 'Rented' : equipment.isListed ? 'Listed' : 'Not Listed'}
          </span>
        </div>
        {equipment.rentalDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold mb-2">Rental Details</h5>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Renter:</span>
                <span className="font-medium">{formatAddress(equipment.rentalDetails.renter)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Time:</span>
                <span className="font-medium">
                  {new Date(equipment.rentalDetails.startTime * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{equipment.rentalDetails.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Remaining:</span>
                <span className="font-medium">
                {Math.max(0, Math.floor(equipment.rentalDetails.timeRemaining / (24 * 60 * 60)))} days
                </span>
              </div>
              {equipment.rentalDetails.isActive && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => endRentalAgreement(equipment.tokenId)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    End Rental
                  </button>
                  <button
                    onClick={() => claimDeposit(equipment.tokenId)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Claim Deposit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-16 min-h-screen bg-gray-50">
       {/* Header  */}
       

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md"
            >
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdraw Amount  Button */}
        <div className="mb-6">
          <button
            // onClick={() => setShowAddModal(true)}
            onClick={withdrawFunds}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-red-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Withdraw
          </button>
        </div>

                {/* Add Equipment Button */}
                <div className="mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Equipment
          </button>
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEquipments.map((equipment) => (
              <EquipmentCard key={equipment.tokenId} equipment={equipment} />
            ))}
          </div>
        )}
      </main>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-lg font-medium mb-4">Add New Equipment</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                mintAndListEquipment();
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newEquipment.description}
                      onChange={(e) => setNewEquipment(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={newEquipment.imageUri}
                      onChange={(e) => setNewEquipment(prev => ({
                        ...prev,
                        imageUri: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div> */}

<div>
      <label className="block text-sm font-medium text-gray-700">Equipment Image</label>
      <div className="mt-1 flex items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          required
        />
      </div>
      {previewUrl && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-md"
          />
        </div>
      )}
    </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Daily Price (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newEquipment.dailyPrice}
                      onChange={(e) => setNewEquipment(prev => ({
                        ...prev,
                        dailyPrice: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deposit (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newEquipment.deposit}
                      onChange={(e) => setNewEquipment(prev => ({
                        ...prev,
                        deposit: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Equipment
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
                
               