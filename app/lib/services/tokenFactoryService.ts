import { Connection, PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet, Idl } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TokenMetadata } from './tokenService';

// This would be imported from the build output in a real app
// import tokenFactoryIdl from '../../../sonic-anchor/target/idl/token_factory.json';

// Mock IDL for development
const tokenFactoryIdl: Idl = {
  version: "0.1.0",
  name: "token_factory",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "factoryState", isMut: true, isSigner: true },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "mintFee", type: "u64" },
        { name: "feeReceiver", type: "publicKey" }
      ]
    },
    {
      name: "createToken",
      accounts: [
        { name: "factoryState", isMut: true, isSigner: false },
        { name: "tokenMetadata", isMut: true, isSigner: true },
        { name: "contentHashAccount", isMut: true, isSigner: false },
        { name: "mint", isMut: true, isSigner: true },
        { name: "tokenAccount", isMut: true, isSigner: false },
        { name: "payer", isMut: true, isSigner: true },
        { name: "feeReceiver", isMut: true, isSigner: false },
        { name: "payment", isMut: true, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false }
      ],
      args: [
        { name: "name", type: "string" },
        { name: "symbol", type: "string" },
        { name: "initialSupply", type: "u64" },
        { name: "contentType", type: "string" },
        { name: "contentHash", type: "string" },
        { name: "decimals", type: "u8" }
      ]
    }
  ],
  accounts: [
    {
      name: "factoryState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "tokenCounter", type: "u64" },
          { name: "mintFee", type: "u64" },
          { name: "feeReceiver", type: "publicKey" }
        ]
      }
    },
    {
      name: "tokenMetadata",
      type: {
        kind: "struct",
        fields: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "contentType", type: "string" },
          { name: "contentHash", type: "string" },
          { name: "creator", type: "publicKey" },
          { name: "creationTime", type: "i64" }
        ]
      }
    }
  ],
  events: [
    {
      name: "TokenCreatedEvent",
      fields: [
        { name: "tokenId", type: "u64", index: false },
        { name: "tokenAddress", type: "publicKey", index: false },
        { name: "contentType", type: "string", index: false },
        { name: "contentHash", type: "string", index: false },
        { name: "creator", type: "publicKey", index: false }
      ]
    }
  ]
};

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
    
    const program = new Program(tokenFactoryIdl, TOKEN_FACTORY_PROGRAM_ID, provider);
    
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
    
    const program = new Program(tokenFactoryIdl, TOKEN_FACTORY_PROGRAM_ID, provider);
    
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
    const feeReceiver = factoryStateAccount.feeReceiver as PublicKey;
    
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

export async function getTokenMetadata(
  connection: Connection,
  metadataAddress: PublicKey
): Promise<TokenMetadata> {
  try {
    const provider = new AnchorProvider(
      connection,
      // We don't need a real wallet for this read-only operation
      { publicKey: PublicKey.default } as Wallet,
      { commitment: 'confirmed' }
    );
    
    const program = new Program(tokenFactoryIdl, TOKEN_FACTORY_PROGRAM_ID, provider);
    
    const rawMetadata = await program.account.tokenMetadata.fetch(metadataAddress);
    const contentType = rawMetadata.contentType as string;
    const contentHash = rawMetadata.contentHash as string;
    const creator = (rawMetadata.creator as PublicKey).toString();
    
    return {
      name: rawMetadata.name as string,
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