import axios from 'axios';
import { TokenMetadata } from '@/app/lib/services/tokenService';

// Use a pinning service like Pinata for production
const IPFS_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';

export async function uploadToIPFS(metadata: TokenMetadata): Promise<string> {
  try {
    // For demo purposes, if no API keys, return mock hash
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.warn('IPFS pinning service credentials not found, returning mock hash');
      return `Qm${Math.random().toString(36).substring(2, 15)}`;
    }
    
    const response = await axios.post(
      IPFS_API_URL,
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `SonicClout-Content-${Date.now()}`
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY
        }
      }
    );
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload content to IPFS');
  }
}

export async function getFromIPFS(hash: string) {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
} 