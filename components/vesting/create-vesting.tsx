"use client";

import React, { useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { createVesting, MilestoneConfig } from '@/app/lib/services/sonicVestingService';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { LoadingCircle } from '../LoadingCircle';

interface CreateVestingProps {
  onSuccess?: (vestingId: number) => void;
  onClose: () => void;
}

// Predefined oracle addresses for different metrics (Solana public keys)
const ORACLES = {
  followers: 'FoLLWr61SZGbdZKFuhrGWiGPuDbPw97FG5cKwxZtBDmi', // Mock address
  views: 'ViEWSvC8CnpZPCNZKFuhrGWiGPuDbPw97FG5cKwxZtBDvi', // Mock address
  likes: 'LiKeSvC8CnpZPCNZKFuhrGWiGPuDbPw97FG5cKwxZtBDli'  // Mock address
};

export const CreateVesting: React.FC<CreateVestingProps> = ({ 
  onSuccess, 
  onClose 
}) => {
  const wallet = useWallet();
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('1000');
  const [metricType, setMetricType] = useState<'followers' | 'views' | 'likes'>('followers');
  const [milestones, setMilestones] = useState<MilestoneConfig[]>([
    { threshold: 1000, unlockPercentage: 2000 }, // 20%
    { threshold: 5000, unlockPercentage: 3000 }, // 30%
    { threshold: 10000, unlockPercentage: 5000 } // 50%
  ]);
  const [isCreating, setIsCreating] = useState(false);
  
  const handleAddMilestone = () => {
    setMilestones([...milestones, { threshold: 0, unlockPercentage: 0 }]);
  };
  
  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };
  
  const handleUpdateMilestone = (index: number, field: 'threshold' | 'unlockPercentage', value: number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index][field] = value;
    setMilestones(updatedMilestones);
  };
  
  const totalPercentage = milestones.reduce((sum, m) => sum + m.unlockPercentage, 0);
  const isValidPercentage = totalPercentage <= 10000;
  
  // Validate token address is a valid Solana public key
  const isValidTokenAddress = () => {
    try {
      if (!tokenAddress) return false;
      new PublicKey(tokenAddress);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  const handleCreateVesting = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    if (!isValidPercentage) {
      toast.error('Total percentage cannot exceed 100%');
      return;
    }
    
    if (!isValidTokenAddress()) {
      toast.error('Please enter a valid token address');
      return;
    }
    
    try {
      setIsCreating(true);
      
      const vestingParams = {
        tokenMintAddress: tokenAddress,
        amount: parseInt(amount),
        oracleAddress: ORACLES[metricType],
        metricType,
        milestones
      };
      
      const vestingId = await createVesting(vestingParams, wallet);
      
      toast.success('Vesting schedule created successfully!');
      
      if (onSuccess) {
        onSuccess(vestingId);
      }
    } catch (error) {
      console.error('Error creating vesting schedule:', error);
      toast.error('Failed to create vesting schedule');
    } finally {
      setIsCreating(false);
    }
  };
  
  const formatPercentage = (basisPoints: number) => {
    return `${basisPoints / 100}%`;
  };
  
  return (
    <GlassCard className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Create Skill Vesting</h2>
        <button 
          onClick={onClose}
          className="text-white-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Token Address</label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className={`w-full bg-white/5 border ${!tokenAddress || isValidTokenAddress() ? 'border-white/10' : 'border-red-500'} rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Token mint address"
          />
          {tokenAddress && !isValidTokenAddress() && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid Solana address</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Amount to Vest</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Amount of tokens to vest"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Metric Type</label>
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as 'followers' | 'views' | 'likes')}
            className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="followers">Followers</option>
            <option value="views">Content Views</option>
            <option value="likes">Likes</option>
          </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Milestones</label>
            <Button 
              variant="glass" 
              size="sm"
              onClick={handleAddMilestone}
              className="text-xs"
            >
              Add Milestone
            </Button>
          </div>
          
          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/5 p-3 rounded-md">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Threshold</label>
                  <input
                    type="number"
                    value={milestone.threshold}
                    onChange={(e) => handleUpdateMilestone(index, 'threshold', parseInt(e.target.value))}
                    className="w-full bg-white/10 border border-white/10 rounded-md p-1.5 text-white text-sm"
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1">Unlock %</label>
                  <input
                    type="number"
                    value={milestone.unlockPercentage / 100}
                    onChange={(e) => handleUpdateMilestone(index, 'unlockPercentage', parseFloat(e.target.value) * 100)}
                    className="w-full bg-white/10 border border-white/10 rounded-md p-1.5 text-white text-sm"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <button
                  onClick={() => handleRemoveMilestone(index)}
                  className="mt-5 text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <div className={`mt-2 text-sm ${isValidPercentage ? 'text-green-400' : 'text-red-400'}`}>
            Total: {totalPercentage / 100}% {!isValidPercentage && '(cannot exceed 100%)'}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="glassColored"
            gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
            onClick={handleCreateVesting}
            disabled={isCreating || !isValidPercentage || !isValidTokenAddress() || !wallet.connected}
            className="cursor-pointer"
          >
            {isCreating ? (
              <>
                <LoadingCircle />
                Creating Vesting
              </>
            ) : (
              'Create Vesting Schedule'
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}; 