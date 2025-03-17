"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';

// Define API response types
export interface SwapResponse {
  id: string;
  success: boolean;
  data: {
    swapType: string;
    inputMint: string;
    inputAmount: string;
    outputMint: string;
    outputAmount: string;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: number;
    routePlan: Array<{
      poolId: string;
      inputMint: string;
      outputMint: string;
      feeMint: string;
      feeRate: number;
      feeAmount: string;
      remainingAccounts: string[];
    }>;
  };
}

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface Pool {
  id: string;
  token0: Token;
  token1: Token;
  fee: number;
  liquidity: number;
  volume24h: number;
  apr: number;
}

interface UserLiquidity {
  poolId: string;
  amount: number;
}

interface SEGAContextType {
  pools: Pool[];
  userLiquidity: UserLiquidity[];
  tokenList: Token[];
  fetchPools: () => Promise<void>;
  fetchUserLiquidity: () => Promise<void>;
  addLiquidity: (poolId: string, amountA: number, amountB: number) => Promise<boolean>;
  removeLiquidity: (poolId: string, percentage: number) => Promise<boolean>;
  createPool: (tokenA: string, tokenB: string, fee: number) => Promise<boolean>;
  swap: (tokenIn: string, tokenOut: string, amountIn: string, slippage: number) => Promise<boolean>;
  getSwapQuote: (tokenIn: string, tokenOut: string, amountIn: string, slippage: number) => Promise<SwapResponse | null>;
  poolsLoading: boolean;
  userLiquidityLoading: boolean;
  swapLoading: boolean;
  error: string | null;
}

// Define API URLs
const API_BASE_URL = "https://api.sega.sonic";
const POOL_API_URL = `${API_BASE_URL}/pools`;
const TOKEN_API_URL = `${API_BASE_URL}/tokens`;
const USER_LIQUIDITY_API_URL = `${API_BASE_URL}/liquidity`;
const SWAP_QUOTE_URL = `${API_BASE_URL}/swap/compute`;
const SWAP_TRANSACTION_URL = `${API_BASE_URL}/swap/transaction`;

const SEGAContext = createContext<SEGAContextType | undefined>(undefined);

export const SEGAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [pools, setPools] = useState<Pool[]>([]);
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [userLiquidity, setUserLiquidity] = useState<UserLiquidity[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [userLiquidityLoading, setUserLiquidityLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tokens list
  const fetchTokenList = async () => {
    try {
      // This would be a real API call in production
      // const response = await fetch(TOKEN_API_URL);
      // const data = await response.json();
      // setTokenList(data.tokens);
      
      // For development, use mock data
      setTokenList([
        {
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          symbol: "USDC",
          name: "USD Coin",
          decimals: 6,
          logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
        },
        {
          address: "So11111111111111111111111111111111111111112",
          symbol: "SOL",
          name: "Wrapped SOL",
          decimals: 9,
          logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
        },
        {
          address: "SEGAxdYMj13HdiKvUjHtQh9Xy9YpvgJNZYSBqgQxrhz7",
          symbol: "SEGA",
          name: "SEGA Token",
          decimals: 6,
          logoURI: "/sega-logo.svg"
        },
      ]);
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("Failed to fetch tokens.");
    }
  };

  // Fetch pools
  const fetchPools = async () => {
    setPoolsLoading(true);
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(POOL_API_URL);
      // const data = await response.json();
      // setPools(data.pools);
      
      // For development, use mock data
      setTimeout(() => {
        setPools([
          {
            id: "pool-1",
            token0: {
              address: "So11111111111111111111111111111111111111112",
              symbol: "SOL",
              name: "Wrapped SOL",
              decimals: 9,
              logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
            },
            token1: {
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              symbol: "USDC",
              name: "USD Coin",
              decimals: 6,
              logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
            },
            fee: 0.0025,
            liquidity: 2500000,
            volume24h: 750000,
            apr: 18.5
          },
          {
            id: "pool-2",
            token0: {
              address: "SEGAxdYMj13HdiKvUjHtQh9Xy9YpvgJNZYSBqgQxrhz7",
              symbol: "SEGA",
              name: "SEGA Token",
              decimals: 6,
              logoURI: "/sega-logo.svg"
            },
            token1: {
              address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              symbol: "USDC",
              name: "USD Coin",
              decimals: 6,
              logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"
            },
            fee: 0.0025,
            liquidity: 500000,
            volume24h: 150000,
            apr: 22.5
          }
        ]);
        setPoolsLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching pools:", err);
      setError("Failed to fetch pools.");
      setPoolsLoading(false);
    }
  };

  // Fetch user liquidity
  const fetchUserLiquidity = async () => {
    if (!connected || !publicKey) {
      setUserLiquidity([]);
      return;
    }
    
    setUserLiquidityLoading(true);
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(`${USER_LIQUIDITY_API_URL}/${publicKey.toString()}`);
      // const data = await response.json();
      // setUserLiquidity(data.liquidity);
      
      // For development, use mock data
      setTimeout(() => {
        setUserLiquidity([
          {
            poolId: "pool-1",
            amount: 5000
          }
        ]);
        setUserLiquidityLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching user liquidity:", err);
      setError("Failed to fetch your liquidity positions.");
      setUserLiquidityLoading(false);
    }
  };

  // Add liquidity
  const addLiquidity = async (poolId: string, amountA: number, amountB: number): Promise<boolean> => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet.");
      return false;
    }
    
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(`${USER_LIQUIDITY_API_URL}/add`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     walletAddress: publicKey.toString(),
      //     poolId,
      //     amountA,
      //     amountB
      //   })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      // For development, mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user liquidity after adding
      await fetchUserLiquidity();
      return true;
    } catch (err: any) {
      console.error("Error adding liquidity:", err);
      setError(err.message || "Failed to add liquidity.");
      return false;
    }
  };

  // Remove liquidity
  const removeLiquidity = async (poolId: string, percentage: number): Promise<boolean> => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet.");
      return false;
    }
    
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(`${USER_LIQUIDITY_API_URL}/remove`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     walletAddress: publicKey.toString(),
      //     poolId,
      //     percentage
      //   })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      // For development, mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user liquidity after removing
      await fetchUserLiquidity();
      return true;
    } catch (err: any) {
      console.error("Error removing liquidity:", err);
      setError(err.message || "Failed to remove liquidity.");
      return false;
    }
  };

  // Create pool
  const createPool = async (tokenA: string, tokenB: string, fee: number): Promise<boolean> => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet.");
      return false;
    }
    
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(POOL_API_URL, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     walletAddress: publicKey.toString(),
      //     tokenA,
      //     tokenB,
      //     fee
      //   })
      // });
      // const data = await response.json();
      // if (!data.success) throw new Error(data.message);
      
      // For development, mock success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refresh pools after creating
      await fetchPools();
      return true;
    } catch (err: any) {
      console.error("Error creating pool:", err);
      setError(err.message || "Failed to create pool.");
      return false;
    }
  };

  // Get Swap Quote
  const getSwapQuote = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number
  ): Promise<SwapResponse | null> => {
    try {
      // Convert slippage to basis points (e.g., 0.5% -> 50 basis points)
      const slippageBps = Math.round(slippage * 100);
      
      // For a real implementation we would make an API call like this:
      // const url = `${SWAP_QUOTE_URL}/swap-base-in?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountIn}&slippageBps=${slippageBps}&txVersion=V0`;
      // const response = await fetch(url);
      // const data = await response.json();
      
      // For development, use mock data with a slight delay to simulate network
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find tokens to calculate appropriate exchange rate
      const tokenInInfo = tokenList.find(t => t.address === tokenIn);
      const tokenOutInfo = tokenList.find(t => t.address === tokenOut);
      
      if (!tokenInInfo || !tokenOutInfo) {
        return null;
      }
      
      // Calculate mock exchange rate
      let exchangeRate = 1.0;
      if (tokenInInfo.symbol === 'SOL' && tokenOutInfo.symbol === 'USDC') {
        exchangeRate = 100;
      } else if (tokenInInfo.symbol === 'USDC' && tokenOutInfo.symbol === 'SOL') {
        exchangeRate = 0.01;
      } else if (tokenInInfo.symbol === 'SEGA' && tokenOutInfo.symbol === 'USDC') {
        exchangeRate = 5;
      } else if (tokenInInfo.symbol === 'USDC' && tokenOutInfo.symbol === 'SEGA') {
        exchangeRate = 0.2;
      } else if (tokenInInfo.symbol === 'SOL' && tokenOutInfo.symbol === 'SEGA') {
        exchangeRate = 500;
      } else if (tokenInInfo.symbol === 'SEGA' && tokenOutInfo.symbol === 'SOL') {
        exchangeRate = 0.002;
      }
      
      // Calculate output amount based on exchange rate
      const inputAmountNumber = parseFloat(amountIn) / Math.pow(10, tokenInInfo.decimals);
      const outputAmountRaw = inputAmountNumber * exchangeRate;
      const outputAmount = Math.floor(outputAmountRaw * Math.pow(10, tokenOutInfo.decimals)).toString();
      
      // Mock price impact between 0.01% and 0.5% based on amount
      const priceImpact = 0.01 + (inputAmountNumber / 1000) * 0.5;
      
      // Create mock response
      const mockResponse: SwapResponse = {
        id: `mock-quote-${Date.now()}`,
        success: true,
        data: {
          swapType: "ExactIn",
          inputMint: tokenIn,
          inputAmount: amountIn,
          outputMint: tokenOut,
          outputAmount: outputAmount,
          otherAmountThreshold: (parseInt(outputAmount) * (1 - slippage / 100)).toString(),
          slippageBps: slippageBps,
          priceImpactPct: priceImpact,
          routePlan: [
            {
              poolId: tokenInInfo.symbol === 'SOL' && tokenOutInfo.symbol === 'USDC' ? "pool-1" : "pool-2",
              inputMint: tokenIn,
              outputMint: tokenOut,
              feeMint: tokenOut,
              feeRate: 0.0025,
              feeAmount: (parseInt(outputAmount) * 0.0025).toString(),
              remainingAccounts: []
            }
          ]
        }
      };
      
      return mockResponse;
    } catch (err) {
      console.error("Error getting swap quote:", err);
      setError("Failed to get swap quote.");
      return null;
    }
  };

  // Swap tokens
  const swap = async (
    tokenIn: string, 
    tokenOut: string, 
    amountIn: string, 
    slippage: number
  ): Promise<boolean> => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet.");
      return false;
    }
    
    setError(null);
    setSwapLoading(true);
    
    try {
      // Get the swap quote first
      const quoteResponse = await getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
      
      if (!quoteResponse || !quoteResponse.success) {
        toast.error("Failed to get swap quote");
        return false;
      }
      
      // In a real implementation, we would execute the swap like this:
      // 1. Get transaction instructions from API
      // const txRequestBody = {
      //   wallet: publicKey.toString(),
      //   computeUnitPriceMicroLamports: "1",
      //   swapResponse: quoteResponse,
      //   txVersion: "V0",
      //   wrapSol: tokenIn === "So11111111111111111111111111111111111111112",
      //   unwrapSol: tokenOut === "So11111111111111111111111111111111111111112",
      // };
      
      // const txResponse = await fetch(`${SWAP_TRANSACTION_URL}/swap-base-in`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(txRequestBody),
      // });
      
      // const txData = await txResponse.json();
      
      // 2. Sign and send transaction
      // ... Wallet adapter logic to sign and send transaction ...

      // For development, mock success after delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Swap completed successfully!");
      return true;
    } catch (err: any) {
      console.error("Error swapping tokens:", err);
      setError(err.message || "Failed to swap tokens.");
      toast.error("Swap failed. Please try again.");
      return false;
    } finally {
      setSwapLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenList();
  }, []);

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserLiquidity();
    } else {
      setUserLiquidity([]);
    }
  }, [connected, publicKey]);

  const value = {
    pools,
    userLiquidity,
    tokenList,
    fetchPools,
    fetchUserLiquidity,
    addLiquidity,
    removeLiquidity,
    createPool,
    swap,
    getSwapQuote,
    poolsLoading,
    userLiquidityLoading,
    swapLoading,
    error
  };

  return <SEGAContext.Provider value={value}>{children}</SEGAContext.Provider>;
};

export const useSEGA = () => {
  const context = useContext(SEGAContext);
  if (context === undefined) {
    throw new Error("useSEGA must be used within a SEGAProvider");
  }
  return context;
};

export type { Pool, UserLiquidity, Token }; 