"use client";
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
  
  const textShadowStyle = { textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' };
  
  // Custom cursor SVGs as data URLs
  const buyCursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%233b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="%233b82f630"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="%233b82f610"/><path d="M12 8l3 8h-6l3-8z" fill="%233b82f680"/></svg>`;
  
  const sellCursorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="%23ec489930"/><path d="M12 8l-4 4 4 4" fill="%23ec489980"/><path d="M16 12H8" fill="%23ec489980"/></svg>`;
  
  const buyCursorStyle = { 
    cursor: `url('${buyCursorSvg}') 16 16, pointer`,
  };
  
  const sellCursorStyle = { 
    cursor: `url('${sellCursorSvg}') 16 16, pointer`,
  };
  
  return (
    <GlassCard 
      variant="colored" 
      gradient="rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3)"
      hover="scale"
      glassBefore={true}
      glassHighlight={true}
      className={`cursor-pointer transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg ring-2 ring-white/30 animate-glow">
          {icon ? (
            <img src={icon} alt={symbol} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-bold tracking-wide" style={textShadowStyle}>{symbol.substring(0, 2).toUpperCase()}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-base tracking-wide" style={textShadowStyle}>{name}</div>
              <div className="text-xs text-white/80 text-sm mb-3">{symbol}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-base tracking-wide" style={textShadowStyle}>${formatAmount(price)}</div>
              <div className={`text-xs font-medium ${isPriceUp ? 'text-green-400' : 'text-red-400'} tracking-wide`} style={textShadowStyle}>
                {isPriceUp ? '↑' : '↓'} {formatPercentage(Math.abs(priceChange24h))}
              </div>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm border border-white/10 shadow-inner">
              <div className="text-white-300 mb-1">24h Volume</div>
              <div className="font-medium tracking-wide" style={textShadowStyle}>${formatAmount(volume24h)}</div>
            </div>
            {marketCap && (
              <div className="bg-white/10 rounded-md p-2 backdrop-blur-sm border border-white/10 shadow-inner">
                <div className="text-white-300 mb-1">Market Cap</div>
                <div className="font-medium tracking-wide" style={textShadowStyle}>${formatAmount(marketCap)}</div>
              </div>
            )}
          </div>
          
          {contentType && (
            <div className="mt-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-white/15 font-medium border border-white/20 shadow-sm tracking-wide" style={textShadowStyle}>
                {contentType === 'post' ? '📝 Post' : contentType === 'clip' ? '🎮 Clip' : '👤 Profile'}
              </span>
            </div>
          )}
          
          <div className="mt-3 flex gap-2">
            <Button 
              variant="glassColored" 
              gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
              size="sm" 
              className="flex-1 font-medium interactive-item"
              style={buyCursorStyle}
            >
              Buy
            </Button>
            <Button 
              variant="glass" 
              size="sm" 
              className="flex-1 font-medium interactive-item"
              style={sellCursorStyle}
            >
              Sell
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}; 