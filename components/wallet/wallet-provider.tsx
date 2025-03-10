"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { NightlyWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo } from "react";
import { useNetwork } from "@/context/NetworkContext";

export function CustomWalletMultiButton() {
  const { select, wallets, publicKey, disconnect } = useWallet();

  const supportedWalletNames = ["Backpack", "Nightly"];
  const filteredWallets = wallets.filter(
    (wallet) =>
      supportedWalletNames.includes(wallet.adapter.name) &&
      wallet.readyState === WalletReadyState.Installed
  );

  if (publicKey) {
    return (
      <button
        onClick={() => disconnect()}
        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono border border-cyan-400/20 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
      >
        <span className="text-xs opacity-80">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
        <span className="border-l border-white/20 pl-2">Disconnect</span>
      </button>
    );
  }

  // Show direct connect buttons if wallets are installed
  if (filteredWallets.length > 0) {
    return (
      <div className="flex gap-3">
        {filteredWallets.map((wallet) => (
          <button
            key={wallet.adapter.name}
            onClick={() => select(wallet.adapter.name)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono border border-cyan-400/20 shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="w-5 h-5"
            />
            Connect {wallet.adapter.name}
          </button>
        ))}
      </div>
    );
  }

  // If no supported wallets are installed, show install message
  return (
    <div className="text-center">
      <p className="text-cyan-400 mb-4">No supported wallets found</p>
      <div className="flex gap-4 justify-center">
        <a
          href="https://www.backpack.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono text-sm"
        >
          Install Backpack
        </a>
        <a
          href="https://nightly.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono text-sm"
        >
          Install Nightly
        </a>
      </div>
    </div>
  );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { network } = useNetwork();
  const wallets = useMemo(() => [new NightlyWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={network.endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        {children}
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}