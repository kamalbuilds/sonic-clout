"use client";

import React, { useState } from 'react';
import SEGAProvider from '@/context/SEGAContext';
import SEGASwap from '@/components/trading/sega-swap';
import SEGAPools from '@/components/trading/sega-pools';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const SEGAPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'pools'>('swap');

  return (
    <SEGAProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <GlassCard
            variant="colored"
            gradient="rgba(138, 43, 226, 0.3), rgba(56, 189, 248, 0.3)"
            className="p-6 mb-8"
            glassBefore={true}
            glassHighlight={true}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Image
                  src="/sega-logo.svg"
                  alt="SEGA Logo"
                  width={48}
                  height={48}
                  className="mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>SEGA Protocol</h1>
                  <p className="text-white/70">The first decentralized AMM on Sonic SVM</p>
                </div>
              </div>
              <a 
                href="https://explorer.sonic.game/tx/mWxTi8Bbt4n3hZ4CyKT48MXdwcXJAu5UkFFMjcz8ZS3HVmZHazTxXvA4z6kKLbrLVvdiERvCvSyqD5zbCXbBizf?cluster=mainnet-alpha"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white/80"
              >
                View on Explorer →
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-sm text-white/70 mb-1">Total Value Locked</div>
                <div className="text-2xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>$18.3M</div>
                <div className="text-xs text-green-400">+5.2% (24h)</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-sm text-white/70 mb-1">Volume (24h)</div>
                <div className="text-2xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>$2.4M</div>
                <div className="text-xs text-green-400">+12.5% (24h)</div>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-sm text-white/70 mb-1">Active Pools</div>
                <div className="text-2xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>12</div>
                <div className="text-xs text-blue-400">2 new this week</div>
              </div>
            </div>
          </GlassCard>
          
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex">
              <Button
                variant={activeTab === 'swap' ? 'glassColored' : 'glass'}
                gradient={activeTab === 'swap' ? 'rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)' : undefined}
                className="rounded-full px-8 py-2"
                onClick={() => setActiveTab('swap')}
              >
                Swap
              </Button>
              <Button
                variant={activeTab === 'pools' ? 'glassColored' : 'glass'}
                gradient={activeTab === 'pools' ? 'rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)' : undefined}
                className="rounded-full px-8 py-2"
                onClick={() => setActiveTab('pools')}
              >
                Pools
              </Button>
            </div>
          </div>
          
          <div className="md:grid md:grid-cols-2 gap-6">
            {activeTab === 'swap' ? (
              <>
                <div className="mb-6 md:mb-0">
                  <SEGASwap />
                </div>
                <div>
                  <GlassCard
                    variant="light"
                    className="p-6"
                    hover="scale"
                  >
                    <h2 className="text-xl font-bold mb-4 tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>Why SEGA is Different</h2>
                    <ul className="space-y-3">
                      <li className="flex">
                        <div className="bg-blue-500/20 rounded-full p-2 mr-3">
                          <span className="text-xl">⚡</span>
                        </div>
                        <div>
                          <h3 className="font-medium tracking-wide mb-1">Faster and Cheaper</h3>
                          <p className="text-sm text-white/70">Built on Sonic SVM, SEGA offers transaction speeds that outpace Solana with far lower gas fees.</p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                          <span className="text-xl">🔓</span>
                        </div>
                        <div>
                          <h3 className="font-medium tracking-wide mb-1">Permissionless Pool Creation</h3>
                          <p className="text-sm text-white/70">Users and projects can easily create pools for any asset, unlocking seamless liquidity provision.</p>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="bg-pink-500/20 rounded-full p-2 mr-3">
                          <span className="text-xl">💎</span>
                        </div>
                        <div>
                          <h3 className="font-medium tracking-wide mb-1">Ecosystem Rewards</h3>
                          <p className="text-sm text-white/70">Add token incentives to any pair or pool to boost yields for liquidity providers.</p>
                        </div>
                      </li>
                    </ul>
                  </GlassCard>
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <SEGAPools />
              </div>
            )}
          </div>
        </div>
      </div>
    </SEGAProvider>
  );
};

export default SEGAPage; 