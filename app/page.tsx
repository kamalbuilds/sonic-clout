import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/social/post-card";
import { TokenCard } from "@/components/trading/token-card";
import CreatePost from "@/components/social/create-post";
import Posts from "@/components/social/posts";

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

          <GlassCard className="p-4">
            <h2 className="text-xl font-bold mb-4">Skill Vesting</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Followers</span>
                  <span className="text-sm font-bold">250/1000</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Unlock 20% $SONIC at 1,000 followers</div>
              </div>

              <div className="bg-white/5 rounded-md p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Content Views</span>
                  <span className="text-sm font-bold">15K/50K</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: "30%" }}></div>
                </div>
                <div className="text-xs text-gray-400 mt-1">Unlock 30% $SONIC at 50K views</div>
              </div>

              <Button
                variant="glassColored"
                gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
                className="w-full"
              >
                Claim Available $SONIC
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h2 className="text-xl font-bold mb-4">Sonic Bonds</h2>
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
