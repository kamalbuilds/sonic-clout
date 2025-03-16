"use client";

import { useNetwork, NETWORKS } from "@/context/NetworkContext";
import { useState } from "react";
import toast from "react-hot-toast";

export function NetworkToggle() {
  const { network, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkChange = (newNetwork: typeof NETWORKS.MAINNET) => {
    setNetwork(newNetwork);
    setIsOpen(false);
    toast.success(`Switched to ${newNetwork.label}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-sm transition-colors ${
          network.name === "mainnet"
            ? "bg-cyan-900/30 text-cyan-400 hover:bg-cyan-800/40"
            : "bg-purple-900/30 text-purple-400 hover:bg-purple-800/40"
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            network.name === "mainnet" ? "bg-cyan-400" : "bg-purple-400"
          }`}
        ></span>
        {network.label}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-black/90 border border-cyan-800 rounded-md shadow-lg shadow-cyan-500/20 p-1 z-10 backdrop-blur w-40">
          <button
            onClick={() => handleNetworkChange(NETWORKS.MAINNET)}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              network.name === "mainnet"
                ? "bg-cyan-900/30 text-cyan-400"
                : "text-cyan-600 hover:bg-cyan-900/20 hover:text-cyan-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                network.name === "mainnet" ? "bg-cyan-400" : "bg-cyan-800"
              }`}
            ></span>
            {NETWORKS.MAINNET.label}
          </button>
          <button
            onClick={() => handleNetworkChange(NETWORKS.TESTNET)}
            className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
              network.name === "testnet"
                ? "bg-purple-900/30 text-purple-400"
                : "text-purple-600 hover:bg-purple-900/20 hover:text-purple-400"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                network.name === "testnet" ? "bg-purple-400" : "bg-purple-800"
              }`}
            ></span>
            {NETWORKS.TESTNET.label}
          </button>
        </div>
      )}
    </div>
  );
}