import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenMetadata } from './tokenService';

// Define interfaces for our Solana program account types
interface FactoryStateAccount {
  authority: PublicKey;
  tokenCounter: BN;
  mintFee: BN;
  feeReceiver: PublicKey;
}

interface TokenMetadataAccount {
  name: string;
  symbol: string;
  contentType: string;
  contentHash: string;
  creator: PublicKey;
  creationTime: BN;
}

// Program ID from Anchor.toml
const TOKEN_FACTORY_PROGRAM_ID = new PublicKey('SPLEZkhJTqLPgAB4wDUMTVnPTyCBTCUULYAjK6SxEKib');

// Factory state account - this would be initialized and stored somewhere
let FACTORY_STATE: PublicKey | null = null;

export interface CreateTokenParams {
  name: string;
  symbol: string;
  initialSupply: number;
  contentType: string; // "post", "clip", "profile"
  contentHash: string; // IPFS hash
  decimals?: number;
}

export interface TokenCreationResult {
  tokenAddress: PublicKey;
  metadataAddress: PublicKey;
  tokenId: number;
}

// Use require to avoid TypeScript issues with the IDL
// You would create this file from your actual Anchor IDL
const tokenFactoryIdl = {
  version: "0.1.0",
  name: "token_factory"
  // The rest of your IDL would go here
  // In production, you'd use: require('./tokenFactoryIDL.json')
};

export async function initializeTokenFactory(
  connection: Connection,
  wallet: Wallet,
  mintFee: number = 0.5 * web3.LAMPORTS_PER_SOL,
  feeReceiver?: PublicKey
): Promise<PublicKey> {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    // Use type assertions to bypass TypeScript's strict type checking
    const program = new Program(
      tokenFactoryIdl as any,
      TOKEN_FACTORY_PROGRAM_ID as any,
      provider as any
    ) as any;
    
    // Generate a new keypair for the factory state account
    const factoryState = web3.Keypair.generate();
    
    // Use the wallet's public key as fee receiver if not specified
    const receiverAddress = feeReceiver || wallet.publicKey;
    
    // Initialize the factory
    await program.methods
      .initialize(new BN(mintFee), receiverAddress)
      .accounts({
        factoryState: factoryState.publicKey,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([factoryState])
      .rpc();
    
    // Store the factory state for later use
    FACTORY_STATE = factoryState.publicKey;
    
    return factoryState.publicKey;
  } catch (error) {
    console.error('Error initializing token factory:', error);
    throw error;
  }
}

export async function createToken(
  connection: Connection,
  wallet: Wallet,
  params: CreateTokenParams
): Promise<TokenCreationResult> {
  try {
    if (!FACTORY_STATE) {
      throw new Error('Token factory not initialized. Call initializeTokenFactory first.');
    }
    
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    // Use type assertions to bypass TypeScript's strict type checking
    const program = new Program(
      tokenFactoryIdl as any,
      TOKEN_FACTORY_PROGRAM_ID as any,
      provider as any
    ) as any;
    
    // Generate keypairs for the accounts
    const mint = web3.Keypair.generate();
    const tokenMetadata = web3.Keypair.generate();
    
    // Derive the content hash account PDA
    const [contentHashAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('content_hash'), Buffer.from(params.contentHash)],
      program.programId
    );
    
    // Get the fee receiver from the factory state
    const factoryStateAccount = await program.account.factoryState.fetch(FACTORY_STATE);
    const feeReceiver = factoryStateAccount.feeReceiver;
    
    // In a real implementation, we would create an associated token account
    // For this demo, we'll just use a dummy address
    const tokenAccount = new PublicKey('11111111111111111111111111111111');
    
    // Create the token
    const tx = await program.methods
      .createToken(
        params.name,
        params.symbol,
        new BN(params.initialSupply),
        params.contentType,
        params.contentHash,
        params.decimals || 9
      )
      .accounts({
        factoryState: FACTORY_STATE,
        tokenMetadata: tokenMetadata.publicKey,
        contentHashAccount,
        mint: mint.publicKey,
        tokenAccount,
        payer: wallet.publicKey,
        feeReceiver,
        payment: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([mint, tokenMetadata])
      .rpc();
    
    // In a real implementation, we would get the token ID from the event
    // For this demo, we'll just use a dummy value
    const tokenId = 1;
    
    return {
      tokenAddress: mint.publicKey,
      metadataAddress: tokenMetadata.publicKey,
      tokenId
    };
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
}

// Create a dummy wallet type for read-only operations
class ReadOnlyWallet {
  readonly publicKey: PublicKey;
  readonly payer: Keypair; // Add this to satisfy the Wallet interface

  constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
    // Create a dummy keypair that will never be used
    this.payer = Keypair.generate();
  }
  
  async signTransaction(): Promise<any> {
    throw new Error('ReadOnlyWallet cannot sign transactions');
  }
  
  async signAllTransactions(): Promise<any[]> {
    throw new Error('ReadOnlyWallet cannot sign transactions');
  }
}

export async function getTokenMetadata(
  connection: Connection,
  metadataAddress: PublicKey
): Promise<TokenMetadata> {
  try {
    // Create a read-only wallet with default public key for provider
    const readOnlyWallet = new ReadOnlyWallet(PublicKey.default);
    
    const provider = new AnchorProvider(
      connection,
      readOnlyWallet as any,  // Type assertion to satisfy TypeScript
      { commitment: 'confirmed' }
    );
    
    // Use type assertions to bypass TypeScript's strict type checking
    const program = new Program(
      tokenFactoryIdl as any,
      TOKEN_FACTORY_PROGRAM_ID as any,
      provider as any
    ) as any;
    
    const rawMetadata = await program.account.tokenMetadata.fetch(metadataAddress);
    const contentType = rawMetadata.contentType;
    const contentHash = rawMetadata.contentHash;
    const creator = rawMetadata.creator.toString();
    
    return {
      name: rawMetadata.name,
      description: `${contentType} content`,
      image: `https://gateway.pinata.cloud/ipfs/${contentHash}`,
      properties: {
        type: contentType,
        content: contentHash,
        creator: creator
      }
    };
  } catch (error) {
    console.error('Error getting token metadata:', error);
    throw error;
  }
} 