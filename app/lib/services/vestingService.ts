/**
 * @deprecated This file uses ethers.js for Ethereum integration which is no longer supported.
 * Please use sonicVestingService.ts for Solana integration.
 * 
 * Example usage:
 * ```
 * import { 
 *   createVesting, 
 *   checkMilestones, 
 *   withdrawUnlocked, 
 *   getVestingSchedule 
 * } from '@/app/lib/services/sonicVestingService';
 * ```
 */

// NOTE: This file is kept for reference purposes only and should not be used in new code.
// All new development should use the Solana integration in sonicVestingService.ts

// @ts-ignore: Intentionally keeping ethers reference for backwards compatibility
import { ethers } from 'ethers';

// @ts-ignore: This import may not exist anymore, keeping for reference
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

/**
 * @deprecated Use createVesting from sonicVestingService.ts instead
 */
export async function createVesting(
  params: VestingParams,
  // @ts-ignore: Using any to prevent ethers dependency errors
  signer: any
): Promise<number> {
  console.warn("DEPRECATED: Please use createVesting from sonicVestingService.ts instead");
  try {
    // @ts-ignore: Using any to prevent ethers dependency errors
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    
    // Approve token transfer first
    // @ts-ignore: Using any to prevent ethers dependency errors
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
      (log: any) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('VestingCreated').format())
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

/**
 * @deprecated Use checkMilestones from sonicVestingService.ts instead
 */
export async function checkMilestones(
  vestingId: number,
  // @ts-ignore: Using any to prevent ethers dependency errors
  signer: any
): Promise<boolean> {
  console.warn("DEPRECATED: Please use checkMilestones from sonicVestingService.ts instead");
  try {
    // @ts-ignore: Using any to prevent ethers dependency errors
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    const tx = await vestingContract.checkMilestones(vestingId);
    const receipt = await tx.wait();
    
    // Check if any MilestoneReached events were emitted
    const events = receipt?.logs?.filter(
      (log: any) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('MilestoneReached').format())
    ).map((log: any) => {
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

/**
 * @deprecated Use withdrawUnlocked from sonicVestingService.ts instead
 */
export async function withdrawUnlocked(
  vestingId: number,
  // @ts-ignore: Using any to prevent ethers dependency errors
  signer: any
): Promise<string> {
  console.warn("DEPRECATED: Please use withdrawUnlocked from sonicVestingService.ts instead");
  try {
    // @ts-ignore: Using any to prevent ethers dependency errors
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, signer);
    const tx = await vestingContract.withdrawUnlocked(vestingId);
    const receipt = await tx.wait();
    
    // Extract withdrawal amount from event logs
    const event = receipt?.logs?.find(
      (log: any) => log?.topics?.[0] === ethers.id(vestingContract.interface.getEvent('TokensWithdrawn').format())
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

/**
 * @deprecated Use getVestingSchedule from sonicVestingService.ts instead
 */
export async function getVestingSchedule(
  vestingId: number,
  // @ts-ignore: Using any to prevent ethers dependency errors
  provider: any
): Promise<VestingSchedule> {
  console.warn("DEPRECATED: Please use getVestingSchedule from sonicVestingService.ts instead");
  try {
    // @ts-ignore: Using any to prevent ethers dependency errors
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
        thresholds: milestones[0].map((t: any) => Number(t)),
        unlockPercentages: milestones[1].map((p: any) => Number(p)),
        reached: milestones[2]
      }
    };
  } catch (error) {
    console.error('Error getting vesting schedule:', error);
    throw error;
  }
}

/**
 * @deprecated Use getCreatorVestings from sonicVestingService.ts instead
 */
export async function getCreatorVestings(
  creatorAddress: string,
  // @ts-ignore: Using any to prevent ethers dependency errors
  provider: any
): Promise<number[]> {
  console.warn("DEPRECATED: Please use getCreatorVestings from sonicVestingService.ts instead");
  try {
    // @ts-ignore: Using any to prevent ethers dependency errors
    const vestingContract = new ethers.Contract(SKILL_VESTING_ADDRESS, SkillVestingABI.abi, provider);
    const vestingIds = await vestingContract.getCreatorVestings(creatorAddress);
    return vestingIds.map((id: any) => Number(id));
  } catch (error) {
    console.error('Error getting creator vestings:', error);
    throw error;
  }
} 