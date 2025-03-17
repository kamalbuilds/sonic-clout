"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSEGA, SwapResponse } from '@/context/SEGAContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useWallet } from '@solana/wallet-adapter-react';
import { IoSwapVertical } from 'react-icons/io5';
import { LoadingCircle } from '@/components/LoadingCircle';
import { toast } from 'react-hot-toast';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Default tokens for initial state
const DEFAULT_TOKENS: Token[] = [
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Wrapped SOL',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  }
];

export const SEGASwap: React.FC = () => {
  const { swap, getSwapQuote, tokenList, swapLoading } = useSEGA();
  const { connected } = useWallet();
  
  const [tokenIn, setTokenIn] = useState<Token>(DEFAULT_TOKENS[1]); // SOL
  const [tokenOut, setTokenOut] = useState<Token>(DEFAULT_TOKENS[0]); // USDC
  const [amountIn, setAmountIn] = useState<string>('');
  const [amountOut, setAmountOut] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5); // default slippage tolerance
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<string>('0');
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState<SwapResponse | null>(null);

  // Use token list from SEGA API if available
  useEffect(() => {
    if (tokenList && tokenList.length > 0) {
      // Find SOL and USDC in the token list
      const sol = tokenList.find(t => t.symbol === 'SOL') || DEFAULT_TOKENS[1];
      const usdc = tokenList.find(t => t.symbol === 'USDC') || DEFAULT_TOKENS[0];
      
      setTokenIn({
        address: sol.address,
        symbol: sol.symbol,
        name: sol.name,
        decimals: sol.decimals,
        logoURI: sol.logoURI
      });
      
      setTokenOut({
        address: usdc.address,
        symbol: usdc.symbol,
        name: usdc.name,
        decimals: usdc.decimals,
        logoURI: usdc.logoURI
      });
    }
  }, [tokenList]);

  // Calculate output amount based on input using the SEGA API
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountIn || parseFloat(amountIn) <= 0 || !tokenIn.address || !tokenOut.address) {
        setAmountOut('');
        setPriceImpact(0);
        setExchangeRate('0');
        setCurrentQuote(null);
        return;
      }
      
      try {
        setQuoteLoading(true);
        
        // Convert to smallest unit
        const amountInSmallest = (parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)).toString();
        
        const quoteResponse = await getSwapQuote(
          tokenIn.address,
          tokenOut.address,
          amountInSmallest,
          slippage
        );
        
        if (quoteResponse && quoteResponse.success) {
          setCurrentQuote(quoteResponse);
          
          // Convert outputAmount from smallest unit to display value
          const outputAmount = parseFloat(quoteResponse.data.outputAmount) / Math.pow(10, tokenOut.decimals);
          setAmountOut(outputAmount.toFixed(tokenOut.decimals));
          
          // Set price impact
          setPriceImpact(quoteResponse.data.priceImpactPct);
          
          // Calculate exchange rate
          const inputValueInSmallest = parseFloat(quoteResponse.data.inputAmount);
          const outputValueInSmallest = parseFloat(quoteResponse.data.outputAmount);
          
          if (inputValueInSmallest > 0) {
            const rateInSmallest = outputValueInSmallest / inputValueInSmallest;
            const rate = rateInSmallest * (Math.pow(10, tokenIn.decimals) / Math.pow(10, tokenOut.decimals));
            setExchangeRate(rate.toFixed(tokenOut.decimals));
          }
        } else {
          setAmountOut('');
          setPriceImpact(0);
          setExchangeRate('0');
          setCurrentQuote(null);
        }
      } catch (error) {
        console.error('Error fetching swap quote:', error);
        toast.error('Error calculating swap rate');
      } finally {
        setQuoteLoading(false);
      }
    };
    
    // Use a debounce to avoid calling the API on every keystroke
    const debounceTimeout = setTimeout(() => {
      fetchQuote();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [amountIn, tokenIn, tokenOut, slippage, getSwapQuote]);

  const switchTokens = () => {
    setCurrentQuote(null);
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
    setAmountOut('');
  };

  const handleSwap = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!amountIn || parseFloat(amountIn) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      // Convert to smallest unit
      const amountInSmallest = (parseFloat(amountIn) * Math.pow(10, tokenIn.decimals)).toString();
      
      const success = await swap(
        tokenIn.address, 
        tokenOut.address, 
        amountInSmallest,
        slippage
      );
      
      if (success) {
        setAmountIn('');
        setAmountOut('');
        setCurrentQuote(null);
      }
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <GlassCard
      variant="colored"
      gradient="rgba(138, 43, 226, 0.3), rgba(56, 189, 248, 0.3)"
      className="p-6 max-w-md mx-auto"
      glassBefore={true}
      glassHighlight={true}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>SEGA Swap</h2>
        <div className="flex space-x-2">
          <button
            className={`px-2 py-1 rounded-full text-xs font-medium ${slippage === 0.1 ? 'bg-white/20' : 'bg-white/10'}`}
            onClick={() => setSlippage(0.1)}
          >
            0.1%
          </button>
          <button
            className={`px-2 py-1 rounded-full text-xs font-medium ${slippage === 0.5 ? 'bg-white/20' : 'bg-white/10'}`}
            onClick={() => setSlippage(0.5)}
          >
            0.5%
          </button>
          <button
            className={`px-2 py-1 rounded-full text-xs font-medium ${slippage === 1 ? 'bg-white/20' : 'bg-white/10'}`}
            onClick={() => setSlippage(1)}
          >
            1%
          </button>
        </div>
      </div>

      {/* From token */}
      <div className="rounded-xl bg-white/10 p-4 mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-white/70">From</span>
          <span className="text-sm text-white/70">Balance: 0.00</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-xl w-full outline-none mr-2"
            disabled={swapLoading}
          />
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1 cursor-pointer">
            {tokenIn.logoURI && (
              <Image
                src={tokenIn.logoURI}
                alt={tokenIn.symbol}
                width={20}
                height={20}
                className="mr-2 rounded-full"
              />
            )}
            <span className="font-medium">{tokenIn.symbol}</span>
          </div>
        </div>
      </div>

      {/* Swap button */}
      <div className="flex justify-center -my-1 relative z-10">
        <button
          onClick={switchTokens}
          className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
          disabled={swapLoading}
        >
          <IoSwapVertical size={18} />
        </button>
      </div>

      {/* To token */}
      <div className="rounded-xl bg-white/10 p-4 mt-2 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-white/70">To</span>
          <span className="text-sm text-white/70">Balance: 0.00</span>
        </div>
        <div className="flex items-center">
          <div className="flex-1 mr-2">
            {quoteLoading ? (
              <div className="flex items-center h-[28px]">
                <LoadingCircle size="small" />
              </div>
            ) : (
              <input
                type="number"
                value={amountOut}
                placeholder="0.00"
                className="bg-transparent text-xl w-full outline-none"
                readOnly
              />
            )}
          </div>
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1 cursor-pointer">
            {tokenOut.logoURI && (
              <Image
                src={tokenOut.logoURI}
                alt={tokenOut.symbol}
                width={20}
                height={20}
                className="mr-2 rounded-full"
              />
            )}
            <span className="font-medium">{tokenOut.symbol}</span>
          </div>
        </div>
      </div>

      {/* Swap details */}
      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/70">Exchange Rate</span>
          <span className="font-medium">
            1 {tokenIn.symbol} ≈ {exchangeRate} {tokenOut.symbol}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-white/70">Price Impact</span>
          <span className={priceImpact > 1 ? 'text-red-400 font-medium' : 'font-medium'}>
            {priceImpact.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Slippage Tolerance</span>
          <span className="font-medium">{slippage}%</span>
        </div>
      </div>

      {/* Swap button */}
      <Button
        variant="glassColored"
        gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
        className="w-full py-3 text-base font-medium relative"
        disabled={!connected || !amountIn || parseFloat(amountIn) <= 0 || !currentQuote || swapLoading || quoteLoading}
        onClick={handleSwap}
      >
        {swapLoading ? (
          <div className="flex items-center justify-center">
            <LoadingCircle size="small" />
            <span className="ml-2">Swapping...</span>
          </div>
        ) : !connected ? (
          'Connect Wallet'
        ) : !amountIn || parseFloat(amountIn) <= 0 ? (
          'Enter an amount'
        ) : !currentQuote ? (
          'Invalid swap'
        ) : (
          'Swap'
        )}
      </Button>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-white/60">
          Powered by SEGA on Sonic SVM • 0.25% Swap Fee
        </p>
      </div>
    </GlassCard>
  );
};

export default SEGASwap; 