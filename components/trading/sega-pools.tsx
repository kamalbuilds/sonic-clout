"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSEGA, Pool } from '@/context/SEGAContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useWallet } from '@solana/wallet-adapter-react';

export const SEGAPools: React.FC = () => {
  const { pools, userLiquidity, addLiquidity, removeLiquidity, fetchPools, isLoading } = useSEGA();
  const { connected } = useWallet();
  
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [view, setView] = useState<'pools' | 'add' | 'remove'>('pools');
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(50);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amountA || !amountB) return;
    
    try {
      const success = await addLiquidity(
        selectedPool.id,
        parseFloat(amountA),
        parseFloat(amountB)
      );
      
      if (success) {
        alert('Liquidity added successfully!');
        setAmountA('');
        setAmountB('');
        setView('pools');
        fetchPools();
      }
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      alert('Failed to add liquidity. Please try again.');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool) return;
    
    try {
      const success = await removeLiquidity(
        selectedPool.id,
        percentage
      );
      
      if (success) {
        alert('Liquidity removed successfully!');
        setPercentage(50);
        setView('pools');
        fetchPools();
      }
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      alert('Failed to remove liquidity. Please try again.');
    }
  };

  const calculateShareOfPool = (amountA: string, amountB: string, pool: Pool): string => {
    if (!amountA || !amountB) return '0.00';
    
    // Mock calculation - in a real app this would use the actual formulas
    const contribution = (parseFloat(amountA) + parseFloat(amountB)) / 2;
    const sharePercentage = (contribution / (pool.liquidity + contribution)) * 100;
    
    return sharePercentage.toFixed(4);
  };

  const getUserLiquidityForPool = (poolId: string): number => {
    const userPool = userLiquidity.find(p => p.poolId === poolId);
    return userPool ? userPool.amount : 0;
  };

  // Render add liquidity form
  const renderAddLiquidityForm = () => {
    if (!selectedPool) return null;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setView('pools')}
            className="text-sm text-white/70 hover:text-white flex items-center"
          >
            ← Back to Pools
          </button>
          <h3 className="text-lg font-medium">Add Liquidity</h3>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">{selectedPool.token0.symbol}</span>
            <span className="text-sm text-white/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-xl w-full outline-none mr-2"
            />
            <div className="flex items-center gap-2">
              <button 
                className="text-xs bg-white/10 px-2 py-1 rounded-full"
                onClick={() => setAmountA('1000')} // Mock max
              >
                MAX
              </button>
              <div className="flex items-center bg-white/15 rounded-full px-3 py-1">
                {selectedPool.token0.logoURI && (
                  <Image
                    src={selectedPool.token0.logoURI}
                    alt={selectedPool.token0.symbol}
                    width={20}
                    height={20}
                    className="mr-2 rounded-full"
                  />
                )}
                <span className="font-medium">{selectedPool.token0.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-white/60">+</div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">{selectedPool.token1.symbol}</span>
            <span className="text-sm text-white/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-xl w-full outline-none mr-2"
            />
            <div className="flex items-center gap-2">
              <button 
                className="text-xs bg-white/10 px-2 py-1 rounded-full"
                onClick={() => setAmountB('1000')} // Mock max
              >
                MAX
              </button>
              <div className="flex items-center bg-white/15 rounded-full px-3 py-1">
                {selectedPool.token1.logoURI && (
                  <Image
                    src={selectedPool.token1.logoURI}
                    alt={selectedPool.token1.symbol}
                    width={20}
                    height={20}
                    className="mr-2 rounded-full"
                  />
                )}
                <span className="font-medium">{selectedPool.token1.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 mb-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-white/70">Current Pool Rate</span>
            <span className="font-medium">
              1 {selectedPool.token0.symbol} = {(selectedPool.token0.symbol === 'SOL' && selectedPool.token1.symbol === 'USDC') ? '100' : '1'} {selectedPool.token1.symbol}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Share of Pool</span>
            <span className="font-medium">
              {calculateShareOfPool(amountA, amountB, selectedPool)}%
            </span>
          </div>
        </div>
        
        <Button
          variant="glassColored"
          gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
          className="w-full py-3 text-base font-medium"
          disabled={!connected || !amountA || !amountB || isLoading}
          onClick={handleAddLiquidity}
        >
          {!connected
            ? 'Connect Wallet'
            : !amountA || !amountB
            ? 'Enter Amounts'
            : isLoading
            ? 'Adding Liquidity...'
            : 'Add Liquidity'}
        </Button>
      </div>
    );
  };

  // Render remove liquidity form
  const renderRemoveLiquidityForm = () => {
    if (!selectedPool) return null;
    
    const userLiquidityAmount = getUserLiquidityForPool(selectedPool.id);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setView('pools')}
            className="text-sm text-white/70 hover:text-white flex items-center"
          >
            ← Back to Pools
          </button>
          <h3 className="text-lg font-medium">Remove Liquidity</h3>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="relative mr-2">
                {selectedPool.token0.logoURI && (
                  <Image
                    src={selectedPool.token0.logoURI}
                    alt={selectedPool.token0.symbol}
                    width={24}
                    height={24}
                    className="rounded-full absolute top-0 left-0"
                  />
                )}
                {selectedPool.token1.logoURI && (
                  <Image
                    src={selectedPool.token1.logoURI}
                    alt={selectedPool.token1.symbol}
                    width={24}
                    height={24}
                    className="rounded-full absolute top-0 left-3"
                  />
                )}
                <div className="w-8 h-6"></div>
              </div>
              <span className="font-medium">
                {selectedPool.token0.symbol}/{selectedPool.token1.symbol} LP
              </span>
            </div>
            <span className="text-sm text-white/70">
              Balance: {userLiquidityAmount.toFixed(6)}
            </span>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Amount to remove</span>
              <span>{percentage}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <button 
                className={`text-xs rounded-full px-2 py-1 ${percentage === 25 ? 'bg-white/20' : 'bg-white/10'}`}
                onClick={() => setPercentage(25)}
              >
                25%
              </button>
              <button 
                className={`text-xs rounded-full px-2 py-1 ${percentage === 50 ? 'bg-white/20' : 'bg-white/10'}`}
                onClick={() => setPercentage(50)}
              >
                50%
              </button>
              <button 
                className={`text-xs rounded-full px-2 py-1 ${percentage === 75 ? 'bg-white/20' : 'bg-white/10'}`}
                onClick={() => setPercentage(75)}
              >
                75%
              </button>
              <button 
                className={`text-xs rounded-full px-2 py-1 ${percentage === 100 ? 'bg-white/20' : 'bg-white/10'}`}
                onClick={() => setPercentage(100)}
              >
                100%
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-3 mb-1">
          <div className="text-sm font-medium mb-2">You will receive:</div>
          <div className="flex justify-between text-sm mb-1">
            <div className="flex items-center">
              {selectedPool.token0.logoURI && (
                <Image
                  src={selectedPool.token0.logoURI}
                  alt={selectedPool.token0.symbol}
                  width={16}
                  height={16}
                  className="mr-1 rounded-full"
                />
              )}
              <span>{((userLiquidityAmount * percentage / 100) * 10).toFixed(6)} {selectedPool.token0.symbol}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              {selectedPool.token1.logoURI && (
                <Image
                  src={selectedPool.token1.logoURI}
                  alt={selectedPool.token1.symbol}
                  width={16}
                  height={16}
                  className="mr-1 rounded-full"
                />
              )}
              <span>{((userLiquidityAmount * percentage / 100) * 10).toFixed(6)} {selectedPool.token1.symbol}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="glassColored"
          gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
          className="w-full py-3 text-base font-medium"
          disabled={!connected || userLiquidityAmount <= 0 || isLoading}
          onClick={handleRemoveLiquidity}
        >
          {!connected
            ? 'Connect Wallet'
            : userLiquidityAmount <= 0
            ? 'No Liquidity to Remove'
            : isLoading
            ? 'Removing Liquidity...'
            : 'Remove Liquidity'}
        </Button>
      </div>
    );
  };

  // Render pools list
  const renderPoolsList = () => {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>SEGA Liquidity Pools</h2>
          <Button
            variant="glass"
            size="sm"
            className="text-sm"
            disabled={!connected}
            onClick={() => {
              if (pools.length > 0) {
                setSelectedPool(pools[0]);
                setView('add');
              }
            }}
          >
            + Add Liquidity
          </Button>
        </div>

        {pools.length === 0 ? (
          <div className="text-center py-10 text-white/60">
            No pools available
          </div>
        ) : (
          <div className="space-y-3">
            {pools.map((pool) => {
              const userLiquidityAmount = getUserLiquidityForPool(pool.id);
              
              return (
                <GlassCard
                  key={pool.id}
                  variant="light"
                  className="p-4"
                  hover="scale"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="relative mr-2">
                        {pool.token0.logoURI && (
                          <Image
                            src={pool.token0.logoURI}
                            alt={pool.token0.symbol}
                            width={24}
                            height={24}
                            className="rounded-full absolute top-0 left-0"
                          />
                        )}
                        {pool.token1.logoURI && (
                          <Image
                            src={pool.token1.logoURI}
                            alt={pool.token1.symbol}
                            width={24}
                            height={24}
                            className="rounded-full absolute top-0 left-3"
                          />
                        )}
                        <div className="w-8 h-6"></div>
                      </div>
                      <span className="font-medium">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </span>
                    </div>
                    <span className="text-sm bg-white/10 px-2 py-1 rounded-full">
                      {(pool.fee * 100).toFixed(2)}% Fee
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-md p-2">
                      <div className="text-xs text-white/70 mb-1">TVL</div>
                      <div className="font-medium">${pool.liquidity.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-md p-2">
                      <div className="text-xs text-white/70 mb-1">Volume (24h)</div>
                      <div className="font-medium">${pool.volume24h.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 rounded-md p-2">
                      <div className="text-xs text-white/70 mb-1">APR</div>
                      <div className="font-medium text-green-400">{pool.apr.toFixed(1)}%</div>
                    </div>
                  </div>

                  {userLiquidityAmount > 0 && (
                    <div className="bg-white/10 rounded-md p-2 mb-3">
                      <div className="text-xs text-white/70 mb-1">Your Liquidity</div>
                      <div className="font-medium">${(userLiquidityAmount * 2).toLocaleString()}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="glassColored"
                      gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPool(pool);
                        setView('add');
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      disabled={userLiquidityAmount <= 0}
                      onClick={() => {
                        setSelectedPool(pool);
                        setView('remove');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <GlassCard
      variant="colored"
      gradient="rgba(138, 43, 226, 0.3), rgba(56, 189, 248, 0.3)"
      className="p-6"
      glassBefore={true}
      glassHighlight={true}
    >
      {view === 'pools' && renderPoolsList()}
      {view === 'add' && renderAddLiquidityForm()}
      {view === 'remove' && renderRemoveLiquidityForm()}
      
      {view === 'pools' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-white/60">
            Powered by SEGA on Sonic SVM • Fee Tier: 0.25%
          </p>
        </div>
      )}
    </GlassCard>
  );
};

export default SEGAPools; 