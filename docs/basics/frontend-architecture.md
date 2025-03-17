---
description: Technical overview of SonicClout's frontend architecture with Sonic integration
---

# Frontend Architecture

SonicClout's frontend is built with modern web technologies, focusing on performance, user experience, and seamless integration with the Sonic blockchain. This documentation outlines the technical architecture, key components, and design patterns used in the application.

## Technology Stack

The SonicClout frontend uses:

- **Next.js 14** - React framework with app router for routing and server components
- **TypeScript** - For type safety and better developer experience
- **TailwindCSS** - For styling and responsive design
- **React Context API** - For state management
- **Sonic SDK** - For Sonic blockchain interaction
- **Solana Web3.js** - For base Solana compatibility
- **Wallet Adapter** - Modified for Sonic wallet connections
- **ShadcnUI** - For UI components with a custom theme

## Application Structure

```
app/
├── components/    # Reusable UI components
├── context/       # Context providers for state management
├── app/           # Pages and routes (Next.js app router)
├── lib/           # Utilities and services
│   ├── services/  # Blockchain service integrations
│   ├── hooks/     # Custom React hooks
│   └── utils/     # Helper functions
└── public/        # Static assets
```

## Key Components

### App Router Structure

SonicClout uses Next.js App Router, organizing routes as folders:

```
app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout with common elements
├── profile/              # User profile pages
│   └── page.tsx
├── trading/              # Trading interface
│   └── page.tsx
├── vesting/              # Vesting management
│   └── page.tsx
└── bonds/                # Bonds marketplace
    └── page.tsx
```

### Context Providers

The app uses React Context API for state management:

#### Global Context

```typescript
// context/GlobalContext.tsx
export interface GlobalContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}
```

#### Network Context

```typescript
// context/NetworkContext.tsx
export interface NetworkContextType {
  network: 'sonic-mainnet' | 'sonic-devnet' | 'solana-mainnet' | 'solana-devnet';
  setNetwork: (network: 'sonic-mainnet' | 'sonic-devnet' | 'solana-mainnet' | 'solana-devnet') => void;
}
```

#### SEGA Context

```typescript
// context/SEGAContext.tsx
export interface SEGAContextType {
  pools: Pool[];
  userLiquidity: UserLiquidity[];
  tokenList: Token[];
  fetchPools: () => Promise<void>;
  fetchUserLiquidity: () => Promise<void>;
  addLiquidity: (poolId: string, amountA: number, amountB: number) => Promise<boolean>;
  removeLiquidity: (poolId: string, percentage: number) => Promise<boolean>;
  createPool: (tokenA: string, tokenB: string, fee: number) => Promise<boolean>;
  swap: (tokenIn: string, tokenOut: string, amountIn: string, slippage: number) => Promise<boolean>;
  getSwapQuote: (tokenIn: string, tokenOut: string, amountIn: string, slippage: number) => Promise<SwapResponse | null>;
}
```

#### Sonic Vesting Context

```typescript
// context/SonicVestingContext.tsx
export interface SonicVestingContextType {
  // State
  vestingSchedules: VestingSchedule[];
  selectedVestingId: number | null;
  
  // Actions
  initialize: () => Promise<void>;
  createVestingSchedule: (params: VestingParams) => Promise<number>;
  checkVestingMilestones: (vestingId: number) => Promise<boolean>;
  withdrawVestedTokens: (vestingId: number) => Promise<string>;
  fetchVestingSchedules: () => Promise<void>;
}
```

### UI Components

SonicClout's UI is built with reusable components:

#### Navigation

- `Navbar.tsx` - Main navigation bar
- `MobileMenu.tsx` - Responsive menu for mobile devices
- `SideNav.tsx` - Side navigation for dashboard views

#### Wallet Integration

- `WalletConnectButton.tsx` - Button for connecting Sonic-compatible wallets
- `WalletModal.tsx` - Modal for selecting wallet providers
- `WalletDetails.tsx` - Component displaying wallet info
- `NetworkSelector.tsx` - Switch between Sonic and Solana networks

#### Trading Interface

- `TradingView.tsx` - Main trading interface
- `OrderBook.tsx` - Displays buy/sell orders
- `SwapInterface.tsx` - Interface for token swaps
- `PoolsList.tsx` - Lists available liquidity pools

#### Content Components

- `ContentCard.tsx` - Displays tokenized content
- `CreatorProfile.tsx` - Shows creator information
- `ContentFeed.tsx` - Feed of tokenized content

## State Management

SonicClout uses a hybrid state management approach:

1. **React Context API** - For global state and blockchain interactions
2. **React Query** - For data fetching, caching, and synchronization
3. **Local Component State** - For UI-specific state
4. **URL State** - For shareable and persistent UI state

## Blockchain Integration

### Wallet Connection

Wallet connection is handled through a modified Solana Wallet Adapter for Sonic:

```typescript
// app/Providers.tsx
export function Providers({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new BackpackWalletAdapter(),
      new OKXWalletAdapter(),
      new NightlyWalletAdapter(),
      new BytbitWalletAdapter(),
      // Legacy Solana wallets with limited Sonic support
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} autoConnect>
      <ConnectionProvider endpoint={getSonicEndpoint()}>
        {/* Other providers */}
        {children}
      </ConnectionProvider>
    </WalletProvider>
  );
}

// Helper function to get appropriate endpoint
function getSonicEndpoint() {
  const network = localStorage.getItem('network') || 'sonic-mainnet';
  
  const endpoints = {
    'sonic-mainnet': 'https://mainnet.sonic.game/rpc',
    'sonic-devnet': 'https://devnet.sonic.game/rpc',
    'solana-mainnet': 'https://api.mainnet-beta.solana.com',
    'solana-devnet': 'https://api.devnet.solana.com',
  };
  
  return endpoints[network];
}
```

### Service Layer

The app uses service classes to interact with smart contracts on Sonic:

```typescript
// app/lib/services/sonicVestingService.ts
export async function createVesting(
  connection: Connection,
  wallet: WalletContextState,
  params: VestingParams
): Promise<number> {
  // Implementation for Sonic chain
}

// app/lib/services/tokenFactoryService.ts
export async function createToken(
  connection: Connection,
  wallet: WalletContextState,
  params: TokenParams
): Promise<string> {
  // Implementation for Sonic chain
}
```

## Styling and Theming

SonicClout uses TailwindCSS with a custom theme:

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    
    --primary: 266 73% 64%;
    --primary-foreground: 0 0% 100%;
    
    /* Additional theme variables */
  }
}
```

### UI Components Library

The application uses ShadcnUI components with customizations:

```tsx
// components/ui/button.tsx
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
```

## Sonic-Specific Integrations

### Sonic SDK Integration

The application integrates with Sonic's SDK for blockchain interaction:

```typescript
// lib/sonic.ts
import { SonicConnection } from '@sonic-game/web3.js';
import { createSonicTransaction } from '@sonic-game/transactions';

export function initializeSonicConnection(endpoint: string): SonicConnection {
  return new SonicConnection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

export async function executeSonicTransaction(
  connection: SonicConnection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  const sonicTx = await createSonicTransaction(transaction);
  // Process on Sonic chain...
}
```

### Metaplex Integration

For NFT functionality on Sonic:

```typescript
// lib/metaplex.ts
import { Metaplex } from '@metaplex-foundation/js';
import { sonicCluster } from '@sonic-game/web3.js';

export function createMetaplex(connection: Connection, wallet: Wallet): Metaplex {
  return Metaplex.make(connection)
    .use(walletAdapterIdentity(wallet))
    .use(sonicCluster());
}
```

## Performance Optimizations

SonicClout implements several performance optimizations:

1. **Code Splitting** - Using Next.js dynamic imports
2. **Image Optimization** - Using Next.js Image component
3. **Server Components** - For improved initial load time
4. **Memoization** - Using React.memo and useMemo for expensive calculations
5. **Virtualization** - For long lists using react-window
6. **Sonic RPC Optimizations** - Leveraging Sonic's high-throughput infrastructure

## Responsive Design

The application is fully responsive, implementing:

1. **Mobile-first approach** - Base styles for mobile, then expand
2. **Breakpoint-based layouts** - Using Tailwind's responsive modifiers
3. **Adaptive UI** - Different interfaces for different screen sizes
4. **Touch-friendly controls** - Larger tap targets on mobile

## Development Workflow

### Getting Started

```bash
# Clone the repository
git clone https://github.com/sonicclout/frontend.git
cd frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Environment Setup

Create a `.env.local` file with:

```
NEXT_PUBLIC_SONIC_RPC_ENDPOINT=https://mainnet.sonic.game/rpc
NEXT_PUBLIC_DEFAULT_NETWORK=sonic-mainnet
```

## Testing Strategy

SonicClout employs several testing strategies:

1. **Unit Tests** - Using Jest for utility functions
2. **Component Tests** - Using React Testing Library
3. **Integration Tests** - For complex component interactions
4. **End-to-End Tests** - Using Cypress for critical user flows
5. **Sonic-specific Tests** - Ensure compatibility with Sonic chain

## Deployment

The SonicClout frontend is deployed using Vercel:

1. **Preview Deployments** - For pull requests
2. **Staging Environment** - For pre-production testing
3. **Production Environment** - For the live site

## Next Steps

- Review the [API reference](api-reference.md) for all available endpoints
- Learn about [smart contracts](smart-contracts.md) powering the platform
- Explore [content tokenization](content-tokenization.md) from a user perspective 