import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';
import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// You would replace this with your actual keypair or use a wallet adapter
const KEYPAIR_PATH = path.resolve(process.env.HOME || '', '.config', 'solana', 'id.json');
const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf-8'));
const feePayer = Keypair.fromSecretKey(new Uint8Array(keypairData));

// Program IDs from Anchor.toml after build
const greetingProgramId = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
const tokenFactoryProgramId = new PublicKey('SPLEZkhJTqLPgAB4wDUMTVnPTyCBTCUULYAjK6SxEKib');
const skillVestingProgramId = new PublicKey('SkLvStvncgAwXjKWnNVEF7MWZXkAF1MJ6Wkdynds8nqN');

const connection = new Connection('https://devnet.sonic.game', 'confirmed');

// Setup provider
const provider = new AnchorProvider(
  connection,
  new Wallet(feePayer),
  { commitment: 'confirmed' }
);

// In a real scenario, you'd import the IDLs from the build output
async function run() {
  try {
    console.log('Running Sonic Anchor client demo...');
    console.log('User public key:', feePayer.publicKey.toString());
    
    // Demo options
    const demoTokenFactory = true;
    const demoSkillVesting = true;
    
    if (demoTokenFactory) {
      console.log('\n--- Token Factory Demo ---');
      await runTokenFactoryDemo();
    }
    
    if (demoSkillVesting) {
      console.log('\n--- Skill Vesting Demo ---');
      await runSkillVestingDemo();
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTokenFactoryDemo() {
  console.log('This demo requires:');
  console.log('1. The token_factory program to be built and deployed');
  console.log('2. The program ID to be updated in lib.rs and Anchor.toml');
  
  console.log('\nAfter deployment, this client will:');
  console.log('1. Initialize the token factory with a mint fee');
  console.log('2. Create a new content token');
  console.log('3. Display the token details');
}

async function runSkillVestingDemo() {
  console.log('This demo requires:');
  console.log('1. The skill_vesting program to be built and deployed');
  console.log('2. The program ID to be updated in lib.rs and Anchor.toml');
  
  console.log('\nAfter deployment, this client will:');
  console.log('1. Initialize the vesting program');
  console.log('2. Create a new vesting schedule with milestones');
  console.log('3. Check milestones and withdraw unlocked tokens');
}

// Example of how to initialize the token factory
async function initializeTokenFactory(program: Program, mintFee: number, feeReceiver: PublicKey) {
  // Generate a new keypair for the factory state account
  const factoryState = anchor.web3.Keypair.generate();
  
  // Initialize the factory
  await program.methods
    .initialize(new BN(mintFee), feeReceiver)
    .accounts({
      factoryState: factoryState.publicKey,
      authority: feePayer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([factoryState, feePayer])
    .rpc();
    
  return factoryState.publicKey;
}

// Example of how to create a token
async function createToken(
  program: Program,
  factoryState: PublicKey,
  name: string,
  symbol: string,
  initialSupply: number,
  contentType: string,
  contentHash: string
) {
  // Generate keypairs for the accounts
  const mint = anchor.web3.Keypair.generate();
  const tokenMetadata = anchor.web3.Keypair.generate();
  
  // Derive the content hash account PDA
  const [contentHashAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('content_hash'), Buffer.from(contentHash)],
    program.programId
  );
  
  // Get the fee receiver from the factory state
  const factoryStateAccount = await program.account.factoryState.fetch(factoryState);
  const feeReceiver = factoryStateAccount.feeReceiver as PublicKey;
  
  // In a real implementation, we would use getOrCreateAssociatedTokenAccount
  // For this demo, we'll just create a mock token account
  const tokenAccount = {
    address: new PublicKey('11111111111111111111111111111111')
  };
  
  // Create the token
  await program.methods
    .createToken(
      name,
      symbol,
      new BN(initialSupply),
      contentType,
      contentHash,
      9 // decimals
    )
    .accounts({
      factoryState,
      tokenMetadata: tokenMetadata.publicKey,
      contentHashAccount,
      mint: mint.publicKey,
      tokenAccount: tokenAccount.address,
      payer: feePayer.publicKey,
      feeReceiver,
      payment: feePayer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([mint, tokenMetadata, feePayer])
    .rpc();
    
  return {
    mint: mint.publicKey,
    tokenMetadata: tokenMetadata.publicKey,
    contentHashAccount,
    tokenAccount: tokenAccount.address
  };
}

// Example of how to initialize the vesting program
async function initializeVesting(program: Program) {
  // Generate a new keypair for the vesting state account
  const vestingState = anchor.web3.Keypair.generate();
  
  // Initialize the vesting program
  await program.methods
    .initialize()
    .accounts({
      vestingState: vestingState.publicKey,
      authority: feePayer.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([vestingState, feePayer])
    .rpc();
    
  return vestingState.publicKey;
}

// Example of how to create a vesting schedule
async function createVestingSchedule(
  program: Program,
  vestingState: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  metricType: string,
  thresholds: number[],
  unlockPercentages: number[]
) {
  // Generate keypair for the vesting schedule account
  const vestingSchedule = anchor.web3.Keypair.generate();
  
  // Derive the creator vestings PDA
  const [creatorVestings] = await PublicKey.findProgramAddress(
    [Buffer.from('creator_vestings'), feePayer.publicKey.toBuffer()],
    program.programId
  );
  
  // Get the current vesting ID counter
  const vestingStateAccount = await program.account.vestingState.fetch(vestingState);
  const nextVestingId = new BN(1); // Mock value for demo
  
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
  
  // Create a mock oracle account
  const oracle = anchor.web3.Keypair.generate();
  await connection.requestAirdrop(oracle.publicKey, 1000000000);
  
  // In a real implementation, we would use getOrCreateAssociatedTokenAccount
  // For this demo, we'll just create a mock token account
  const tokenFrom = {
    address: new PublicKey('11111111111111111111111111111111')
  };
  
  // Create the vesting schedule
  await program.methods
    .createVesting(
      new BN(amount),
      metricType,
      thresholds.map(t => new BN(t)),
      unlockPercentages.map(p => new BN(p))
    )
    .accounts({
      vestingState,
      vestingSchedule: vestingSchedule.publicKey,
      creatorVestings,
      tokenMint,
      tokenFrom: tokenFrom.address,
      tokenVault,
      tokenVaultAuthority,
      oracle: oracle.publicKey,
      creator: feePayer.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([vestingSchedule, feePayer])
    .rpc();
    
  return {
    vestingSchedule: vestingSchedule.publicKey,
    creatorVestings,
    tokenVault,
    tokenVaultAuthority,
    oracle: oracle.publicKey
  };
}

run(); 