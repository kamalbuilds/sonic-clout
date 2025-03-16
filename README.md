# SonicClout - A Sonic SVM-Powered SocialFi Platform

> Attention Amplified, Value Tokenized.

SonicClout is a Sonic SVM-native social platform where gaming communities, crypto traders, and content creators tokenize attention and virality. 

Built using Sonic SVM's high-speed infrastructure, Orb SDK for social primitives, and Agent Kit for automation.

- Docs -> https://cryptoinnovators.gitbook.io/sonic-clout

## Features

- **Social Trading Hub**: Share strategies, memes, and trades; followers replicate via Sonic DEX.
- **Clip/Post-to-Token Engine**: Mint SPL tokens tied to gameplay clips or trending posts.
- **Skill Vesting**: KOLs earn $SONIC as content hits view/follower milestones (via Switchboard oracles).
- **Sonic Bonds**: Trade bonds pegged to in-game metrics or social trends.

## Demo Video

https://www.youtube.com/watch?v=pKfJja25hm8

## Program-IDs

## Tech Stack

- **Frontend**: React/Next.js + Orb SDK (social feeds, profiles), Sonic Wallet Adapter
- **Smart Contracts**: Sonic SVM (Anchor Framework), MPL Token Metadata (NFTs/SPL tokens), Switchboard Oracles
- **Social Layer**: Orb SDK (user identities, SBTs), Sonic Agent Kit (auto-trade/content bots)
- **Trading**: Jupiter DEX Aggregator, Sonic DEX Pools, Sonic Stochastic Bonds Protocol
- **Data**: Sonic Indexer (on-chain queries), IPFS (decentralized storage)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Solana CLI tools
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kamalbuilds/sonic-clout.git
   cd sonic-clout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Next.js app directory with pages and layouts
- `/components` - React components organized by feature
  - `/ui` - Reusable UI components with glassmorphism effects
  - `/wallet` - Solana wallet integration components
  - `/social` - Social feed and post components
  - `/trading` - Token trading and marketplace components
- `/public` - Static assets
- `/lib` - Utility functions and shared code

## Core Workflows

1. **Social Media Interface (Powered by Orb SDK)**
   - User Profiles: Orb-managed SBTs for identity, reputation, and social graph
   - Content Types: Gameplay clips, memes, trade signals
   - Viral Tracking: Real-time leaderboards using Switchboard oracles

2. **Skill Vesting via Sonic Contracts**
   - KOLs lock $SONIC tokens; 20% unlocks at 1K followers (tracked by Orb social graph)

3. **Content-to-SPL Token Engine**
   - 1-Click Tokenization: Users mint SPL tokens tied to posts/clips using Sonic SDK
   - Reflexive AMM Pools: Auto-create liquidity pools on Sonic DEX

4. **Sonic Attention Bonds**
   - Dynamic Bonds: Trade bonds tied to metrics like "Boss Attempts" or "Clip Shares"
   - Pricing: Bond value = (Total Attention) / (Bond Supply), updated via Sonic Indexer

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sonic SVM
- Orb SDK
- Sega Dex Integrated
- Switchboard Oracles 