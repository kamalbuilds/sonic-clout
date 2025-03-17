import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMint,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';


const SONIC_TOKEN_FACTORY_PROGRAM_ID = process.env.NEXT_PUBLIC_SONIC_TOKEN_FACTORY_PROGRAM_ID || 'TokenFactoryProgram111111111111111111111111111';

export interface TokenMetadata {
  name: string;
  description: string;
  image?: string;
  properties: {
    type: string;
    content: string;
    creator: string;
  };
}

export interface TokenCreationParams {
  name: string;
  symbol: string;
  initialSupply: number;
  metadata: {
    type: string;
    content: string;
    creator: string;
  };
}

/**
 * Creates a new SPL token using the Sonic token factory program
 */
export async function createSPLToken(
  params: TokenCreationParams,
  wallet: any
): Promise<string> {
  try {
    // Connect to the Solana network
    const connection = new Connection(
      process.env.NEXT_PUBLIC_SONIC_RPC_URL || 'https://api.testnet.sonic.game',
      'confirmed'
    );
    
    // Create provider from wallet
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    // Create a new mint account
    const mintKeypair = Keypair.generate();
    const decimals = 9;
    
    // Calculate rent exemption for mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      82 // Standard size for a mint account
    );
    
    // Create the mint account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      lamports: mintRent,
      space: 82,
      programId: TOKEN_PROGRAM_ID,
    });
    
    // Initialize mint instruction
    const initializeMintInstruction = createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    );
    
    // Get associated token account for the wallet
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    // Create associated token account instruction
    const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      associatedTokenAddress,
      wallet.publicKey,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    
    // Calculate initial supply with decimals
    const initialSupplyWithDecimals = params.initialSupply * (10 ** decimals);
    
    // Create mint to instruction
    const mintToInstruction = createMintToInstruction(
      mintKeypair.publicKey,
      associatedTokenAddress,
      wallet.publicKey,
      BigInt(initialSupplyWithDecimals),
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Create memo instruction for metadata
    const metadataString = JSON.stringify({
      name: params.name,
      symbol: params.symbol,
      metadata: params.metadata
    });
    
    const memoInstruction = new web3.TransactionInstruction({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(metadataString)
    });
    
    // Create transaction
    const transaction = new Transaction();
    transaction.add(createAccountInstruction);
    transaction.add(initializeMintInstruction);
    transaction.add(createTokenAccountInstruction);
    transaction.add(mintToInstruction);
    transaction.add(memoInstruction);
    
    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet.payer, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log('Token created with signature:', signature);
    
    return mintKeypair.publicKey.toString();
  } catch (error) {
    console.error('Error creating SPL token:', error);
    throw error;
  }
} 