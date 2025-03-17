import { PinataSDK } from 'pinata';
import { TokenMetadata } from '@/app/lib/services/tokenService';

// Initialize the Pinata SDK with environment variables
const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || ''
});

/**
 * Upload metadata to IPFS using Pinata SDK
 * @param metadata The metadata to upload
 * @returns The IPFS hash (CID) of the uploaded content
 */
export async function uploadToIPFS(metadata: TokenMetadata): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
      console.warn('IPFS pinning service credentials not found, returning mock hash');
      return `Qm${Math.random().toString(36).substring(2, 15)}`;
    }
    
    // Convert metadata to JSON string then create a Blob (similar to a File)
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    
    // The Blob needs to be converted to a File object
    const metadataFile = new File(
      [metadataBlob], 
      `SonicClout-Content-${Date.now()}.json`, 
      { type: 'application/json' }
    );
    
    // Upload the file using Pinata SDK
    const { cid } = await pinata.upload.public.file(metadataFile);
    
    return cid;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload content to IPFS');
  }
}

/**
 * Get content from IPFS using Pinata gateway
 * @param hash The IPFS hash (CID) to retrieve
 * @returns The content from IPFS
 */
export async function getFromIPFS(hash: string) {
  try {
    // Convert the CID to a gateway URL
    const url = await pinata.gateways.public.convert(hash);
    
    // Fetch the content from the gateway
    const response = await fetch(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
} 