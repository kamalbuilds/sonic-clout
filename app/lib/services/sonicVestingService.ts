// Sonic Vesting Service for Solana
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet, Idl } from '@coral-xyz/anchor';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync
} from '@solana/spl-token';
import { Buffer } from 'buffer';

// Define interfaces for our Solana program account types
interface VestingStateAccount {
  authority: PublicKey;
  vestingIdCounter: BN;
}

interface MilestoneData {
  threshold: BN;
  unlockPercentage: BN;
  reached: boolean;
}

interface VestingScheduleAccount {
  creator: PublicKey;
  tokenMint: PublicKey;
  totalAmount: BN;
  unlockedAmount: BN;
  oracleAddress: PublicKey;
  metricType: string;
  active: boolean;
  vestingId: BN;
  milestones: MilestoneData[];
}

interface CreatorVestingsAccount {
  creator: PublicKey;
  vestingIds: BN[];
}

// Load IDL - In production you'd import the IDL from the build output
// This is a placeholder IDL structure based on the contract code
const SKILL_VESTING_IDL: Idl = {
  version: "0.1.0",
  name: "skill_vesting",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "vestingState", isMut: true, isSigner: true },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    },
    {
      name: "createVesting",
      accounts: [
        { name: "vestingState", isMut: true, isSigner: false },
        { name: "vestingSchedule", isMut: true, isSigner: true },
        { name: "creatorVestings", isMut: true, isSigner: false },
        { name: "tokenMint", isMut: false, isSigner: false },
        { name: "tokenFrom", isMut: true, isSigner: false },
        { name: "tokenVault", isMut: true, isSigner: false },
        { name: "tokenVaultAuthority", isMut: false, isSigner: false },
        { name: "oracle", isMut: false, isSigner: false },
        { name: "creator", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false }
      ],
      args: [
        { name: "amount", type: "u64" },
        { name: "metricType", type: "string" },
        { name: "thresholds", type: { array: ["u64"] } },
        { name: "unlockPercentages", type: { array: ["u64"] } }
      ]
    },
    {
      name: "checkMilestones",
      accounts: [
        { name: "vestingSchedule", isMut: true, isSigner: false },
        { name: "oracle", isMut: false, isSigner: false },
        { name: "signer", isMut: false, isSigner: true }
      ],
      args: []
    },
    {
      name: "withdrawUnlocked",
      accounts: [
        { name: "vestingSchedule", isMut: true, isSigner: false },
        { name: "tokenVault", isMut: true, isSigner: false },
        { name: "tokenVaultAuthority", isMut: false, isSigner: false },
        { name: "tokenTo", isMut: true, isSigner: false },
        { name: "oracle", isMut: false, isSigner: false },
        { name: "creator", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "VestingState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "vestingIdCounter", type: "u64" }
        ]
      }
    },
    {
      name: "VestingSchedule",
      type: {
        kind: "struct",
        fields: [
          { name: "creator", type: "publicKey" },
          { name: "tokenMint", type: "publicKey" },
          { name: "totalAmount", type: "u64" },
          { name: "unlockedAmount", type: "u64" },
          { name: "oracleAddress", type: "publicKey" },
          { name: "metricType", type: "string" },
          { name: "active", type: "bool" },
          { name: "vestingId", type: "u64" },
          { name: "milestones", type: { array: [{ defined: "Milestone" }] } }
        ]
      }
    },
    {
      name: "CreatorVestings",
      type: {
        kind: "struct",
        fields: [
          { name: "creator", type: "publicKey" },
          { name: "vestingIds", type: { array: ["u64"] } }
        ]
      }
    }
  ],
  types: [
    {
      name: "Milestone",
      type: {
        kind: "struct",
        fields: [
          { name: "threshold", type: "u64" },
          { name: "unlockPercentage", type: "u64" }, 
          { name: "reached", type: "bool" }
        ]
      }
    }
  ],
  events: [
    {
      name: "VestingCreatedEvent",
      fields: [
        { name: "vestingId", type: "u64", index: false },
        { name: "creator", type: "publicKey", index: false },
        { name: "tokenAddress", type: "publicKey", index: false },
        { name: "totalAmount", type: "u64", index: false }
      ]
    },
    {
      name: "MilestoneReachedEvent",
      fields: [
        { name: "vestingId", type: "u64", index: false },
        { name: "milestoneIndex", type: "u64", index: false },
        { name: "unlockedAmount", type: "u64", index: false }
      ]
    },
    {
      name: "TokensWithdrawnEvent",
      fields: [
        { name: "vestingId", type: "u64", index: false },
        { name: "creator", type: "publicKey", index: false },
        { name: "amount", type: "u64", index: false }
      ]
    }
  ],
  errors: [
    { code: 6000, name: "ArrayLengthMismatch", msg: "Arrays must be the same length" },
    { code: 6001, name: "NoMilestones", msg: "Must have at least one milestone" },
    { code: 6002, name: "TotalPercentageExceeded", msg: "Total percentage cannot exceed 100%" },
    { code: 6003, name: "VestingNotActive", msg: "Vesting schedule not active" },
    { code: 6004, name: "NoNewMilestonesReached", msg: "No new milestones reached" },
    { code: 6005, name: "OnlyCreatorCanWithdraw", msg: "Only creator can withdraw" },
    { code: 6006, name: "NoTokensToWithdraw", msg: "No tokens to withdraw" }
  ]
};

// Replace with the actual program ID after deployment to devnet/mainnet
const SKILL_VESTING_PROGRAM_ID = 'DeBYJGUnhGxwxGUg9UmT4LPyTNKvN2Nf5o2GnCLnRmVC';
const DEFAULT_NETWORK = 'https://api.devnet.solana.com';

// Type definitions
export interface MilestoneConfig {
  threshold: number; // e.g., 1000 followers, 50000 views
  unlockPercentage: number; // in basis points (1/100 of a percent) - 10000 = 100%
}

export interface VestingParams {
  tokenMintAddress: string;  // SPL token mint address
  amount: number;            // Amount in token's smallest unit
  oracleAddress: string;     // Oracle account address
  metricType: 'followers' | 'views' | 'likes';
  milestones: MilestoneConfig[];
}

export interface VestingSchedule {
  id: number;
  creator: string;
  tokenMintAddress: string;
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

let connectionSingleton: Connection | null = null;
let programSingleton: Program | null = null;

function getConnection(rpcUrl = DEFAULT_NETWORK): Connection {
  if (!connectionSingleton) {
    connectionSingleton = new Connection(rpcUrl, 'confirmed');
  }
  return connectionSingleton;
}

export function getProgram(wallet: any, rpcUrl = DEFAULT_NETWORK): Program {
  if (!programSingleton) {
    const connection = getConnection(rpcUrl);
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    programSingleton = new Program(
      SKILL_VESTING_IDL,
      new PublicKey(SKILL_VESTING_PROGRAM_ID),
      provider
    );
  }
  return programSingleton;
}

/**
 * Get the vesting state PDA
 */
export async function getVestingStatePDA(programId: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("vesting_state")],
    programId
  );
}

/**
 * Get the creator vestings PDA for a specific creator
 */
export async function getCreatorVestingsPDA(creatorPublicKey: PublicKey, programId: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from("creator_vestings"), creatorPublicKey.toBuffer()],
    programId
  );
}

/**
 * Initialize the vesting program
 */
export async function initializeVesting(wallet: any): Promise<string> {
  try {
    const program = getProgram(wallet);
    
    // Generate a new keypair for the vesting state account
    const vestingState = Keypair.generate();
    
    // Initialize the vesting program
    const tx = await program.methods
      .initialize()
      .accounts({
        vestingState: vestingState.publicKey,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vestingState])
      .rpc();
      
    return tx;
  } catch (error) {
    console.error('Error initializing vesting program:', error);
    throw error;
  }
}

/**
 * Create a new vesting schedule
 */
export async function createVesting(
  params: VestingParams,
  wallet: any
): Promise<number> {
  try {
    const program = getProgram(wallet);
    
    // Get the vesting state - in a real implementation, you would likely store this after initialization
    const [vestingStatePDA] = await getVestingStatePDA(program.programId);
    
    // Fetch the vesting state account
    const vestingStateAccount = await program.account.vestingState.fetch(vestingStatePDA) as VestingStateAccount;
    
    // Get next vesting ID
    const nextVestingId = vestingStateAccount.vestingIdCounter.addn(1);
    
    // Generate keypair for the vesting schedule account
    const vestingSchedule = Keypair.generate();
    
    // Derive the creator vestings PDA
    const [creatorVestingsPDA] = await getCreatorVestingsPDA(wallet.publicKey, program.programId);
    
    // Derive the token vault PDA
    const [tokenVault] = await PublicKey.findProgramAddress(
      [Buffer.from('token_vault'), nextVestingId.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // Derive the vault authority PDA
    const [tokenVaultAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), nextVestingId.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // Get the token account for the user
    const tokenMint = new PublicKey(params.tokenMintAddress);
    const userTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      wallet.publicKey
    );
    
    // Create the vesting schedule
    const tx = await program.methods
      .createVesting(
        new BN(params.amount),
        params.metricType,
        params.milestones.map(m => new BN(m.threshold)),
        params.milestones.map(m => new BN(m.unlockPercentage))
      )
      .accounts({
        vestingState: vestingStatePDA,
        vestingSchedule: vestingSchedule.publicKey,
        creatorVestings: creatorVestingsPDA,
        tokenMint,
        tokenFrom: userTokenAccount,
        tokenVault,
        tokenVaultAuthority,
        oracle: new PublicKey(params.oracleAddress),
        creator: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([vestingSchedule])
      .rpc();
    
    // Now we need to get the vesting ID from on-chain
    // Ideally we would subscribe to the program events and retrieve the ID from there
    // For simplicity, we'll just return the next vesting ID we calculated
    return nextVestingId.toNumber();
  } catch (error) {
    console.error('Error creating vesting schedule:', error);
    throw error;
  }
}

/**
 * Check if any milestones have been reached
 */
export async function checkMilestones(
  vestingId: number,
  wallet: any
): Promise<boolean> {
  try {
    const program = getProgram(wallet);
    
    // Find the vesting schedule account by ID
    // In a real implementation, you would query the account based on the vesting ID
    // For this example, we'll assume the vesting schedule is passed or derived
    
    // Fetch all vesting schedules belonging to the user
    const [creatorVestingsPDA] = await getCreatorVestingsPDA(wallet.publicKey, program.programId);
    const creatorVestings = await program.account.creatorVestings.fetch(creatorVestingsPDA) as CreatorVestingsAccount;
    
    // Get vesting schedule public key from ID - this is simplified
    // In a real implementation, you would use the vestingId to query the correct account
    const vestingScheduleAccounts = await program.account.vestingSchedule.all([
      {
        memcmp: {
          offset: 8 + 32 + 32 + 8 + 8 + 32, // Offset to vestingId in the account
          bytes: new BN(vestingId).toArrayLike(Buffer, 'le', 8).toString('base64')
        }
      }
    ]);
    
    if (vestingScheduleAccounts.length === 0) {
      throw new Error(`Vesting schedule with ID ${vestingId} not found`);
    }
    
    const vestingScheduleAccount = vestingScheduleAccounts[0];
    
    // Get the oracle account from the vesting schedule
    const oracleAddress = vestingScheduleAccount.account.oracleAddress;
    
    // Check the milestones
    const tx = await program.methods
      .checkMilestones()
      .accounts({
        vestingSchedule: vestingScheduleAccount.publicKey,
        oracle: oracleAddress,
        signer: wallet.publicKey,
      })
      .rpc();
    
    // If we reach here, milestones have been checked without error
    // We could also fetch the updated account to see which milestones have been reached
    return true;
  } catch (error) {
    console.error('Error checking milestones:', error);
    
    // Check for specific error
    if (error instanceof Error && error.toString().includes('NoNewMilestonesReached')) {
      return false;
    }
    
    throw error;
  }
}

/**
 * Withdraw unlocked tokens
 */
export async function withdrawUnlocked(
  vestingId: number,
  wallet: any
): Promise<string> {
  try {
    const program = getProgram(wallet);
    
    // Find the vesting schedule account by ID
    const vestingScheduleAccounts = await program.account.vestingSchedule.all([
      {
        memcmp: {
          offset: 8 + 32 + 32 + 8 + 8 + 32, // Offset to vestingId in the account
          bytes: new BN(vestingId).toArrayLike(Buffer, 'le', 8).toString('base64')
        }
      }
    ]);
    
    if (vestingScheduleAccounts.length === 0) {
      throw new Error(`Vesting schedule with ID ${vestingId} not found`);
    }
    
    const vestingScheduleAccount = vestingScheduleAccounts[0];
    const vestingSchedule = vestingScheduleAccount.account as VestingScheduleAccount;
    
    // Derive the token vault PDA
    const [tokenVault] = await PublicKey.findProgramAddress(
      [Buffer.from('token_vault'), new BN(vestingId).toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // Derive the vault authority PDA
    const [tokenVaultAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), new BN(vestingId).toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // Get the token account for the user
    const tokenMint = vestingSchedule.tokenMint;
    const userTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      wallet.publicKey
    );
    
    // Check if the associated token account exists, and create it if it doesn't
    const connection = getConnection();
    const accountInfo = await connection.getAccountInfo(userTokenAccount);
    
    let instructions = [];
    if (!accountInfo) {
      instructions.push(
        createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          userTokenAccount,
          wallet.publicKey,
          tokenMint
        )
      );
    }
    
    // Withdraw the unlocked tokens
    const tx = await program.methods
      .withdrawUnlocked()
      .accounts({
        vestingSchedule: vestingScheduleAccount.publicKey,
        tokenVault,
        tokenVaultAuthority,
        tokenTo: userTokenAccount,
        oracle: vestingSchedule.oracleAddress,
        creator: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(instructions)
      .rpc();
    
    // Return the transaction signature
    return tx;
  } catch (error) {
    console.error('Error withdrawing unlocked tokens:', error);
    throw error;
  }
}

/**
 * Get a vesting schedule by ID
 */
export async function getVestingSchedule(
  vestingId: number,
  wallet: any
): Promise<VestingSchedule> {
  try {
    const program = getProgram(wallet);
    
    // Find the vesting schedule account by ID
    const vestingScheduleAccounts = await program.account.vestingSchedule.all([
      {
        memcmp: {
          offset: 8 + 32 + 32 + 8 + 8 + 32, // Offset to vestingId in the account
          bytes: new BN(vestingId).toArrayLike(Buffer, 'le', 8).toString('base64')
        }
      }
    ]);
    
    if (vestingScheduleAccounts.length === 0) {
      throw new Error(`Vesting schedule with ID ${vestingId} not found`);
    }
    
    const vestingScheduleAccount = vestingScheduleAccounts[0].account as VestingScheduleAccount;
    
    // Format the milestone data
    const thresholds = vestingScheduleAccount.milestones.map((m) => m.threshold.toNumber());
    const unlockPercentages = vestingScheduleAccount.milestones.map((m) => m.unlockPercentage.toNumber());
    const reached = vestingScheduleAccount.milestones.map((m) => m.reached);
    
    return {
      id: vestingScheduleAccount.vestingId.toNumber(),
      creator: vestingScheduleAccount.creator.toString(),
      tokenMintAddress: vestingScheduleAccount.tokenMint.toString(),
      totalAmount: vestingScheduleAccount.totalAmount.toString(),
      unlockedAmount: vestingScheduleAccount.unlockedAmount.toString(),
      oracleAddress: vestingScheduleAccount.oracleAddress.toString(),
      metricType: vestingScheduleAccount.metricType,
      active: vestingScheduleAccount.active,
      milestones: {
        thresholds,
        unlockPercentages,
        reached
      }
    };
  } catch (error) {
    console.error('Error getting vesting schedule:', error);
    throw error;
  }
}

/**
 * Get all vesting schedules for a creator
 */
export async function getCreatorVestings(
  creatorAddress: string,
  wallet: any
): Promise<number[]> {
  try {
    const program = getProgram(wallet);
    const creatorPublicKey = new PublicKey(creatorAddress);
    
    // Derive the creator vestings PDA
    const [creatorVestingsPDA] = await getCreatorVestingsPDA(creatorPublicKey, program.programId);
    
    try {
      const creatorVestings = await program.account.creatorVestings.fetch(creatorVestingsPDA) as CreatorVestingsAccount;
      return creatorVestings.vestingIds.map((id) => id.toNumber());
    } catch (e) {
      // If the account doesn't exist, return an empty array
      return [];
    }
  } catch (error) {
    console.error('Error getting creator vestings:', error);
    throw error;
  }
} 