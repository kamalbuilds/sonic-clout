// @ts-nocheck
import { ethers } from 'ethers';

// Use require instead of import for JSON file
const SPLTokenFactoryABI = require('../../../contracts/artifacts/contracts/SPLTokenFactory.sol/SPLTokenFactory.json');

const SPL_TOKEN_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SPL_TOKEN_FACTORY_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

export interface TokenMetadata {
  name: string;
  description: string;
  image?: string;
  properties: {
    type: string;
    content: string;
    creator: string;
  };
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  initialSupply: number;
  metadata: {
    type: string;
    content: string;
    creator: string;
  };
}

export async function createSPLToken(
  params: TokenCreationParams,
  signer: ethers.Signer
): Promise<string> {
  try {
    const tokenFactory = new ethers.Contract(SPL_TOKEN_FACTORY_ADDRESS, SPLTokenFactoryABI.abi, signer);
    
    // Calculate mint fee (0.5 SONIC)
    const mintFee = ethers.parseEther("0.5");
    
    // Create token
    const tx = await tokenFactory.createToken(
      params.name,
      params.symbol,
      params.initialSupply,
      params.metadata.type,
      params.metadata.content,
      { value: mintFee }
    );
    
    const receipt = await tx.wait();
    
    // Extract token address from event logs
    const event = receipt?.logs?.find(
      (log) => log?.topics?.[0] === ethers.id(tokenFactory.interface.getEvent('TokenCreated').format())
    );
    
    if (event) {
      const parsedLog = tokenFactory.interface.parseLog({
        topics: event.topics,
        data: event.data
      });
      return parsedLog?.args?.[1] || '';
    }
    
    throw new Error('Token creation event not found');
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
} 