"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSEGA } from '@/context/SEGAContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useWallet } from '@solana/wallet-adapter-react';
import { IoSwapVertical } from 'react-icons/io5';

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

const DEFAULT_TOKENS: Token[] = [
  {
    address: '8zEuKWfxCmcVKEuZfVw4ggkv7AXHt9NhUn5kKyVgNQ7r',
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
  },
  {
    address: 'SEGAQghPD3hzNGjJ7WGmJwyKEbMx9BU9yqVNZxeKz7Z',
    symbol: 'SEGA',
    name: 'SEGA Token',
    decimals: 9,
    logoURI: '/sega-logo.svg'
  }
];

export const SEGASwap: React.FC = () => {
  const { swap, pools, isLoading } = useSEGA();
  const { connected } = useWallet();
  
  const [tokenIn, setTokenIn] = useState<Token>(DEFAULT_TOKENS[1]); // SOL
  const [tokenOut, setTokenOut] = useState<Token>(DEFAULT_TOKENS[0]); // USDC
  const [amountIn, setAmountIn] = useState<string>('');
  const [amountOut, setAmountOut] = useState<string>('');
  const [slippage, setSlippage] = useState<number>(0.5); // default slippage tolerance
  const [priceImpact, setPriceImpact] = useState<string>('0.00');
  const [exchangeRate, setExchangeRate] = useState<string>('0');

  // Calculate output amount based on input and exchange rate
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      // In a real app, this would use the pools to calculate the actual amount
      const mockExchangeRate = tokenIn.symbol === 'SOL' && tokenOut.symbol === 'USDC' 
        ? 100 
        : tokenIn.symbol === 'USDC' && tokenOut.symbol === 'SOL' 
          ? 0.01 
          : tokenIn.symbol === 'SEGA' && tokenOut.symbol === 'USDC' 
            ? 5 
            : tokenIn.symbol === 'USDC' && tokenOut.symbol === 'SEGA'
              ? 0.2
              : 1;
      
      setExchangeRate(mockExchangeRate.toString());
      const calculatedAmountOut = parseFloat(amountIn) * mockExchangeRate;
      setAmountOut(calculatedAmountOut.toFixed(tokenOut.decimals));
      
      // Mock price impact
      setPriceImpact((parseFloat(amountIn) * 0.01).toFixed(2));
    } else {
      setAmountOut('');
      setPriceImpact('0.00');
    }
  }, [amountIn, tokenIn, tokenOut]);

  const switchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
    setAmountOut(amountIn);
  };

  const handleSwap = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!amountIn || parseFloat(amountIn) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    try {
      const success = await swap(
        tokenIn.address, 
        tokenOut.address, 
        parseFloat(amountIn),
        slippage
      );
      
      if (success) {
        alert('Swap successful!');
        setAmountIn('');
        setAmountOut('');
      }
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
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
          <input
            type="number"
            value={amountOut}
            onChange={(e) => setAmountOut(e.target.value)}
            placeholder="0.00"
            className="bg-transparent text-xl w-full outline-none mr-2"
            readOnly
          />
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
          <span className={parseFloat(priceImpact) > 1 ? 'text-red-400 font-medium' : 'font-medium'}>
            {priceImpact}%
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
        className="w-full py-3 text-base font-medium"
        disabled={!connected || !amountIn || parseFloat(amountIn) <= 0 || isLoading}
        onClick={handleSwap}
      >
        {!connected
          ? 'Connect Wallet'
          : !amountIn || parseFloat(amountIn) <= 0
          ? 'Enter an amount'
          : isLoading
          ? 'Swapping...'
          : 'Swap'}
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