"use client";

import React, { useEffect, useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { LoadingCircle } from '../LoadingCircle';
import { 
  getCreatorVestings, 
  getVestingSchedule, 
  checkMilestones, 
  withdrawUnlocked, 
  VestingSchedule 
} from '@/app/lib/services/sonicVestingService';
import { CreateVesting } from './create-vesting';
import { PublicKey } from '@solana/web3.js';

export const VestingDashboard: React.FC = () => {
  const wallet = useWallet();
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [checkedMilestones, setCheckedMilestones] = useState<Record<number, boolean>>({});
  const [isWithdrawing, setIsWithdrawing] = useState<Record<number, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const loadVestingSchedules = async () => {
    if (!wallet.publicKey) return;
    
    try {
      setLoadingSchedules(true);
      
      // Get vesting IDs for this creator
      const vestingIds = await getCreatorVestings(
        wallet.publicKey.toString(),
        wallet
      );
      
      const schedules = await Promise.all(
        vestingIds.map(id => getVestingSchedule(id, wallet))
      );
      
      setVestingSchedules(schedules);
    } catch (error) {
      console.error('Error loading vesting schedules:', error);
      toast.error('Failed to load vesting schedules');
    } finally {
      setLoadingSchedules(false);
    }
  };
  
  useEffect(() => {
    if (wallet.publicKey) {
      loadVestingSchedules();
    }
  }, [wallet.publicKey]);
  
  const handleCheckMilestones = async (vestingId: number) => {
    try {
      setCheckedMilestones(prev => ({ ...prev, [vestingId]: true }));
      
      const reached = await checkMilestones(vestingId, wallet);
      
      if (reached) {
        toast.success('New milestone reached!');
        // Reload the vesting schedule to show updated state
        const updatedSchedule = await getVestingSchedule(vestingId, wallet);
        
        setVestingSchedules(prev => 
          prev.map(schedule => schedule.id === vestingId ? updatedSchedule : schedule)
        );
      } else {
        toast('No new milestones reached yet');
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
      toast.error('Failed to check milestones');
    } finally {
      setCheckedMilestones(prev => ({ ...prev, [vestingId]: false }));
    }
  };
  
  const handleWithdraw = async (vestingId: number) => {
    try {
      setIsWithdrawing(prev => ({ ...prev, [vestingId]: true }));
      
      const txSignature = await withdrawUnlocked(vestingId, wallet);
      
      toast.success('Successfully withdrawn tokens!');
      
      // Reload the vesting schedule to show updated state
      const updatedSchedule = await getVestingSchedule(vestingId, wallet);
      
      setVestingSchedules(prev => 
        prev.map(schedule => schedule.id === vestingId ? updatedSchedule : schedule)
      );
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
      toast.error('Failed to withdraw tokens');
    } finally {
      setIsWithdrawing(prev => ({ ...prev, [vestingId]: false }));
    }
  };
  
  const handleCreateSuccess = async (vestingId: number) => {
    setShowCreateModal(false);
    toast.success('Vesting schedule created successfully!');
    
    // Add the new schedule to the list
    try {
      const newSchedule = await getVestingSchedule(vestingId, wallet);
      setVestingSchedules(prev => [...prev, newSchedule]);
    } catch (error) {
      console.error('Error loading new vesting schedule:', error);
    }
  };
  
  // For demo purposes, add mock vesting schedules if none are loaded
  useEffect(() => {
    if (!loadingSchedules && vestingSchedules.length === 0 && wallet.publicKey) {
      // Add mock schedules for UI demonstration
      setVestingSchedules([
        {
          id: 1,
          creator: wallet.publicKey.toString(),
          tokenMintAddress: 'TokenMint11111111111111111111111111111111111',
          totalAmount: '10000',
          unlockedAmount: '2000',
          oracleAddress: 'OraCLEAddr1111111111111111111111111111111111',
          metricType: 'followers',
          active: true,
          milestones: {
            thresholds: [1000, 5000, 10000],
            unlockPercentages: [2000, 3000, 5000],
            reached: [true, false, false]
          }
        }
      ]);
    }
  }, [loadingSchedules, vestingSchedules, wallet.publicKey]);
  
  const formatTokenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  if (!wallet.publicKey) {
    return (
      <GlassCard className="p-5">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Skill Vesting</h2>
          <p className="text-white-400 mb-6">Connect your wallet to view your vesting schedules</p>
          <Button variant="glass">Connect Wallet</Button>
        </div>
      </GlassCard>
    );
  }
  
  return (
    <>
      <GlassCard className="p-5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Skill Vesting</h2>
          <Button 
            variant="glass" 
            onClick={() => setShowCreateModal(true)}
          >
            Create New Vesting
          </Button>
        </div>
        
        {loadingSchedules ? (
          <div className="flex justify-center py-8">
            <LoadingCircle />
            <span className="ml-2">Loading your vesting schedules...</span>
          </div>
        ) : vestingSchedules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white-400 mb-4">You don't have any vesting schedules yet</p>
            <Button 
              variant="glassColored"
              gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Vesting Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {vestingSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-white/5 rounded-lg border border-white/10 p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-white-400">Token</div>
                    <div className="font-semibold truncate">{formatTokenAddress(schedule.tokenMintAddress)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white-400">Total Amount</div>
                    <div className="font-semibold">{parseInt(schedule.totalAmount).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white-400">Metric Type</div>
                    <div className="font-semibold capitalize">{schedule.metricType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-white-400">Unlocked Amount</div>
                    <div className="font-semibold text-green-400">
                      {parseInt(schedule.unlockedAmount).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Milestones</div>
                  <div className="space-y-2">
                    {schedule.milestones.thresholds.map((threshold, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          schedule.milestones.reached[index] 
                            ? 'bg-green-500' 
                            : 'bg-white/10'
                        }`}></div>
                        <div className="flex-1">
                          {schedule.metricType === 'followers' ? `${threshold} followers` : 
                           schedule.metricType === 'views' ? `${threshold} views` : 
                           `${threshold} likes`}
                        </div>
                        <div className="text-sm">
                          {(schedule.milestones.unlockPercentages[index] / 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => handleCheckMilestones(schedule.id)}
                    disabled={checkedMilestones[schedule.id] || !wallet.connected}
                  >
                    {checkedMilestones[schedule.id] ? (
                      <>
                        <LoadingCircle />
                        Checking...
                      </>
                    ) : (
                      'Check Progress'
                    )}
                  </Button>
                  
                  <Button
                    variant="glassColored"
                    gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
                    size="sm"
                    onClick={() => handleWithdraw(schedule.id)}
                    disabled={
                      isWithdrawing[schedule.id] || 
                      Number(schedule.unlockedAmount) <= 0 || 
                      !wallet.connected
                    }
                  >
                    {isWithdrawing[schedule.id] ? (
                      <>
                        <LoadingCircle />
                        Claiming...
                      </>
                    ) : (
                      'Claim Unlocked Tokens'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
      
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-xl">
            <CreateVesting 
              onSuccess={handleCreateSuccess}
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}; 