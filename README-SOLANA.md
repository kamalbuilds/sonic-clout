# Solana Integration for Clout App

This README explains the Solana integration for token creation and vesting functionality in the Clout app.

## Overview

The Clout app has been updated to use Solana blockchain instead of Ethereum for token-related functionality. This includes:

1. **Token Creation** - Creating SPL tokens for user content
2. **Skill Vesting** - Creating token vesting schedules that unlock based on social metrics

## Setup

### Prerequisites

- Solana CLI tools
- Node.js and npm/yarn
- Anchor framework

### Solana Dependencies

The following Solana dependencies have been installed:

```
@solana/web3.js - Core Solana JavaScript API
@solana/spl-token - Library for interacting with SPL tokens
@coral-xyz/anchor - Framework for Solana program development
@solana/wallet-adapter-react - React hooks for Solana wallet integration
@solana/wallet-adapter-wallets - Wallet adapters for various Solana wallets
```

## Components

### Token Service

The `tokenService.ts` provides functionality for creating SPL tokens on Solana. Key features:

- Create new SPL tokens with metadata
- Mint initial token supply
- Associate tokens with creators

### Vesting Service

The `sonicVestingService.ts` provides functions for managing token vesting schedules:

- Create vesting schedules linked to social metrics (followers, views, likes)
- Check milestones and unlock tokens when thresholds are reached
- Withdraw unlocked tokens
- View vesting schedules

## Usage Examples

### Creating a Token

```tsx
import { createSPLToken } from '@/app/lib/services/tokenService';
import { useWallet } from '@solana/wallet-adapter-react';

// In a React component
const wallet = useWallet();

const handleCreateToken = async () => {
  if (!wallet.publicKey || !wallet.signTransaction) return;
  
  const tokenParams = {
    name: "My Content Token",
    symbol: "MCT",
    initialSupply: 1000000,
    metadata: {
      type: "post",
      content: "Content reference or hash",
      creator: wallet.publicKey.toString()
    }
  };
  
  const tokenAddress = await createSPLToken(tokenParams, wallet);
  console.log(`Token created at: ${tokenAddress}`);
};
```

### Creating a Vesting Schedule

```tsx
import { createVesting } from '@/app/lib/services/sonicVestingService';
import { useWallet } from '@solana/wallet-adapter-react';

// In a React component
const wallet = useWallet();

const handleCreateVesting = async () => {
  if (!wallet.publicKey || !wallet.signTransaction) return;
  
  const vestingParams = {
    tokenMintAddress: "YourTokenMintAddress",
    amount: 100000,
    oracleAddress: "OracleAddressForMetrics",
    metricType: "followers",
    milestones: [
      { threshold: 1000, unlockPercentage: 2500 }, // 25%
      { threshold: 5000, unlockPercentage: 2500 }, // 25%
      { threshold: 10000, unlockPercentage: 5000 } // 50%
    ]
  };
  
  const vestingId = await createVesting(vestingParams, wallet);
  console.log(`Vesting schedule created with ID: ${vestingId}`);
};
```

## UI Components

- **TokenizeContent** - UI for creating tokens from content
- **CreateVesting** - Form for creating vesting schedules
- **VestingDashboard** - Dashboard for managing vesting schedules

## Solana Contract (skill_vesting)

The Solana contract provides on-chain logic for:

1. Creating vesting schedules
2. Checking milestones via oracles
3. Unlocking tokens based on reached milestones
4. Withdrawing unlocked tokens

## Security Considerations

- Always validate user input before sending transactions
- Use appropriate wallet connection error handling
- Consider rate limiting to prevent abuse
- Implement proper error handling for transaction failures

## Development Notes

When making changes to the Solana integration:

1. Update the appropriate service files in `app/lib/services`
2. Test with a Solana development environment before production
3. Use Phantom or another Solana wallet for testing
4. Check transaction fees and adjust accordingly

## Migration from Ethereum to Solana

The project has been migrated from Ethereum to Solana. This section explains how the migration was handled and provides guidance for completing the transition.

### Changes Made

1. **Service Layer**:
   - Created new Solana-based services (`tokenService.ts`, `sonicVestingService.ts`)
   - Deprecated old Ethereum-based services (`vestingService.ts`)
   - Updated type definitions to use Solana terminology (`tokenMintAddress` instead of `tokenAddress`, etc.)

2. **UI Components**:
   - Updated the TokenizeContent component to use Solana wallet adapter
   - Updated the CreateVesting component to use Solana public keys
   - Updated the VestingDashboard to work with Solana vesting service

3. **Helper Functions**:
   - Created `migrationHelper.ts` with utility functions to assist in the transition
   - Implemented functions to convert between Ethereum and Solana formats

### Remaining Tasks

If you're continuing the migration, consider these remaining tasks:

1. **Remove ethers.js Dependency**:
   - Once all components are updated, you can safely remove the ethers.js dependency
   - Run `npm uninstall ethers`

2. **Data Migration**:
   - If you need to migrate existing data, use the helper functions in `migrationHelper.ts`
   - You may need to build additional scripts for batch migration

3. **Configuration Updates**:
   - Update any environment variables related to RPC endpoints
   - Update deployment scripts to target Solana instead of Ethereum

### Using Migration Helpers

The `migrationHelper.ts` file provides utility functions to help with the transition:

```typescript
import { 
  ethereumToSolanaAddress, 
  convertTokenAmount, 
  convertVestingSchedule 
} from '@/app/lib/services/migrationHelper';

// Convert an Ethereum address to Solana format
const solanaAddress = ethereumToSolanaAddress('0x1234567890123456789012345678901234567890');

// Convert token amounts between decimal conventions
const solanaAmount = convertTokenAmount('1000000000000000000', 18, 9);

// Convert a vesting schedule from Ethereum to Solana format
const solanaSchedule = convertVestingSchedule(ethereumSchedule);
```

### Testing the Migration

Before deploying to production, thoroughly test:

1. **Wallet Connections**: Ensure Solana wallets connect correctly
2. **Token Creation**: Test creating SPL tokens
3. **Vesting Functions**: Test creating vesting schedules, checking milestones, and withdrawing tokens

### Troubleshooting Common Issues

- **Type Errors**: If you encounter type errors, check if you're still using Ethereum types
- **Module Errors**: If modules are not found, ensure you've installed all required Solana dependencies
- **Runtime Errors**: For runtime errors, check if you're properly handling Solana-specific functions like PublicKey validation 