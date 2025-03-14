// @ts-nocheck
import { ethers } from 'ethers';

import SkillVestingABI from '../../../abi/SkillVesting.json';

// Contract address will need to be updated after deployment
const SKILL_VESTING_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

interface Log {
  topics: string[];
  data: string;
}

export interface MilestoneConfig {
  threshold: number; // e.g., 1000 followers, 50000 views
  unlockPercentage: number; // in basis points (1/100 of a percent) - 10000 = 100%
}

export interface VestingParams {
  tokenAddress: string;
  amount: string; // Amount in token's smallest unit
  oracleAddress: string; // Switchboard oracle address
  metricType: 'followers' | 'views' | 'likes';
  milestones: MilestoneConfig[];
}

export interface VestingSchedule {
  id: number;
  creator: string;
  tokenAddress: string;
  totalAmount: string;
  unlockedAmount: string;
  oracleAddress: string;
  metricType: string;
  active: boolean;
  milestones: {
    thresholds: number[];
    unlockPercentages: number[];
    reached: boolean[];
  };
}

export async function createVesting(
  params: VestingParams,
  signer: ethers.Signer
): Promise<number> {
  try {
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    
    // Approve token transfer first
    const tokenContract = new ethers.Contract(
      params.tokenAddress,
      ['function approve(address spender, uint256 amount) public returns (bool)'],
      signer
    );
    
    const approveTx = await tokenContract.approve(SKILL_VESTING_ADDRESS, params.amount);
    await approveTx.wait();
    
    // Prepare milestones
    const thresholds = params.milestones.map(m => m.threshold);
    const unlockPercentages = params.milestones.map(m => m.unlockPercentage);
    
    // Create vesting
    const tx = await vestingContract.createVesting(
      params.tokenAddress,
      params.amount,
      params.oracleAddress,
      params.metricType,
      thresholds,
      unlockPercentages
    );
    
    const receipt = await tx.wait();
    
    // Extract vesting ID from event logs
    const event = receipt?.logs?.find(
      (log) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('VestingCreated').format())
    );
    
    if (event) {
      const parsedLog = vestingContract.interface.parseLog({
        topics: event.topics,
        data: event.data
      });
      return Number(parsedLog?.args?.[0] || 0);
    }
    
    throw new Error('Vesting creation event not found');
  } catch (error) {
    console.error('Error creating vesting schedule:', error);
    throw error;
  }
}

export async function checkMilestones(
  vestingId: number,
  signer: ethers.Signer
): Promise<boolean> {
  try {
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    const tx = await vestingContract.checkMilestones(vestingId);
    const receipt = await tx.wait();
    
    // Check if any MilestoneReached events were emitted
    const events = receipt?.logs?.filter(
      (log) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('MilestoneReached').format())
    ).map((log) => {
      if (!log) return null;
      return vestingContract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });
    }).filter(Boolean);
    
    return events && events.length > 0;
  } catch (error) {
    console.error('Error checking milestones:', error);
    throw error;
  }
}

export async function withdrawUnlocked(
  vestingId: number,
  signer: ethers.Signer
): Promise<string> {
  try {
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    const tx = await vestingContract.withdrawUnlocked(vestingId);
    const receipt = await tx.wait();
    
    // Extract withdrawal amount from event logs
    const event = receipt?.logs?.find(
      (log) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('TokensWithdrawn').format())
    );
    
    if (event) {
      const parsedLog = vestingContract.interface.parseLog({
        topics: event.topics,
        data: event.data
      });
      return ethers.formatUnits(parsedLog?.args?.[2] || 0);
    }
    
    throw new Error('Token withdrawal event not found');
  } catch (error) {
    console.error('Error withdrawing unlocked tokens:', error);
    throw error;
  }
}

export async function getVestingSchedule(
  vestingId: number,
  provider: ethers.Provider
): Promise<VestingSchedule> {
  try {
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, provider);
    
    // Get vesting details
    const details = await vestingContract.getVestingSchedule(vestingId);
    
    // Get milestones
    const milestones = await vestingContract.getMilestones(vestingId);
    
    return {
      id: vestingId,
      creator: details[0],
      tokenAddress: details[1],
      totalAmount: ethers.formatUnits(details[2]),
      unlockedAmount: ethers.formatUnits(details[3]),
      oracleAddress: details[4],
      metricType: details[5],
      active: details[6],
      milestones: {
        thresholds: milestones[0].map((t) => Number(t)),
        unlockPercentages: milestones[1].map((p) => Number(p)),
        reached: milestones[2]
      }
    };
  } catch (error) {
    console.error('Error getting vesting schedule:', error);
    throw error;
  }
}

export async function getCreatorVestings(
  creatorAddress: string,
  provider: ethers.Provider
): Promise<number[]> {
  try {
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, provider);
    const vestingIds = await vestingContract.getCreatorVestings(creatorAddress);
    return vestingIds.map((id) => Number(id));
  } catch (error) {
    console.error('Error getting creator vestings:', error);
    throw error;
  }
} 