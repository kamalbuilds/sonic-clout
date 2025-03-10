"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Network = {
  name: string;
  endpoint: string;
  label: string;
};

export const NETWORKS = {
  MAINNET: {
    name: "mainnet",
    endpoint: "https://rpc.mainnet-alpha.sonic.game",
    label: "Sonic Mainnet",
  },
  TESTNET: {
    name: "testnet",
    endpoint: "https://api.testnet.sonic.game",
    label: "Sonic Testnet",
  },
};

type NetworkContextType = {
  network: Network;
  setNetwork: (network: Network) => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<Network>(NETWORKS.MAINNET);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}