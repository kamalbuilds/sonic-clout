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
      icon: "https://cryptologos.cc/logos/cube-auto-logo.png",
      price: 0.85,
      priceChange24h: 0.12,
      volume24h: 24500,
      marketCap: 120000,
      contentType: "clip" as const,
    },
    {
      name: "Star Atlas",
      symbol: "ATLAS",
      icon: "https://cryptologos.cc/logos/appcoins-appc-logo.png",
      price: 0.02,
      priceChange24h: -0.05,
      volume24h: 1250000,
      marketCap: 45000000,
    },
  ];

  const textShadowStyle = { textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <CreatePost />
          <Posts />
        </div>

        <div className="space-y-6">
          <GlassCard 
            className="p-5" 
            hover="scale" 
            glassBefore={true} 
            glassHighlight={true} 
            variant="default"
            gradient="rgba(138, 43, 226, 0.2), rgba(56, 189, 248, 0.2)"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold tracking-wide" style={textShadowStyle}>Trending Tokens</h2>
              <Link href="/tokens">
                <Button variant="glass" size="sm" className="interactive-item">View All</Button>
              </Link>
            </div>
            <div className="space-y-4">
              {sampleTokens.map((token) => (
                <TokenCard key={token.symbol} {...token} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-0 overflow-hidden" variant="dark">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Skill Vesting</h2>
                <Link href="/vesting">
                  <Button 
                    variant="glassColored" 
                    gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)" 
                    size="sm"
                  >
                    View All
                  </Button>
                </Link>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Connect your wallet to view your vesting schedules
              </p>
              <Button 
                variant="glassColored" 
                gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
                className="w-full"
              >
                Connect Wallet
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="p-4" hover="glow"
                      variant="colored" 
                      gradient="rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3)"
                    >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sonic Bonds</h2>
              <Link href="/bonds">
                <Button variant="glass" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                <div>
                  <div className="font-medium">Boss Attempts</div>
                  <div className="text-xs text-white-400">Aurory Game</div>
                </div>
                <Button variant="glassColored" 
                gradient="rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)" size="sm">Trade</Button>
              </div>

              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                <div>
                  <div className="font-medium">Clip Shares</div>
                  <div className="text-xs text-white-400">CryptoGamer</div>
                </div>
                <Button variant="glassColored" 
                gradient="rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)" size="sm">Trade</Button>
              </div>

              <div className="bg-white/5 rounded-md p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                <div>
                  <div className="font-medium">Viral Posts</div>
                  <div className="text-xs text-white-400">SolanaBuilder</div>
                </div>
                <Button   variant="glassColored" 
                gradient="rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)"
                 size="sm">Trade</Button>
              </div>
            </div>
          </GlassCard>
          
          {/* <GlassCard 
            variant="colored" 
            gradient="rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3)"
            className="p-4"
          >
            <h2 className="text-xl font-bold mb-3">New! Glassmorphism UI</h2>
            <p className="text-white/80 text-sm mb-3">
              Check out our new glassmorphism UI components in the showcase page.
            </p>
            <Link href="/glassmorphism">
              <Button 
                variant="glassColored" 
                gradient="rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)"
                className="w-full"
              >
                View Examples
              </Button>
            </Link>
          </GlassCard> */}
        </div>
      </div>
    </div>
  );
}
