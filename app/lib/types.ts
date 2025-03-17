import { PublicKey } from '@solana/web3.js';

// Token Types
export interface TokenMetadata {
  type: 'post' | 'clip' | 'profile';
  content: string;
  contentUrl?: string;
  creator: string;
}

export interface TokenDetails {
  mintAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  contentType: string;
  contentHash: string;
  creator: string;
  creationTime: Date;
}

// Vesting Types
export interface MilestoneConfig {
  threshold: number; // e.g., 1000 followers, 50000 views
  unlockPercentage: number; // in basis points (1/100 of a percent) - 10000 = 100%
}

export interface VestingSchedule {
  id: number;
  creator: string;
  tokenMintAddress: string;
  totalAmount: string;
  unlockedAmount: string;
  oracleAddress: string;
  metricType: string;
  active: boolean;
  milestones: {
    thresholds: number[];
    unlockPercentages: number[];
    reached: boolean[];
  };
}

// Bond Types
export interface SonicBond {
  id: string;
  name: string;
  description: string;
  creator: string;
  category: 'game' | 'social' | 'content';
  metric: string;
  currentValue: number;
  totalSupply: number;
  price: number;
  priceChange24h: number;
  marketCap: number;
}

// Trade Types
export interface TradeInput {
  tokenMintAddress: string;
  amount: string;
  price: string;
  tradeType: 'buy' | 'sell';
}

export interface TradeOutput {
  signature: string;
  tokenMintAddress: string;
  amount: string;
  price: string;
  totalCost: string;
  tradeType: 'buy' | 'sell';
  timestamp: Date;
}

// Solana Oracle Types
export interface OracleFeed {
  publicKey: string;
  name: string;
  description: string;
  metricType: string;
  lastUpdated: Date;
  currentValue: number;
} 