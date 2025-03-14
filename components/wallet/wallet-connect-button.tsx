"use client";

import { useOrbis } from "@orbisclub/components";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";

export function WalletButton() {
  const navigate = useRouter();

  const { orbis, user, setConnectModalVis, setUser } = useOrbis();

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
        <DropdownMenuContent className="w-56 bg-white border-none">
          <DropdownMenuItem onClick={() => {
            navigate.push('/profile')
          }} className="cursor-pointer hover:bg-gray-300">
            My Account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="cursor-pointer hover:bg-gray-300">
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