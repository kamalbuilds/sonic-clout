import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet, Idl } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MilestoneConfig } from './vestingService';

// This would be imported from the build output in a real app
// import skillVestingIdl from '../../../sonic-anchor/target/idl/skill_vesting.json';

// Mock IDL for development
const skillVestingIdl: Idl = {
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
        { name: "thresholds", type: { vec: "u64" } },
        { name: "unlockPercentages", type: { vec: "u64" } }
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
      name: "vestingState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "vestingIdCounter", type: "u64" }
        ]
      }
    },
    {
      name: "vestingSchedule",
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
          { name: "milestones", type: { vec: { defined: "Milestone" } } }
        ]
      }
    },
    {
      name: "creatorVestings",
      type: {
        kind: "struct",
        fields: [
          { name: "creator", type: "publicKey" },
          { name: "vestingIds", type: { vec: "u64" } }
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

// Program ID from Anchor.toml
const SKILL_VESTING_PROGRAM_ID = new PublicKey('SkLvStvncgAwXjKWnNVEF7MWZXkAF1MJ6Wkdynds8nqN');

// Vesting state account - this would be initialized and stored somewhere
let VESTING_STATE: PublicKey | null = null;

export interface VestingParams {
  tokenMint: PublicKey;
  amount: number;
  oracleAddress: PublicKey;
  metricType: 'followers' | 'views' | 'likes';
  milestones: MilestoneConfig[];
}

export interface VestingResult {
  vestingId: number;
  vestingSchedule: PublicKey;
  tokenVault: PublicKey;
}

export interface AnchorMilestone {
  threshold: BN;
  unlockPercentage: BN;
  reached: boolean;
}

export interface AnchorVestingSchedule {
  creator: PublicKey;
  tokenMint: PublicKey;
  totalAmount: BN;
  unlockedAmount: BN;
  oracleAddress: PublicKey;
  metricType: string;
  active: boolean;
  vestingId: BN;
  milestones: AnchorMilestone[];
}

export async function initializeVestingProgram(
  connection: Connection,
  wallet: Wallet
): Promise<PublicKey> {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    // Generate a new keypair for the vesting state account
    const vestingState = web3.Keypair.generate();
    
    // Initialize the vesting program
    await program.methods
      .initialize()
      .accounts({
        vestingState: vestingState.publicKey,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([vestingState])
      .rpc();
    
    // Store the vesting state for later use
    VESTING_STATE = vestingState.publicKey;
    
    return vestingState.publicKey;
  } catch (error) {
    console.error('Error initializing vesting program:', error);
    throw error;
  }
}

export async function createVesting(
  connection: Connection,
  wallet: Wallet,
  params: VestingParams
): Promise<VestingResult> {
  try {
    if (!VESTING_STATE) {
      throw new Error('Vesting program not initialized. Call initializeVestingProgram first.');
    }
    
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    // Generate keypair for the vesting schedule account
    const vestingSchedule = web3.Keypair.generate();
    
    // Derive the creator vestings PDA
    const [creatorVestings] = await PublicKey.findProgramAddress(
      [Buffer.from('creator_vestings'), wallet.publicKey.toBuffer()],
      program.programId
    );
    
    // Get the current vesting ID counter
    const vestingStateAccount = await program.account.vestingState.fetch(VESTING_STATE);
    const nextVestingId = (vestingStateAccount.vestingIdCounter as BN).add(new BN(1));
    
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
    
    // In a real implementation, we would get the user's token account
    // For this demo, we'll just use a dummy address
    const tokenFrom = new PublicKey('11111111111111111111111111111111');
    
    // Prepare milestones
    const thresholds = params.milestones.map(m => new BN(m.threshold));
    const unlockPercentages = params.milestones.map(m => new BN(m.unlockPercentage));
    
    // Create the vesting schedule
    const tx = await program.methods
      .createVesting(
        new BN(params.amount),
        params.metricType,
        thresholds,
        unlockPercentages
      )
      .accounts({
        vestingState: VESTING_STATE,
        vestingSchedule: vestingSchedule.publicKey,
        creatorVestings,
        tokenMint: params.tokenMint,
        tokenFrom,
        tokenVault,
        tokenVaultAuthority,
        oracle: params.oracleAddress,
        creator: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([vestingSchedule])
      .rpc();
    
    return {
      vestingId: nextVestingId.toNumber(),
      vestingSchedule: vestingSchedule.publicKey,
      tokenVault
    };
  } catch (error) {
    console.error('Error creating vesting schedule:', error);
    throw error;
  }
}

export async function checkMilestones(
  connection: Connection,
  wallet: Wallet,
  vestingScheduleAddress: PublicKey
): Promise<boolean> {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    // Get the vesting schedule to find the oracle
    const rawVestingSchedule = await program.account.vestingSchedule.fetch(vestingScheduleAddress);
    const vestingSchedule = {
      creator: rawVestingSchedule.creator as PublicKey,
      tokenMint: rawVestingSchedule.tokenMint as PublicKey,
      totalAmount: rawVestingSchedule.totalAmount as BN,
      unlockedAmount: rawVestingSchedule.unlockedAmount as BN,
      oracleAddress: rawVestingSchedule.oracleAddress as PublicKey,
      metricType: rawVestingSchedule.metricType as string,
      active: rawVestingSchedule.active as boolean,
      vestingId: rawVestingSchedule.vestingId as BN,
      milestones: (rawVestingSchedule.milestones as any[]).map(m => ({
        threshold: m.threshold as BN,
        unlockPercentage: m.unlockPercentage as BN,
        reached: m.reached as boolean
      }))
    };
    
    try {
      // Check milestones
      await program.methods
        .checkMilestones()
        .accounts({
          vestingSchedule: vestingScheduleAddress,
          oracle: vestingSchedule.oracleAddress,
          signer: wallet.publicKey,
        })
        .rpc();
      
      return true;
    } catch (error: any) {
      // If the error is "No new milestones reached", return false
      if (error.message.includes('No new milestones reached')) {
        return false;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error checking milestones:', error);
    throw error;
  }
}

export async function withdrawUnlocked(
  connection: Connection,
  wallet: Wallet,
  vestingScheduleAddress: PublicKey
): Promise<number> {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    // Get the vesting schedule
    const rawVestingSchedule = await program.account.vestingSchedule.fetch(vestingScheduleAddress);
    const vestingSchedule = {
      creator: rawVestingSchedule.creator as PublicKey,
      tokenMint: rawVestingSchedule.tokenMint as PublicKey,
      totalAmount: rawVestingSchedule.totalAmount as BN,
      unlockedAmount: rawVestingSchedule.unlockedAmount as BN,
      oracleAddress: rawVestingSchedule.oracleAddress as PublicKey,
      metricType: rawVestingSchedule.metricType as string,
      active: rawVestingSchedule.active as boolean,
      vestingId: rawVestingSchedule.vestingId as BN,
      milestones: (rawVestingSchedule.milestones as any[]).map(m => ({
        threshold: m.threshold as BN,
        unlockPercentage: m.unlockPercentage as BN,
        reached: m.reached as boolean
      }))
    };
    
    // Derive the token vault PDA
    const [tokenVault] = await PublicKey.findProgramAddress(
      [Buffer.from('token_vault'), vestingSchedule.vestingId.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // Derive the vault authority PDA
    const [tokenVaultAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from('vault_authority'), vestingSchedule.vestingId.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    
    // In a real implementation, we would get the user's token account
    // For this demo, we'll just use a dummy address
    const tokenTo = new PublicKey('11111111111111111111111111111111');
    
    // Get the unlocked amount before withdrawal
    const unlockedAmount = vestingSchedule.unlockedAmount.toNumber();
    
    // Withdraw unlocked tokens
    await program.methods
      .withdrawUnlocked()
      .accounts({
        vestingSchedule: vestingScheduleAddress,
        tokenVault,
        tokenVaultAuthority,
        tokenTo,
        oracle: vestingSchedule.oracleAddress,
        creator: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    return unlockedAmount;
  } catch (error) {
    console.error('Error withdrawing unlocked tokens:', error);
    throw error;
  }
}

export async function getVestingSchedule(
  connection: Connection,
  vestingScheduleAddress: PublicKey
): Promise<AnchorVestingSchedule> {
  try {
    const provider = new AnchorProvider(
      connection,
      // We don't need a real wallet for this read-only operation
      { publicKey: PublicKey.default } as Wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    const rawVestingSchedule = await program.account.vestingSchedule.fetch(vestingScheduleAddress);
    
    return {
      creator: rawVestingSchedule.creator as PublicKey,
      tokenMint: rawVestingSchedule.tokenMint as PublicKey,
      totalAmount: rawVestingSchedule.totalAmount as BN,
      unlockedAmount: rawVestingSchedule.unlockedAmount as BN,
      oracleAddress: rawVestingSchedule.oracleAddress as PublicKey,
      metricType: rawVestingSchedule.metricType as string,
      active: rawVestingSchedule.active as boolean,
      vestingId: rawVestingSchedule.vestingId as BN,
      milestones: (rawVestingSchedule.milestones as any[]).map(m => ({
        threshold: m.threshold as BN,
        unlockPercentage: m.unlockPercentage as BN,
        reached: m.reached as boolean
      }))
    };
  } catch (error) {
    console.error('Error getting vesting schedule:', error);
    throw error;
  }
}

export async function getCreatorVestings(
  connection: Connection,
  creatorAddress: PublicKey
): Promise<number[]> {
  try {
    const provider = new AnchorProvider(
      connection,
      // We don't need a real wallet for this read-only operation
      { publicKey: PublicKey.default } as Wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(skillVestingIdl, SKILL_VESTING_PROGRAM_ID, provider);
    
    // Derive the creator vestings PDA
    const [creatorVestingsPda] = await PublicKey.findProgramAddress(
      [Buffer.from('creator_vestings'), creatorAddress.toBuffer()],
      program.programId
    );
    
    try {
      const creatorVestings = await program.account.creatorVestings.fetch(creatorVestingsPda);
      return ((creatorVestings.vestingIds as any[]) as BN[]).map(id => id.toNumber());
    } catch (error) {
      // If the account doesn't exist, return an empty array
      return [];
    }
  } catch (error) {
    console.error('Error getting creator vestings:', error);
    throw error;
  }
} 