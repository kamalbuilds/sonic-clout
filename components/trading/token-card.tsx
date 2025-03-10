import React from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { formatAmount, formatPercentage } from '../ui/utils';

export interface TokenCardProps {
  name: string;
  symbol: string;
  icon?: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
  creator?: {
    address: string;
    displayName?: string;
  };
  contentType?: 'post' | 'clip' | 'profile';
  className?: string;
  onClick?: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  name,
  symbol,
  icon,
  price,
  priceChange24h,
  volume24h,
  marketCap,
  creator,
  contentType,
  className,
  onClick,
}) => {
  const isPriceUp = priceChange24h >= 0;
  
  return (
    <GlassCard 
      variant="default" 
      hover="scale"
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
          {icon ? (
            <img src={icon} alt={symbol} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold">{symbol.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{name}</div>
              <div className="text-xs text-gray-400">{symbol}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">${formatAmount(price)}</div>
              <div className={`text-xs ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                {isPriceUp ? '↑' : '↓'} {formatPercentage(Math.abs(priceChange24h))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <div>24h Volume</div>
              <div className="font-medium text-white">${formatAmount(volume24h)}</div>
            </div>
            {marketCap && (
              <div>
                <div>Market Cap</div>
                <div className="font-medium text-white">${formatAmount(marketCap)}</div>
              </div>
            )}
          </div>
          
          {contentType && (
            <div className="mt-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-white/10">
                {contentType === 'post' ? '📝 Post' : contentType === 'clip' ? '🎮 Clip' : '👤 Profile'}
              </span>
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            <Button variant="glass" size="sm" className="flex-1">Buy</Button>
            <Button variant="outline" size="sm" className="flex-1">Sell</Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}; 