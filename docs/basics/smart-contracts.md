---
description: Technical overview of SonicClout's Anchor programs
---

# Smart Contracts

SonicClout is built on a foundation of Solana-based smart contracts written using the Anchor framework. This documentation provides a technical overview of the contracts that power the platform's core functionality.

## Anchor Programs Overview

SonicClout utilizes several Anchor programs deployed on the Solana blockchain:

1. **Token Factory** - Creates and manages content tokens
2. **Skill Vesting** - Handles milestone-based token vesting
3. **SEGA Protocol** - Powers the trading and liquidity infrastructure
4. **Bonds Engine** - Manages bond issuance and redemption
5. **Derivatives Framework** - Enables options and futures contracts

## Token Factory Program

The Token Factory program allows creators to mint tokens representing their content.

### Key Accounts

- **Factory State** - Stores global configuration and token counter
- **Token Metadata** - Stores metadata for each created token
- **Content Hash Account** - Links tokens to content identifiers

### Instructions

#### Initialize

```rust
pub fn initialize(
    ctx: Context<Initialize>,
    mint_fee: u64,
    fee_receiver: Pubkey
) -> Result<()>
```

Initializes the token factory with mint fee parameters.

#### Create Token

```rust
pub fn create_token(
    ctx: Context<CreateToken>,
    name: String,
    symbol: String,
    amount: u64,
    content_type: String,
    content_hash: String,
    decimals: u8
) -> Result<()>
```

Creates a new token with associated metadata.

### Usage Example

```typescript
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

## Skill Vesting Program

The Skill Vesting program allows creators to lock tokens that unlock based on social metric milestones.

### Key Accounts

- **Vesting State** - Stores global vesting configuration
- **Vesting Schedule** - Contains milestone details for each vesting schedule
- **Token Vault** - Securely holds tokens until milestones are reached
- **Creator Vestings** - Tracks all vesting schedules for a creator

### Instructions

#### Initialize

```rust
pub fn initialize(
    ctx: Context<Initialize>
) -> Result<()>
```

Initializes the vesting program.

#### Create Vesting

```rust
pub fn create_vesting(
    ctx: Context<CreateVesting>,
    amount: u64,
    metric_type: String,
    thresholds: Vec<u64>,
    unlock_percentages: Vec<u64>
) -> Result<()>
```

Creates a new vesting schedule with milestones.

#### Check Milestones

```rust
pub fn check_milestones(
    ctx: Context<CheckMilestones>
) -> Result<()>
```

Verifies if creator has reached milestones via oracle data.

#### Withdraw Unlocked

```rust
pub fn withdraw_unlocked(
    ctx: Context<WithdrawUnlocked>
) -> Result<()>
```

Allows creator to withdraw unlocked tokens.

### Usage Example

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

## SEGA Protocol

The SEGA protocol powers the trading infrastructure for content tokens.

### Key Components

- **Pool Contract** - Manages liquidity pools and swap functionality
- **Router Contract** - Handles multi-hop routing for optimal swaps
- **Position Manager** - Tracks liquidity positions for providers
- **Fee System** - Allocates trading fees to liquidity providers

### Core Features

- Automated Market Maker (AMM) functionality
- Concentrated liquidity similar to Uniswap v3
- Multi-token swap routes
- Custom fee tiers

## Contract Security

SonicClout's contracts implement several security measures:

- **Access Control** - Strict permission systems for sensitive operations
- **Overflow Protection** - Safe math operations to prevent numeric overflow
- **Re-entrancy Guards** - Protection against re-entrancy attacks
- **Oracle Validation** - Verification of external data sources
- **Emergency Shutdown** - Circuit breakers for critical issues

## Development and Deployment

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)

### Building the Programs

```bash
# Clone the repository
git clone https://github.com/sonicclout/sonic-anchor.git
cd sonic-anchor

# Install dependencies
yarn install

# Build the programs
anchor build
```

### Testing

```bash
# Run the test suite
anchor test

# Run specific tests
anchor test -- -t skill_vesting
```

### Deployment

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## Program Addresses

- **Token Factory**: `SPLEZkhJTqLPgAB4wDUMTVnPTyCBTCUULYAjK6SxEKib`
- **Skill Vesting**: `SkLvStvncgAwXjKWnNVEF7MWZXkAF1MJ6Wkdynds8nqN`
- **SEGA Protocol**: `SEGAZQg4iFgkMq3H5WFz3HPLGbJTp1FQUhrF3EQgga9`

## Integration with Frontend

The SonicClout frontend interacts with these contracts through service files:

- `app/lib/services/tokenFactoryService.ts`
- `app/lib/services/sonicVestingService.ts`
- `app/lib/services/segaService.ts`

These services provide a high-level API for interacting with the Anchor programs.

## Next Steps

- Learn about the [frontend architecture](frontend-architecture.md)
- Explore the [API reference](api-reference.md)
- Understand [content tokenization](content-tokenization.md) from a user perspective 