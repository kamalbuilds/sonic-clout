"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { WalletModal } from "./WalletModal";
import { useOrbis } from "@orbisclub/components";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function WalletButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { publicKey, disconnect } = useWallet();

  const { orbis, user, connecting, setConnectModalVis, setUser } = useOrbis();

  if (user) {

    async function disconnect() {
      const res = await orbis.logout();
      if (res.status == 200) {
        setUser(null);
      }
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{user.did.slice(0, 6)}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator />
          <DropdownMenuItem>GitHub</DropdownMenuItem>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Button
        onClick={() => setConnectModalVis(true)}
        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono border border-cyan-400/20 shadow-lg shadow-cyan-500/20"
      >
        Connect Wallet
      </Button>
    </>
  );
}