"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef } from "react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { select, wallets } = useWallet();
  const modalRef = useRef<HTMLDivElement>(null);

  const supportedWalletNames = ["Backpack", "Nightly"];
  const filteredWallets = wallets.filter(
    (wallet) =>
      supportedWalletNames.includes(wallet.adapter.name) &&
      wallet.readyState === WalletReadyState.Installed
  );

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal with ESC key
  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-black/90 border border-cyan-800 rounded-lg p-6 w-full max-w-md shadow-lg shadow-cyan-500/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-cyan-400">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300"
          >
            ✕
          </button>
        </div>

        {filteredWallets.length > 0 ? (
          <div className="space-y-4">
            {filteredWallets.map((wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={() => {
                  select(wallet.adapter.name);
                  onClose();
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono border border-cyan-400/20 shadow-lg shadow-cyan-500/20 flex items-center gap-3"
              >
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="w-6 h-6"
                />
                Connect with {wallet.adapter.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-cyan-400 mb-4">No supported wallets found</p>
            <div className="flex flex-col gap-4">
              <a
                href="https://www.backpack.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono"
              >
                Install Backpack
              </a>
              <a
                href="https://nightly.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono"
              >
                Install Nightly
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}