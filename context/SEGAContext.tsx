"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
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

interface SwapData {
  inputMint: string;
  outputMint: string;
  amount: string;
  inputDecimal?: number;
  slippageBps?: number;
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
  fetchSwapRawData: (swapData: SwapData) => Promise<any>;
  poolsLoading: boolean;
  userLiquidityLoading: boolean;
  swapLoading: boolean;
  error: string | null;
}

// Define API URLs
const BASE_URL = "https://api.sega.so/swap";
const API_BASE_URL = "https://api.sega.so";
const POOL_API_URL = `${API_BASE_URL}/pools`;
const TOKEN_API_URL = `${API_BASE_URL}/tokens`;
const USER_LIQUIDITY_API_URL = `${API_BASE_URL}/liquidity`;
const TX_VERSION = "V1.0.0";

const SEGAContext = createContext<SEGAContextType | undefined>(undefined);

export const SEGAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const { wallet } = useWallet();
  console.log(wallet,"wallet");
  const solanaAddress = wallet?.publicKey?.toString() || publicKey?.toString();
  
  const [pools, setPools] = useState<Pool[]>([]);
  const [tokenList, setTokenList] = useState<Token[]>([]);
  const [userLiquidity, setUserLiquidity] = useState<UserLiquidity[]>([]);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const [userLiquidityLoading, setUserLiquidityLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [txResponse, setTxResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch tokens list
  const fetchTokenList = async () => {
    try {
      // This would be a real API call in production
      // const response = await fetch(TOKEN_API_URL);
      // const data = await response.json();
      // console.log(data,"data for token list");
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
          address: "mrujEYaN1oyQXDHeYNxBYpxWKVkQ2XsGxfznpifu4aL",
          symbol: "SONIC",
          name: "Sonic Token",
          decimals: 6,
          logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
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
              address: "CCaj4n3kbuqsGvx4KxiXBfoQPtAgww6fwinHTAPqV5dS",
              symbol: "SONIC",
              name: "SONIC",
              decimals: 6,
              logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
            },
            fee: 0.0025,
            liquidity: 8668,
            volume24h: 143,
            apr: 18.5
          },
          {
            id: "pool-2",
            token0: {
              address: "So11111111111111111111111111111111111111112",
              symbol: "sonicSOL",
              name: "Sonic SOL",
              decimals: 9,
              logoURI: "https://raw.githubusercontent.com/hyperlane-xyz/hyperlane-registry/refs/heads/main/deployments/warp_routes/sonicSOL/logo.png"
            },
            token1: {
              address: "mrujEYaN1oyQXDHeYNxBYpxWKVkQ2XsGxfznpifu4aL",
              symbol: "SONIC",
              name: "SONIC Token",
              decimals: 6,
              logoURI: "https://arweave.net/599UDQd5YAUfesAJCTNZ-4ELWLHX5pbid-ahpoJ-w1A"
            },
            fee: 0.0025,
            liquidity: 120,
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
    if (!solanaAddress) {
      setUserLiquidity([]);
      return;
    }
    
    setUserLiquidityLoading(true);
    setError(null);
    
    try {
      // This would be a real API call in production
      // const response = await fetch(`${USER_LIQUIDITY_API_URL}/${solanaAddress}`);
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
    if (!solanaAddress) {
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
      //     walletAddress: solanaAddress,
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
    if (!solanaAddress) {
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
      //     walletAddress: solanaAddress,
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
    if (!solanaAddress) {
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
      //     walletAddress: solanaAddress,
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

  // Get Swap Quote (updated to use the production API endpoint)
  const getSwapQuote = async (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    slippage: number
  ): Promise<SwapResponse | null> => {
    try {
      // Convert slippage to basis points (e.g., 0.5% -> 50 basis points)
      const slippageBps = Math.round(slippage * 100);
      
      const url = `${BASE_URL}/compute/swap-base-in?inputMint=${tokenIn}&outputMint=${tokenOut}&amount=${amountIn}&slippageBps=${slippageBps}&txVersion=${TX_VERSION}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("Swap quote result:", result);
      return result;
    } catch (err) {
      console.error("Error getting swap quote:", err);
      setError("Failed to get swap quote.");
      return null;
    }
  };

  // Submit swap transaction
  const submitSwapTransaction = async (
    amount: string,
    swapResponse: any, 
    wrapSol = true, 
    unwrapSol = true
  ) => {
    if (!solanaAddress) {
      toast.error("Please connect your wallet.");
      return null;
    }
    
    setError(null);
    
    try {
      const url = `${BASE_URL}/transaction/swap-base-in`;
      
      const body = JSON.stringify({
        wallet: solanaAddress,
        computeUnitPriceMicroLamports: amount,
        swapResponse,
        txVersion: TX_VERSION,
        wrapSol,
        unwrapSol,
        outputAccount: solanaAddress,
      });
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body,
      });
      
      if (!response.ok) {
        throw new Error(`Transaction request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setTxResponse(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Transaction failed.");
      console.error("Transaction API Error:", err);
      return null;
    }
  };

  // Wrapper function to handle both API calls in sequence
  const fetchSwapRawData = async ({ inputMint, outputMint, amount, inputDecimal = 9, slippageBps = 50 }: SwapData) => {
    setSwapLoading(true);
    setError(null);
    
    const parsedAmount = Math.floor(parseFloat(amount) * Math.pow(10, inputDecimal)); // Convert to smallest unit
    
    console.log(`Parsed Amount: ${parsedAmount} (${amount} * 10^${inputDecimal})`);
    
    try {
      // Step 1: Get Swap Computation
      const swapComputeResponse = await getSwapQuote(inputMint, outputMint, parsedAmount.toString(), slippageBps / 100);
      
      if (!swapComputeResponse || !swapComputeResponse.success) {
        throw new Error("Swap computation failed.");
      }
      
      // Step 2: Submit Swap Transaction
      const swapTransactionResponse = await submitSwapTransaction(parsedAmount.toString(), swapComputeResponse);
      
      if (swapTransactionResponse) {
        toast.success("Swap transaction prepared successfully!");
      }
      
      return swapTransactionResponse;
    } catch (err: any) {
      setError(err.message || "Swap execution failed.");
      console.error("Swap Execution Error:", err);
      toast.error(err.message || "Swap execution failed.");
      return null;
    } finally {
      setSwapLoading(false);
    }
  };

  // Legacy swap function (kept for backward compatibility)
  const swap = async (
    tokenIn: string, 
    tokenOut: string, 
    amountIn: string, 
    slippage: number
  ): Promise<boolean> => {
    const token = tokenList.find(t => t.address === tokenIn);
    if (!token) {
      toast.error("Token information not found");
      return false;
    }
    
    const response = await fetchSwapRawData({
      inputMint: tokenIn,
      outputMint: tokenOut,
      amount: amountIn,
      inputDecimal: token.decimals,
      slippageBps: Math.round(slippage * 100)
    });
    
    return !!response;
  };

  useEffect(() => {
    fetchTokenList();
  }, []);

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (solanaAddress) {
      fetchUserLiquidity();
    } else {
      setUserLiquidity([]);
    }
  }, [solanaAddress]);

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
    fetchSwapRawData,
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

export type { Pool, UserLiquidity, Token, SwapData }; 