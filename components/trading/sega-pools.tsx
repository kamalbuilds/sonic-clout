"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSEGA, Pool } from '@/context/SEGAContext';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { useWallet } from '@solana/wallet-adapter-react';
import { LoadingCircle } from '@/components/LoadingCircle';
import { toast } from 'react-hot-toast';

export const SEGAPools: React.FC = () => {
  const { pools, userLiquidity, addLiquidity, removeLiquidity, fetchPools, poolsLoading } = useSEGA();
  const { connected } = useWallet();
  
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [view, setView] = useState<'pools' | 'add' | 'remove'>('pools');
  const [amountA, setAmountA] = useState<string>('');
  const [amountB, setAmountB] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(50);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isRemovingLiquidity, setIsRemovingLiquidity] = useState(false);

  useEffect(() => {
    fetchPools();
  }, [fetchPools]);

  const handleAddLiquidity = async () => {
    if (!selectedPool || !amountA || !amountB) return;
    
    try {
      setIsAddingLiquidity(true);
      
      const success = await addLiquidity(
        selectedPool.id,
        parseFloat(amountA),
        parseFloat(amountB)
      );
      
      if (success) {
        toast.success('Liquidity added successfully!');
        setAmountA('');
        setAmountB('');
        setView('pools');
        fetchPools();
      }
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      toast.error('Failed to add liquidity. Please try again.');
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedPool) return;
    
    try {
      setIsRemovingLiquidity(true);
      
      const success = await removeLiquidity(
        selectedPool.id,
        percentage
      );
      
      if (success) {
        toast.success('Liquidity removed successfully!');
        setPercentage(50);
        setView('pools');
        fetchPools();
      }
    } catch (error) {
      console.error('Failed to remove liquidity:', error);
      toast.error('Failed to remove liquidity. Please try again.');
    } finally {
      setIsRemovingLiquidity(false);
    }
  };

  const calculateShareOfPool = (amountA: string, amountB: string, pool: Pool): string => {
    if (!amountA || !amountB) return '0.00';
    
    // Mock calculation - in a real app this would use the actual formulas
    const contribution = (parseFloat(amountA) + parseFloat(amountB)) / 2;
    const sharePercentage = (contribution / (pool.liquidity + contribution)) * 100;
    
    return sharePercentage.toFixed(4);
  };

  const getUserLiquidityForPool = (poolId: string) => {
    const liquidity = userLiquidity.find(l => l.poolId === poolId);
    return liquidity ? liquidity.amount : 0;
  };

  const renderPoolsList = () => {
    if (!poolsLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <LoadingCircle size="large" />
          <span className="ml-2">Loading pools...</span>
        </div>
      );
    }

    if (pools.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-white/70">No liquidity pools found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {pools.map(pool => (
          <GlassCard
            key={pool.id}
            variant="light"
            className="p-4 hover:translate-y-[-2px] transition-all duration-200"
            hover="glow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative mr-3">
                  {pool.token0.logoURI && (
                    <Image
                      src={pool.token0.logoURI}
                      alt={pool.token0.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  {pool.token1.logoURI && (
                    <Image
                      src={pool.token1.logoURI}
                      alt={pool.token1.symbol}
                      width={32}
                      height={32}
                      className="rounded-full absolute -bottom-1 -right-1 border-2 border-black/50"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-medium tracking-wide">{pool.token0.symbol} / {pool.token1.symbol}</h3>
                  <p className="text-xs text-white/70">Fee: {(pool.fee * 100).toFixed(2)}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${(pool.liquidity).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-white/70">TVL</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-3 text-center">
              <div>
                <p className="font-medium">${(pool.volume24h).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-white/70">24h Volume</p>
              </div>
              <div>
                <p className="font-medium">{pool.apr.toFixed(2)}%</p>
                <p className="text-xs text-white/70">APR</p>
              </div>
              <div>
                <p className="font-medium">${getUserLiquidityForPool(pool.id).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-white/70">Your Liquidity</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              {getUserLiquidityForPool(pool.id) > 0 && (
                <Button 
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    setSelectedPool(pool);
                    setView('remove');
                  }}
                >
                  Remove
                </Button>
              )}
              <Button
                variant="glassColored"
                gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
                size="sm"
                onClick={() => {
                  setSelectedPool(pool);
                  setView('add');
                }}
              >
                Add Liquidity
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  const renderAddLiquidityForm = () => {
    if (!selectedPool) return null;
    
    return (
      <GlassCard
        variant="colored"
        gradient="rgba(138, 43, 226, 0.3), rgba(56, 189, 248, 0.3)"
        className="p-6"
        glassBefore={true}
        glassHighlight={true}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
            Add Liquidity
          </h3>
          <div className="flex items-center">
            {selectedPool.token0.logoURI && (
              <Image
                src={selectedPool.token0.logoURI}
                alt={selectedPool.token0.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            {selectedPool.token1.logoURI && (
              <Image
                src={selectedPool.token1.logoURI}
                alt={selectedPool.token1.symbol}
                width={24}
                height={24}
                className="rounded-full ml-1"
              />
            )}
            <span className="ml-2 font-medium">
              {selectedPool.token0.symbol}/{selectedPool.token1.symbol}
            </span>
          </div>
        </div>
        
        {/* Token A Input */}
        <div className="rounded-xl bg-white/10 p-4 mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">Amount {selectedPool.token0.symbol}</span>
            <span className="text-sm text-white/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-xl w-full outline-none mr-2"
              disabled={isAddingLiquidity}
            />
            <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
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
        
        {/* Token B Input */}
        <div className="rounded-xl bg-white/10 p-4 mb-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">Amount {selectedPool.token1.symbol}</span>
            <span className="text-sm text-white/70">Balance: 0.00</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-xl w-full outline-none mr-2"
              disabled={isAddingLiquidity}
            />
            <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
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
        
        <div className="flex space-x-2">
          <Button
            variant="glass"
            className="flex-1"
            onClick={() => setView('pools')}
            disabled={isAddingLiquidity}
          >
            Cancel
          </Button>
          <Button
            variant="glassColored"
            gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
            className="flex-1"
            disabled={!amountA || !amountB || isAddingLiquidity}
            onClick={handleAddLiquidity}
          >
            {isAddingLiquidity ? (
              <div className="flex items-center justify-center">
                <LoadingCircle size="small" />
                <span className="ml-2">Adding...</span>
              </div>
            ) : (
              'Add Liquidity'
            )}
          </Button>
        </div>
      </GlassCard>
    );
  };

  const renderRemoveLiquidityForm = () => {
    if (!selectedPool) return null;
    
    const userLiquidity = getUserLiquidityForPool(selectedPool.id);
    
    return (
      <GlassCard
        variant="colored"
        gradient="rgba(138, 43, 226, 0.3), rgba(56, 189, 248, 0.3)"
        className="p-6"
        glassBefore={true}
        glassHighlight={true}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
            Remove Liquidity
          </h3>
          <div className="flex items-center">
            {selectedPool.token0.logoURI && (
              <Image
                src={selectedPool.token0.logoURI}
                alt={selectedPool.token0.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            {selectedPool.token1.logoURI && (
              <Image
                src={selectedPool.token1.logoURI}
                alt={selectedPool.token1.symbol}
                width={24}
                height={24}
                className="rounded-full ml-1"
              />
            )}
            <span className="ml-2 font-medium">
              {selectedPool.token0.symbol}/{selectedPool.token1.symbol}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-white/70 mb-1">Your Liquidity</p>
          <p className="text-xl font-bold">${userLiquidity.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-white/70">Amount to Remove: {percentage}%</span>
            <span className="text-sm font-medium">${(userLiquidity * percentage / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            disabled={isRemovingLiquidity}
          />
          <div className="flex justify-between mt-2 text-xs text-white/70">
            <span>1%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div className="rounded-xl bg-white/10 p-4 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-white/70">You will receive:</span>
              <div className="flex items-center mt-2">
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
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
                <span className="ml-2 font-medium">≈ 0.00</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-white/70">&nbsp;</span>
              <div className="flex items-center mt-2">
                <div className="flex items-center bg-white/10 rounded-full px-3 py-1">
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
                <span className="ml-2 font-medium">≈ 0.00</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="glass"
            className="flex-1"
            onClick={() => setView('pools')}
            disabled={isRemovingLiquidity}
          >
            Cancel
          </Button>
          <Button
            variant="glassColored"
            gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
            className="flex-1"
            disabled={isRemovingLiquidity}
            onClick={handleRemoveLiquidity}
          >
            {isRemovingLiquidity ? (
              <div className="flex items-center justify-center">
                <LoadingCircle size="small" />
                <span className="ml-2">Removing...</span>
              </div>
            ) : (
              'Remove Liquidity'
            )}
          </Button>
        </div>
      </GlassCard>
    );
  };

  return (
    <div>
      {view === 'pools' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold tracking-wide" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              Liquidity Pools
            </h2>
            <Button
              variant="glassColored"
              gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
              size="sm"
              onClick={() => fetchPools()}
              disabled={poolsLoading}
            >
              {poolsLoading ? <LoadingCircle size="small" /> : 'Refresh'}
            </Button>
          </div>
          {renderPoolsList()}
        </>
      )}
      
      {view === 'add' && renderAddLiquidityForm()}
      
      {view === 'remove' && renderRemoveLiquidityForm()}
    </div>
  );
};

export default SEGAPools; 