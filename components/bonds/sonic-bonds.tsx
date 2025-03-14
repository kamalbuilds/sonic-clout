"use client";

import React, { useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { SonicBondCard, SonicBondProps } from './sonic-bond-card';
import { LoadingCircle } from '../LoadingCircle';

// Mock data for Sonic Bonds
const MOCK_BONDS: SonicBondProps[] = [
  {
    id: '1',
    name: 'Boss Attempts',
    description: 'A bond tied to the number of boss attempts in Aurory Game. Value increases with each attempt.',
    creator: '0x1234567890123456789012345678901234567890',
    category: 'game',
    metric: 'attempts',
    currentValue: 24562,
    totalSupply: 10000,
    price: 0.87,
    priceChange24h: 0.12,
    marketCap: 8700
  },
  {
    id: '2',
    name: 'Clip Shares',
    description: 'Tokenized shares of viral gameplay clips. Value is based on view count across platforms.',
    creator: '0x2345678901234567890123456789012345678901',
    category: 'content',
    metric: 'shares',
    currentValue: 3240,
    totalSupply: 5000,
    price: 1.42,
    priceChange24h: -0.05,
    marketCap: 7100
  },
  {
    id: '3',
    name: 'Viral Posts',
    description: 'A bond that tracks the viral posts from SolanaBuilder. Performance tied to engagement metrics.',
    creator: '0x3456789012345678901234567890123456789012',
    category: 'social',
    metric: 'engagements',
    currentValue: 128792,
    totalSupply: 25000,
    price: 0.34,
    priceChange24h: 0.23,
    marketCap: 8500
  },
  {
    id: '4',
    name: 'NFT Mint Success',
    description: 'Bond tracking successful NFT mints on Sonic. Value increases with each successful mint.',
    creator: '0x4567890123456789012345678901234567890123',
    category: 'content',
    metric: 'mints',
    currentValue: 8734,
    totalSupply: 15000,
    price: 0.65,
    priceChange24h: -0.03,
    marketCap: 9750
  }
];

export const SonicBonds: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'game' | 'social' | 'content'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const filteredBonds = MOCK_BONDS.filter(bond => 
    filter === 'all' || bond.category === filter
  );
  
  const handleCreateBond = () => {
    setShowCreateModal(true);
  };
  
  return (
    <>
      <GlassCard className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Sonic Bonds</h2>
          <Button 
            variant="glassColored"
            gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
            onClick={handleCreateBond}
          >
            Create Bond
          </Button>
        </div>
        
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button 
            variant={filter === 'all' ? "glassColored" : "glass"}
            gradient={filter === 'all' ? "rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)" : undefined}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Bonds
          </Button>
          <Button 
            variant={filter === 'game' ? "glassColored" : "glass"}
            gradient={filter === 'game' ? "rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)" : undefined}
            size="sm"
            onClick={() => setFilter('game')}
          >
            🎮 Game
          </Button>
          <Button 
            variant={filter === 'social' ? "glassColored" : "glass"}
            gradient={filter === 'social' ? "rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)" : undefined}
            size="sm"
            onClick={() => setFilter('social')}
          >
            👥 Social
          </Button>
          <Button 
            variant={filter === 'content' ? "glassColored" : "glass"}
            gradient={filter === 'content' ? "rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)" : undefined}
            size="sm"
            onClick={() => setFilter('content')}
          >
            📝 Content
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingCircle />
            <span className="ml-2">Loading bonds...</span>
          </div>
        ) : filteredBonds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white-400 mb-4">No bonds found for this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBonds.map((bond) => (
              <SonicBondCard key={bond.id} {...bond} />
            ))}
          </div>
        )}
      </GlassCard>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-xl">
            <GlassCard className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Bond</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-white-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bond Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Boss Attempts"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this bond represents..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="game">Game</option>
                    <option value="social">Social</option>
                    <option value="content">Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Metric</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., attempts, views, shares"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Initial Supply</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white"
                      placeholder="10000"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Initial Price ($)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white"
                      placeholder="0.10"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-md p-3">
                  <h3 className="text-sm font-semibold mb-2">Oracle Connection</h3>
                  <p className="text-xs text-white-400 mb-2">
                    Connect to a Switchboard oracle to track the performance metric of your bond.
                  </p>
                  <select
                    className="w-full bg-white/10 border border-white/10 rounded-md p-2 text-white text-sm"
                  >
                    <option value="">Select an oracle feed</option>
                    <option value="game_metrics">Game Metrics Oracle</option>
                    <option value="social_engagement">Social Engagement Oracle</option>
                    <option value="content_views">Content Views Oracle</option>
                  </select>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="glassColored"
                    gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
                  >
                    Create Bond
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </>
  );
}; 