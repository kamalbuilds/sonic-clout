"use client";

import React, { useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { formatAmount } from '../ui/utils';
import { LoadingCircle } from '../LoadingCircle';

export interface SonicBondProps {
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
  onClick?: () => void;
}

export const SonicBondCard: React.FC<SonicBondProps> = ({
  id,
  name,
  description,
  creator,
  category,
  metric,
  currentValue,
  totalSupply,
  price,
  priceChange24h,
  marketCap,
  onClick
}) => {
  const [isTrading, setIsTrading] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null);
  const [tradeAmount, setTradeAmount] = useState(1);
  
  const isPriceUp = priceChange24h >= 0;
  
  const handleOpenTrade = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setTradeAmount(1);
  };
  
  const handleCloseTrade = () => {
    setTradeType(null);
  };
  
  const handleTradeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTradeAmount(value);
    }
  };
  
  const handleExecuteTrade = async () => {
    if (!tradeType) return;
    
    setIsTrading(true);
    
    try {
      // Here we would call the actual trading function
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Close trade panel and show success
      setTradeType(null);
      // Mock successful trade notification would go here
    } catch (error) {
      console.error('Error executing trade:', error);
      // Show error notification
    } finally {
      setIsTrading(false);
    }
  };
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'game':
        return '🎮';
      case 'social':
        return '👥';
      case 'content':
        return '📝';
      default:
        return '📊';
    }
  };
  
  const getEstimatedTotal = () => {
    return tradeAmount * price;
  };
  
  return (
    <GlassCard 
      variant="default" 
      hover="scale"
      className="overflow-hidden"
    >
      {tradeType ? (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{tradeType === 'buy' ? 'Buy' : 'Sell'} {name}</h3>
            <button 
              onClick={handleCloseTrade}
              className="text-white-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              value={tradeAmount}
              onChange={handleTradeAmountChange}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white"
              min="1"
            />
          </div>
          
          <div className="bg-white/5 rounded-md p-3 mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-white-400">Price per Bond</span>
              <span className="text-sm">${formatAmount(price)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-white-400">Quantity</span>
              <span className="text-sm">{tradeAmount}</span>
            </div>
            <div className="border-t border-white/10 my-2 pt-2"></div>
            <div className="flex justify-between">
              <span className="text-sm text-white-400">Total</span>
              <span className="text-sm font-semibold">${formatAmount(getEstimatedTotal())}</span>
            </div>
          </div>
          
          <Button
            variant="glassColored"
            gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
            className="w-full"
            onClick={handleExecuteTrade}
            disabled={isTrading}
          >
            {isTrading ? (
              <>
                <LoadingCircle />
                Processing...
              </>
            ) : (
              `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${tradeAmount} ${name} Bond${tradeAmount !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                {getCategoryIcon()}
              </div>
              <h3 className="font-semibold">{name}</h3>
            </div>
            <div className={`text-sm ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
              {isPriceUp ? '↑' : '↓'} {Math.abs(priceChange24h * 100).toFixed(2)}%
            </div>
          </div>
          
          <p className="text-sm text-white-400 mb-3 line-clamp-2">{description}</p>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            <div>
              <div className="text-xs text-white-400">Current Metric</div>
              <div className="font-medium text-sm">{formatAmount(currentValue)} {metric}</div>
            </div>
            <div>
              <div className="text-xs text-white-400">Price</div>
              <div className="font-medium text-sm">${formatAmount(price)}</div>
            </div>
            <div>
              <div className="text-xs text-white-400">Supply</div>
              <div className="font-medium text-sm">{formatAmount(totalSupply)}</div>
            </div>
            <div>
              <div className="text-xs text-white-400">Market Cap</div>
              <div className="font-medium text-sm">${formatAmount(marketCap)}</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="glass" 
              className="flex-1"
              onClick={() => handleOpenTrade('buy')}
            >
              Buy
            </Button>
            <Button
              variant="outline" 
              className="flex-1"
              onClick={() => handleOpenTrade('sell')}
            >
              Sell
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}; 