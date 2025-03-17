# Clout App Architecture

This document outlines the architecture of the Clout app after its migration from Ethereum to Solana.

## Overview

Clout is a platform that allows users to tokenize content (posts, clips, profiles) and create token vesting schedules based on social media metrics such as followers, views, or likes. The platform has been migrated from Ethereum to Solana for better scalability, lower fees, and faster transactions.

## System Components

### Frontend

- **Next.js Application**: The main frontend application built with Next.js and React
- **UI Components**: Reusable components for token creation, vesting, and user interactions
- **Wallet Integration**: Support for Solana wallets via `@solana/wallet-adapter-react`

### Backend Services

- **Token Service**: Creates and manages SPL tokens on Solana
- **Vesting Service**: Manages token vesting schedules based on social metrics
- **IPFS Service**: Handles content storage and retrieval via IPFS
- **Migration Helper**: Utilities to assist in migration from Ethereum to Solana

### Solana Smart Contracts

- **Skill Vesting Program**: Anchor-based Solana program for vesting tokens
- **Token Factory Program**: Anchor-based program for creating SPL tokens

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                            │
│                                                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────────┐   │
│  │  TokenizeUI   │  │  VestingUI    │  │  User Dashboard / Profile │   │
│  └───────┬───────┘  └───────┬───────┘  └─────────────┬─────────────┘   │
│          │                  │                        │                  │
│          ▼                  ▼                        ▼                  │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Wallet Connection Layer                         │ │
│  └─────────────────────────────┬─────────────────────────────────────┘ │
└───────────────────────────────┬┴────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER                                     │
│                                                                           │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────────────┐ │
│  │ tokenService  │    │ vestingService│    │ ipfsService               │ │
│  └───────┬───────┘    └───────┬───────┘    └─────────────┬─────────────┘ │
│          │                    │                          │                │
│  ┌───────▼───────┐    ┌───────▼───────┐    ┌─────────────▼─────────────┐ │
│  │tokenFactoryService│ │sonicVestingService│ │migrationHelper          │ │
│  └───────┬───────┘    └───────┬───────┘    └─────────────┬─────────────┘ │
└──────────┼─────────────────────┼────────────────────────┼─────────────────┘
           │                     │                        │
           ▼                     ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          BLOCKCHAIN LAYER                                 │
│                                                                          │
│  ┌───────────────────┐       ┌────────────────────┐     ┌──────────────┐│
│  │  Token Factory    │       │ Skill Vesting      │     │ IPFS Storage ││
│  │  Solana Program   │       │ Solana Program     │     │              ││
│  └───────────────────┘       └────────────────────┘     └──────────────┘│
│                                                                          │
│                        SOLANA BLOCKCHAIN                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Token Creation**:
   - User connects wallet through the UI
   - User enters token metadata and uploads content
   - Content is stored on IPFS via `ipfsService`
   - `tokenService` creates a new SPL token using `tokenFactoryService`
   - Token details are stored on-chain

2. **Vesting Creation**:
   - User selects token and defines vesting schedule (milestones based on social metrics)
   - `vestingService` creates a vesting schedule via `sonicVestingService`
   - Vesting details are stored on-chain with the Skill Vesting program

3. **Milestone Checking**:
   - Oracle reports social metrics data on-chain
   - User triggers milestone verification through UI
   - `sonicVestingService` checks if any milestones have been reached
   - If milestones are reached, tokens are unlocked

4. **Token Withdrawal**:
   - User sees unlocked tokens in the dashboard
   - User requests withdrawal of unlocked tokens
   - `sonicVestingService` transfers unlocked tokens to user's wallet

## Service Descriptions

### tokenService.ts

Primary interface for token operations:
- Creating SPL tokens with metadata
- Minting tokens
- Retrieving token information

### sonicVestingService.ts

Handles vesting operations for Solana:
- Creating vesting schedules
- Checking milestones
- Withdrawing unlocked tokens
- Querying vesting schedules

### anchorVestingService.ts

Low-level interaction with the Skill Vesting program using Anchor framework (used by sonicVestingService).

### tokenFactoryService.ts

Low-level service for token factory operations (used by tokenService).

### ipfsService.ts

Handles content storage and retrieval:
- Uploading content metadata to IPFS
- Retrieving content from IPFS

### migrationHelper.ts

Utilities to help with migration:
- Converting Ethereum addresses to Solana addresses
- Converting token amounts between decimal conventions
- Converting vesting schedule formats

## Contract Architecture

### Skill Vesting Program

- **VestingState**: Stores global state like vesting counter
- **VestingSchedule**: Individual vesting schedule with milestones
- **CreatorVestings**: Mapping of creator to their vesting schedules
- **Instruction Handlers**:
  - `initialize`: Set up the vesting program
  - `createVesting`: Create a new vesting schedule
  - `checkMilestones`: Verify if milestones have been reached
  - `withdrawUnlocked`: Withdraw unlocked tokens

### Token Factory Program

- **FactoryState**: Stores global state like token counter
- **TokenMetadata**: Stores metadata for created tokens
- **Instruction Handlers**:
  - `initialize`: Set up the token factory
  - `createToken`: Create a new SPL token with metadata

## Security Considerations

- Wallet authentication via Solana wallet adapter
- PDAs (Program Derived Addresses) for secure token storage
- Oracle verification for milestone data
- Authority checks for withdrawal operations

## Deployment

The Solana programs are deployed to:
- Devnet for testing: https://api.testnet.sonic.game
- Mainnet (pending): https://api.mainnet.sonic.game

Frontend deployment uses Vercel for hosting the Next.js application. 