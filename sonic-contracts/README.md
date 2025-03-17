# Sonic Anchor Programs

This repository contains Anchor programs for the SonicClout platform, designed to run on the Sonic SVM (Solana Virtual Machine).

## Programs

### 1. Token Factory (`token_factory`)

A program for creating and managing content tokens. Similar to the Solidity `SPLTokenFactory` contract, it allows users to create tokens representing tokenized social content.

Features:
- Create tokens with metadata (name, symbol, content type, content hash)
- Track token creation with a counter
- Charge a mint fee for token creation

### 2. Skill Vesting (`skill_vesting`)

A program for vesting tokens based on social metrics tracked by oracles. Similar to the Solidity `SkillVesting` contract, it allows creators to set up vesting schedules with milestones based on social metrics like followers, views, or likes.

Features:
- Create vesting schedules with milestones
- Check milestones against oracle data
- Withdraw unlocked tokens when milestones are reached

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sonic-anchor.git
cd sonic-anchor
```

2. Install dependencies:
```bash
yarn install
```

3. Build the programs:
```bash
anchor build
```

4. Update the program IDs in `Anchor.toml` and in the program files (`lib.rs`) with the generated program IDs.

5. Deploy the programs:
```bash
anchor deploy
```

## Usage

### Token Factory

Initialize the token factory:

```typescript
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import tokenFactoryIdl from './target/idl/token_factory.json';

// Program ID from Anchor.toml after build
const TOKEN_FACTORY_PROGRAM_ID = new PublicKey('SPLEZkhJTqLPgAB4wDUMTVnPTyCBTCUULYAjK6SxEKib');

// Initialize the factory
const factoryState = await program.methods
  .initialize(new BN(0.5 * web3.LAMPORTS_PER_SOL), wallet.publicKey)
  .accounts({
    factoryState: factoryStateKeypair.publicKey,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([factoryStateKeypair])
  .rpc();
```

Create a token:

```typescript
// Create a token
await program.methods
  .createToken(
    "My Content Token",
    "MCT",
    new BN(1000000),
    "post",
    "QmHash...",
    9 // decimals
  )
  .accounts({
    factoryState,
    tokenMetadata: tokenMetadataKeypair.publicKey,
    contentHashAccount,
    mint: mintKeypair.publicKey,
    tokenAccount,
    payer: wallet.publicKey,
    feeReceiver,
    payment: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([mintKeypair, tokenMetadataKeypair])
  .rpc();
```

### Skill Vesting

Initialize the vesting program:

```typescript
// Program ID from Anchor.toml after build
const SKILL_VESTING_PROGRAM_ID = new PublicKey('SkLvStvncgAwXjKWnNVEF7MWZXkAF1MJ6Wkdynds8nqN');

// Initialize the vesting program
await program.methods
  .initialize()
  .accounts({
    vestingState: vestingStateKeypair.publicKey,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .signers([vestingStateKeypair])
  .rpc();
```

Create a vesting schedule:

```typescript
// Create a vesting schedule
await program.methods
  .createVesting(
    new BN(1000000), // amount
    "followers", // metric type
    [new BN(1000), new BN(5000), new BN(10000)], // thresholds
    [new BN(2000), new BN(3000), new BN(5000)] // unlock percentages (20%, 30%, 50%)
  )
  .accounts({
    vestingState,
    vestingSchedule: vestingScheduleKeypair.publicKey,
    creatorVestings,
    tokenMint,
    tokenFrom,
    tokenVault,
    tokenVaultAuthority,
    oracle,
    creator: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: web3.SYSVAR_RENT_PUBKEY,
  })
  .signers([vestingScheduleKeypair])
  .rpc();
```

Check milestones and withdraw unlocked tokens:

```typescript
// Check milestones
await program.methods
  .checkMilestones()
  .accounts({
    vestingSchedule,
    oracle,
    signer: wallet.publicKey,
  })
  .rpc();

// Withdraw unlocked tokens
await program.methods
  .withdrawUnlocked()
  .accounts({
    vestingSchedule,
    tokenVault,
    tokenVaultAuthority,
    tokenTo,
    oracle,
    creator: wallet.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

## Integration with SonicClout App

To integrate these Anchor programs with the SonicClout app, use the provided service files:

- `app/lib/services/tokenFactoryService.ts` - For interacting with the token factory program
- `app/lib/services/anchorVestingService.ts` - For interacting with the skill vesting program

These services provide a high-level API for interacting with the Anchor programs, abstracting away the complexity of the Anchor client.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 