"use client";

import React, { useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { createSPLToken, TokenCreationParams } from '@/app/lib/services/tokenService';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { LoadingCircle } from '../LoadingCircle';
import { Post } from '@/types';

interface TokenizeContentProps {
  post: Post;
  onSuccess?: (tokenAddress: string) => void;
  onClose: () => void;
}

export const TokenizeContent: React.FC<TokenizeContentProps> = ({ 
  post, 
  onSuccess, 
  onClose 
}) => {
  const wallet = useWallet();
  const [tokenName, setTokenName] = useState(`${post.creator_details.metadata.address.slice(0, 4)}Post`);
  const [tokenSymbol, setTokenSymbol] = useState(`P${post.stream_id.slice(0, 3)}`);
  const [initialSupply, setInitialSupply] = useState(1000000);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleTokenize = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setIsCreating(true);
      
      const tokenParams: TokenCreationParams = {
        name: tokenName,
        symbol: tokenSymbol,
        initialSupply,
        metadata: {
          type: 'post',
          content: post.content.body,
          creator: wallet.publicKey.toString()
        }
      };
      
      const tokenAddress = await createSPLToken(tokenParams, wallet);
      
      toast.success('Content successfully tokenized!');
      
      if (onSuccess) {
        onSuccess(tokenAddress);
      }
    } catch (error) {
      console.error('Error tokenizing content:', error);
      toast.error('Failed to tokenize content');
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <GlassCard className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tokenize Your Content</h2>
        <button 
          onClick={onClose}
          className="text-white-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Token Name</label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Token Symbol</label>
          <input
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
            className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={5}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Initial Supply</label>
          <input
            type="number"
            value={initialSupply}
            onChange={(e) => setInitialSupply(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
          />
        </div>
        
        <div className="bg-white/5 rounded-md p-3">
          <h3 className="text-sm font-semibold mb-2">Tokenization Fee</h3>
          <p className="text-xs text-white-400">0.5 SOL will be charged for tokenization</p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="glassColored"
            gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
            onClick={handleTokenize}
            disabled={isCreating || !wallet.connected}
            className="cursor-pointer"
          >
            {isCreating ? (
              <>
                <LoadingCircle />
                Creating Token
              </>
            ) : (
              'Tokenize Content'
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}; 