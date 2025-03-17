"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import {
  initializeVesting,
  createVesting,
  checkMilestones,
  withdrawUnlocked,
  getVestingSchedule,
  getCreatorVestings,
  VestingParams,
  VestingSchedule,
  MilestoneConfig
} from '@/app/lib/services/sonicVestingService';

// Define context types
interface SonicVestingContextType {
  // State
  isInitializing: boolean;
  isCreatingVesting: boolean;
  isCheckingMilestones: boolean;
  isWithdrawing: boolean;
  isFetchingVestings: boolean;
  vestingSchedules: VestingSchedule[];
  selectedVestingId: number | null;
  
  // Actions
  initialize: () => Promise<void>;
  createVestingSchedule: (params: VestingParams) => Promise<number>;
  checkVestingMilestones: (vestingId: number) => Promise<boolean>;
  withdrawVestedTokens: (vestingId: number) => Promise<string>;
  fetchVestingSchedules: () => Promise<void>;
  selectVestingSchedule: (vestingId: number | null) => void;
}

const SonicVestingContext = createContext<SonicVestingContextType | undefined>(undefined);

export function useSonicVesting() {
  const context = useContext(SonicVestingContext);
  if (!context) {
    throw new Error('useSonicVesting must be used within a SonicVestingProvider');
  }
  return context;
}

export function SonicVestingProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  
  // State
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingVesting, setIsCreatingVesting] = useState(false);
  const [isCheckingMilestones, setIsCheckingMilestones] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isFetchingVestings, setIsFetchingVestings] = useState(false);
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [selectedVestingId, setSelectedVestingId] = useState<number | null>(null);
  
  // Fetch vesting schedules when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchVestingSchedules();
    } else {
      // Clear state when wallet disconnects
      setVestingSchedules([]);
      setSelectedVestingId(null);
    }
  }, [wallet.connected, wallet.publicKey]);
  
  /**
   * Initialize the vesting program
   */
  const initialize = async (): Promise<void> => {
    if (!wallet.connected || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    try {
      setIsInitializing(true);
      await initializeVesting(wallet);
      toast.success('Vesting program initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vesting program:', error);
      toast.error('Failed to initialize vesting program');
    } finally {
      setIsInitializing(false);
    }
  };
  
  /**
   * Create a new vesting schedule
   */
  const createVestingSchedule = async (params: VestingParams): Promise<number> => {
    if (!wallet.connected || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsCreatingVesting(true);
      const vestingId = await createVesting(params, wallet);
      toast.success('Vesting schedule created successfully');
      
      // Refresh the list of vesting schedules
      await fetchVestingSchedules();
      
      return vestingId;
    } catch (error) {
      console.error('Failed to create vesting schedule:', error);
      toast.error('Failed to create vesting schedule');
      throw error;
    } finally {
      setIsCreatingVesting(false);
    }
  };
  
  /**
   * Check if any milestones have been reached for a vesting schedule
   */
  const checkVestingMilestones = async (vestingId: number): Promise<boolean> => {
    if (!wallet.connected || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsCheckingMilestones(true);
      const milestonesReached = await checkMilestones(vestingId, wallet);
      
      if (milestonesReached) {
        toast.success('New milestones reached!');
        
        // Refresh the selected vesting schedule
        await refreshVestingSchedule(vestingId);
      } else {
        toast('No new milestones reached');
      }
      
      return milestonesReached;
    } catch (error) {
      console.error('Failed to check milestones:', error);
      toast.error('Failed to check milestones');
      throw error;
    } finally {
      setIsCheckingMilestones(false);
    }
  };
  
  /**
   * Withdraw vested tokens
   */
  const withdrawVestedTokens = async (vestingId: number): Promise<string> => {
    if (!wallet.connected || !wallet.signTransaction) {
      toast.error('Please connect your wallet first');
      throw new Error('Wallet not connected');
    }
    
    try {
      setIsWithdrawing(true);
      const tx = await withdrawUnlocked(vestingId, wallet);
      toast.success('Tokens withdrawn successfully');
      
      // Refresh the selected vesting schedule
      await refreshVestingSchedule(vestingId);
      
      return tx;
    } catch (error) {
      console.error('Failed to withdraw tokens:', error);
      toast.error('Failed to withdraw tokens');
      throw error;
    } finally {
      setIsWithdrawing(false);
    }
  };
  
  /**
   * Fetch all vesting schedules for the connected wallet
   */
  const fetchVestingSchedules = async (): Promise<void> => {
    if (!wallet.connected || !wallet.publicKey) {
      setVestingSchedules([]);
      return;
    }
    
    try {
      setIsFetchingVestings(true);
      
      // Get vesting IDs for the connected wallet
      const vestingIds = await getCreatorVestings(wallet.publicKey.toString(), wallet);
      
      // Fetch details for each vesting schedule
      const schedules: VestingSchedule[] = [];
      for (const id of vestingIds) {
        try {
          const schedule = await getVestingSchedule(id, wallet);
          schedules.push(schedule);
        } catch (error) {
          console.error(`Error fetching vesting schedule ${id}:`, error);
        }
      }
      
      setVestingSchedules(schedules);
    } catch (error) {
      console.error('Failed to fetch vesting schedules:', error);
      toast.error('Failed to fetch vesting schedules');
    } finally {
      setIsFetchingVestings(false);
    }
  };
  
  /**
   * Refresh a specific vesting schedule
   */
  const refreshVestingSchedule = async (vestingId: number): Promise<void> => {
    try {
      const updatedSchedule = await getVestingSchedule(vestingId, wallet);
      
      // Update the vesting schedules list
      setVestingSchedules(prevSchedules => 
        prevSchedules.map(schedule => 
          schedule.id === vestingId ? updatedSchedule : schedule
        )
      );
    } catch (error) {
      console.error(`Failed to refresh vesting schedule ${vestingId}:`, error);
    }
  };
  
  /**
   * Select a vesting schedule
   */
  const selectVestingSchedule = (vestingId: number | null): void => {
    setSelectedVestingId(vestingId);
  };
  
  const value = {
    // State
    isInitializing,
    isCreatingVesting,
    isCheckingMilestones,
    isWithdrawing,
    isFetchingVestings,
    vestingSchedules,
    selectedVestingId,
    
    // Actions
    initialize,
    createVestingSchedule,
    checkVestingMilestones,
    withdrawVestedTokens,
    fetchVestingSchedules,
    selectVestingSchedule
  };
  
  return (
    <SonicVestingContext.Provider value={value}>
      {children}
    </SonicVestingContext.Provider>
  );
} 