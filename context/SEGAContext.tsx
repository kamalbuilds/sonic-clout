"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';

export interface Pool {
  id: string;
  token0: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
  token1: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  };
  fee: number;
  liquidity: number;
  volume24h: number;
  apr: number;
}

export interface SEGAContextType {
  isLoading: boolean;
  pools: Pool[];
  userLiquidity: { poolId: string; amount: number }[];
  createPool: (tokenA: string, tokenB: string, fee: number) => Promise<string>;
  addLiquidity: (poolId: string, amountA: number, amountB: number) => Promise<boolean>;
  removeLiquidity: (poolId: string, percentage: number) => Promise<boolean>;
  swap: (tokenIn: string, tokenOut: string, amountIn: number, slippage: number) => Promise<boolean>;
  fetchPools: () => Promise<void>;
  fetchUserLiquidity: () => Promise<void>;
}

// SEGA contract addresses on Sonic SVM
const SEGA_ADDRESSES = {
  SWAP: 'SegazTQwbYWknDZkJ6j2Kgvm5gw3MrHGKtWstZdoNKZ',
  ADMIN: 'Ajk8d9bERSaFdeoT1d8JUVfaDayrYLnAdgeB47TFMUaG',
  CREATE_POOL_RECEIVER: '2HbjxVVKJ7Ct72Rcd8WK4VTqmwTXL5aAggkH1CHGFGmh'
};

const SEGAContext = createContext<SEGAContextType | null>(null);

export const useSEGA = () => {
  const context = useContext(SEGAContext);
  if (!context) {
    throw new Error('useSEGA must be used within a SEGAProvider');
  }
  return context;
};

export const SEGAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [userLiquidity, setUserLiquidity] = useState<{ poolId: string; amount: number }[]>([]);

  // Mock data for development
  const mockPools: Pool[] = [
    {
      id: '1',
      token0: {
        address: '8zEuKWfxCmcVKEuZfVw4ggkv7AXHt9NhUn5kKyVgNQ7r',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      token1: {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Wrapped SOL',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      },
      fee: 0.0025,
      liquidity: 12500000,
      volume24h: 450000,
      apr: 21.5
    },
    {
      id: '2',
      token0: {
        address: '8zEuKWfxCmcVKEuZfVw4ggkv7AXHt9NhUn5kKyVgNQ7r',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      token1: {
        address: 'SEGAQghPD3hzNGjJ7WGmJwyKEbMx9BU9yqVNZxeKz7Z',
        symbol: 'SEGA',
        name: 'SEGA Token',
        decimals: 9,
        logoURI: '/sega-logo.png'
      },
      fee: 0.0025,
      liquidity: 5800000,
      volume24h: 320000,
      apr: 35.2
    }
  ];

  useEffect(() => {
    // Load initial data when wallet connects
    if (wallet.connected) {
      fetchPools();
      fetchUserLiquidity();
    }
  }, [wallet.connected]);

  // In a real implementation, these would interact with the SEGA contract
  const fetchPools = async () => {
    try {
      setIsLoading(true);
      // In a production app, you would fetch real data from the SEGA contract
      // For now, we'll just use the mock data
      setPools(mockPools);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pools:', error);
      setIsLoading(false);
    }
  };

  const fetchUserLiquidity = async () => {
    try {
      setIsLoading(true);
      // Mock user liquidity data
      if (wallet.connected) {
        setUserLiquidity([
          { poolId: '1', amount: 1500 },
          { poolId: '2', amount: 750 }
        ]);
      } else {
        setUserLiquidity([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user liquidity:', error);
      setIsLoading(false);
    }
  };

  const createPool = async (tokenA: string, tokenB: string, fee: number) => {
    try {
      setIsLoading(true);
      // In a real app, you would call the SEGA contract to create a pool
      console.log(`Creating pool for ${tokenA} and ${tokenB} with fee ${fee}`);
      
      // Mock successful pool creation
      const newPoolId = `pool-${Date.now()}`;
      setIsLoading(false);
      return newPoolId;
    } catch (error) {
      console.error('Error creating pool:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const addLiquidity = async (poolId: string, amountA: number, amountB: number) => {
    try {
      setIsLoading(true);
      // In a real app, you would call the SEGA contract to add liquidity
      console.log(`Adding liquidity to pool ${poolId}: ${amountA} of token A and ${amountB} of token B`);
      
      // Mock successful liquidity addition
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error adding liquidity:', error);
      setIsLoading(false);
      return false;
    }
  };

  const removeLiquidity = async (poolId: string, percentage: number) => {
    try {
      setIsLoading(true);
      // In a real app, you would call the SEGA contract to remove liquidity
      console.log(`Removing ${percentage}% of liquidity from pool ${poolId}`);
      
      // Mock successful liquidity removal
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error removing liquidity:', error);
      setIsLoading(false);
      return false;
    }
  };

  const swap = async (tokenIn: string, tokenOut: string, amountIn: number, slippage: number) => {
    try {
      setIsLoading(true);
      // In a real app, you would call the SEGA contract to perform the swap
      console.log(`Swapping ${amountIn} of ${tokenIn} for ${tokenOut} with ${slippage}% slippage`);
      
      // Mock successful swap
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <SEGAContext.Provider
      value={{
        isLoading,
        pools,
        userLiquidity,
        createPool,
        addLiquidity,
        removeLiquidity,
        swap,
        fetchPools,
        fetchUserLiquidity
      }}
    >
      {children}
    </SEGAContext.Provider>
  );
};

export default SEGAProvider; 