"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { SEGAProvider } from '@/context/SEGAContext';
import SEGASwap from '@/components/trading/sega-swap';
import SEGAPools from '@/components/trading/sega-pools';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

const SEGAPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'pools'>('swap');

  return (
    <SEGAProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Image 
                src="/sega-logo.svg" 
                alt="SEGA Logo" 
                width={50} 
                height={50}
                className="mr-4"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                  SEGA
                </h1>
                <p className="text-white/70">Sonic Efficient Gateway AMM</p>
              </div>
            </div>
            <Button 
              variant="glass"
              size="sm"
              onClick={() => window.open('https://explorer.solana.com', '_blank')}
              className="text-sm"
            >
              View transactions →
            </Button>
          </div>

          {/* Stats section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <GlassCard variant="colored" gradient="rgba(138, 43, 226, 0.2), rgba(56, 189, 248, 0.2)" className="p-4 text-center">
              <h3 className="text-sm text-white/70 mb-1">Total Value Locked</h3>
              <p className="text-2xl font-bold">$3,250,000</p>
            </GlassCard>
            <GlassCard variant="colored" gradient="rgba(138, 43, 226, 0.2), rgba(56, 189, 248, 0.2)" className="p-4 text-center">
              <h3 className="text-sm text-white/70 mb-1">Volume (24h)</h3>
              <p className="text-2xl font-bold">$925,650</p>
            </GlassCard>
            <GlassCard variant="colored" gradient="rgba(138, 43, 226, 0.2), rgba(56, 189, 248, 0.2)" className="p-4 text-center">
              <h3 className="text-sm text-white/70 mb-1">Active Pools</h3>
              <p className="text-2xl font-bold">2</p>
            </GlassCard>
          </div>

          {/* Tabs navigation */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={activeTab === 'swap' ? 'glassColored' : 'glass'}
              gradient={activeTab === 'swap' ? "rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)" : undefined}
              size="sm"
              onClick={() => setActiveTab('swap')}
              className="min-w-[100px]"
            >
              Swap
            </Button>
            <Button
              variant={activeTab === 'pools' ? 'glassColored' : 'glass'}
              gradient={activeTab === 'pools' ? "rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)" : undefined}
              size="sm"
              onClick={() => setActiveTab('pools')}
              className="min-w-[100px]"
            >
              Pools
            </Button>
          </div>

          {/* Content based on active tab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              {activeTab === 'swap' && <SEGASwap />}
              {activeTab === 'pools' && <SEGAPools />}
            </div>
            
            <div className="lg:col-span-2">
              <GlassCard
                variant="colored"
                gradient="rgba(138, 43, 226, 0.1), rgba(56, 189, 248, 0.1)"
                className="p-6"
                glassBefore={true}
              >
                <h2 className="text-xl font-bold mb-4" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
                  SEGA Features
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Blazing Fast</h3>
                        <p className="text-sm text-white/70">Transactions confirm in milliseconds</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Non-Custodial</h3>
                        <p className="text-sm text-white/70">You always retain control of your assets</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Permissionless</h3>
                        <p className="text-sm text-white/70">Anyone can create and provide liquidity</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Ecosystem Rewards</h3>
                        <p className="text-sm text-white/70">Earn SEGA tokens for providing liquidity</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="font-medium mb-3">Latest Updates</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <p className="text-white/80">SEGA AMM now live on Sonic SVM: Thousands of transactions per second with microsecond latency</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <p className="text-white/80">Liquidity mining program kicks off: Earn SEGA tokens for providing liquidity to eligible pools</p>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <p className="text-white/80">New routing algorithm achieves up to 30% better prices across all token pairs</p>
                    </li>
                  </ul>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </SEGAProvider>
  );
};

export default SEGAPage; 