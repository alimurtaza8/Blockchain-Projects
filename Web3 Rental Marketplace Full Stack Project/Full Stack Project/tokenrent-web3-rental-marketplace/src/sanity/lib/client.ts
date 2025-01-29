
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Define interfaces for the data structures
// interface EquipmentData {
//   name: string;
//   category?: string;
//   nftAddress: string;
//   tokenId: string;
//   rentalContract?: string;
//   [key: string]: unknown; // For additional properties
// }

interface EquipmentData {
  name: string;
  description: string;
  dailyRate: number;
  securityDeposit: number;
  images: SanityImage[];
  category: string;
  nftAddress: string;
  tokenId: string;
  rentalContract?: string;
}

export interface SanityImage {
  _type: 'image';
  asset: {
    _type: 'reference';
    _ref: string;
  };
}

// interface SanitySlug {
//   _type: 'slug';
//   current: string;
// }

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-08-01',
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  useCdn: false,
})

export async function uploadImageToSanity(file: File): Promise<SanityImage> {
  return client.assets
    .upload('image', file, {
      filename: file.name,
    })
    .then(imageAsset => {
      return {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id
        }
      }
    })
}

export async function checkForDuplicate(nftAddress: string, tokenId: string) {
  const query = `*[_type == "equipment" && nftAddress == $nftAddress && tokenId == $tokenId][0]`;
  const params = { nftAddress, tokenId };
  return client.fetch(query, params);
}

// export async function createEquipmentListing(data: EquipmentData) {
//   const slug: SanitySlug = {
//     _type: 'slug',
//     current: data.name.toLowerCase().replace(/\s+/g, '-')
//   };

//   return client.create({
//     _type: 'equipment',
//     slug,
//     category: data.category || 'Other',
//     blockchainData: {
//       nftAddress: data.nftAddress,
//       tokenId: data.tokenId,
//       rentalContract: data.rentalContract || null
//     },
//     ...data,
//   });
// }

export async function createEquipmentListing(data: EquipmentData) {
  return client.create({
    _type: 'equipment',
    slug: {
      _type: 'slug',
      current: data.name.toLowerCase().replace(/\s+/g, '-')
    },
    ...data,
    category: data.category || 'Other',
    blockchainData: {
      nftAddress: data.nftAddress,
      tokenId: data.tokenId,
      rentalContract: data.rentalContract || null
    }
  });
}


const builder = imageUrlBuilder(client);

// interface SanityImageSource {
//   asset?: {
//     _ref: string;
//   };
//   [key: string]: unknown;
// }

export function urlFor(source: SanityImage) {
  return builder.image(source);
}