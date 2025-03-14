import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/social/post-card";
import { TokenCard } from "@/components/trading/token-card";
import CreatePost from "@/components/social/create-post";
import Posts from "@/components/social/posts";
import { VestingDashboard } from "@/components/vesting/vesting-dashboard";
import { SonicBonds } from "@/components/bonds/sonic-bonds";
import Link from "next/link";

export default function Home() {
  const sampleTokens = [
    {
      name: "Aurory Clip Token",
      symbol: "CLIP",
      price: 0.85,
      priceChange24h: 0.12,
      volume24h: 24500,
      marketCap: 120000,
      contentType: "clip" as const,
    },
    {
      name: "Star Atlas",
      symbol: "ATLAS",
      icon: "https://cryptologos.cc/logos/star-atlas-atlas-logo.png",
      price: 0.02,
      priceChange24h: -0.05,
      volume24h: 1250000,
      marketCap: 45000000,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CreatePost />
          <Posts />
        </div>

        <div className="space-y-6">
          <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Trending Tokens</h2>
              <Button variant="glass" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {sampleTokens.map((token) => (
                <TokenCard key={token.symbol} {...token} />
              ))}
            </div>
          </GlassCard>

          <VestingDashboard />

          <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sonic Bonds</h2>
              <Link href="/bonds">
                <Button variant="glass" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">Boss Attempts</div>
                  <div className="text-xs text-gray-400">Aurory Game</div>
                </div>
                <Button variant="glass" size="sm">Trade</Button>
              </div>

              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">Clip Shares</div>
                  <div className="text-xs text-gray-400">CryptoGamer</div>
                </div>
                <Button variant="glass" size="sm">Trade</Button>
              </div>

              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">Viral Posts</div>
                  <div className="text-xs text-gray-400">SolanaBuilder</div>
                </div>
                <Button variant="glass" size="sm">Trade</Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
