/**
 * Migration Helper Functions
 * 
 * This file provides utility functions to help migrate data from Ethereum to Solana.
 * It can be used to map Ethereum data structures to their Solana equivalents.
 */

import { PublicKey } from '@solana/web3.js';
import { VestingSchedule as EthVestingSchedule } from '../services/vestingService';
import { VestingSchedule as SolVestingSchedule } from '../services/sonicVestingService';

/**
 * Checks if a string is a valid Solana public key
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * A very simple function to convert an Ethereum address to a Solana public key format
 * Note: This does NOT perform a REAL conversion - it just creates a deterministic mapping
 * for testing/demo purposes. Real migrations would need a more sophisticated approach.
 */
export function ethereumToSolanaAddress(ethAddress: string): string {
  if (!ethAddress.startsWith('0x')) {
    throw new Error('Not a valid Ethereum address format');
  }
  
  // Remove '0x' prefix and ensure the address is valid length
  const cleanAddress = ethAddress.slice(2).toLowerCase();
  if (cleanAddress.length !== 40) {
    throw new Error('Ethereum address must be 40 hex characters after 0x prefix');
  }
  
  // Create a base58-looking string from the hex address
  // This is just a synthetic conversion for display purposes!
  const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  
  // Simple algorithm to generate a deterministic Solana-like address
  for (let i = 0; i < cleanAddress.length; i += 2) {
    const byte = parseInt(cleanAddress.slice(i, i + 2), 16);
    result += base58Chars[byte % base58Chars.length];
  }
  
  // Pad to typical Solana address length
  while (result.length < 44) {
    result += base58Chars[0];
  }
  
  return result;
}

/**
 * Converts an Ethereum VestingSchedule object to a Solana VestingSchedule
 * This is useful for UI components that need to work with both formats during migration
 */
export function convertVestingSchedule(ethSchedule: EthVestingSchedule): SolVestingSchedule {
  return {
    id: ethSchedule.id,
    creator: ethereumToSolanaAddress(ethSchedule.creator),
    tokenMintAddress: ethereumToSolanaAddress(ethSchedule.tokenAddress),
    totalAmount: ethSchedule.totalAmount,
    unlockedAmount: ethSchedule.unlockedAmount,
    oracleAddress: ethereumToSolanaAddress(ethSchedule.oracleAddress),
    metricType: ethSchedule.metricType,
    active: ethSchedule.active,
    milestones: {
      thresholds: ethSchedule.milestones.thresholds,
      unlockPercentages: ethSchedule.milestones.unlockPercentages,
      reached: ethSchedule.milestones.reached
    }
  };
}

/**
 * Converts a token amount between Ethereum and Solana decimal conventions
 * Ethereum typically uses 18 decimals, Solana SPL tokens typically use 9
 */
export function convertTokenAmount(amount: string, fromDecimals: number = 18, toDecimals: number = 9): string {
  // Parse the amount to a BigInt to avoid floating point issues
  const amountValue = BigInt(amount);
  
  // Calculate the scaling factor
  const scalingFactor = BigInt(10) ** BigInt(Math.abs(fromDecimals - toDecimals));
  
  if (fromDecimals > toDecimals) {
    // Divide if we're going from higher precision to lower
    return (amountValue / scalingFactor).toString();
  } else if (fromDecimals < toDecimals) {
    // Multiply if we're going from lower precision to higher
    return (amountValue * scalingFactor).toString();
  } else {
    // Same decimal places, no conversion needed
    return amount;
  }
}

/**
 * Example usage of the migration helpers
 */
export function migrationExample(): void {
  console.log('Migration Helper Examples:');
  
  // Convert Ethereum address to Solana format
  const ethAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
  const solAddress = ethereumToSolanaAddress(ethAddress);
  console.log(`Eth address ${ethAddress} converted to Sol format: ${solAddress}`);
  
  // Convert token amount
  const ethAmount = '1000000000000000000'; // 1 ETH with 18 decimals
  const solAmount = convertTokenAmount(ethAmount, 18, 9);
  console.log(`Eth amount ${ethAmount} (18 decimals) converted to Sol format (9 decimals): ${solAmount}`);
  
  // Example Ethereum vesting schedule
  const ethSchedule: EthVestingSchedule = {
    id: 1,
    creator: '0x1234567890123456789012345678901234567890',
    tokenAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    totalAmount: '1000000000000000000000',
    unlockedAmount: '250000000000000000000',
    oracleAddress: '0x0987654321098765432109876543210987654321',
    metricType: 'followers',
    active: true,
    milestones: {
      thresholds: [1000, 5000, 10000],
      unlockPercentages: [2500, 2500, 5000],
      reached: [true, false, false]
    }
  };
  
  const solSchedule = convertVestingSchedule(ethSchedule);
  console.log('Converted vesting schedule:', solSchedule);
} 