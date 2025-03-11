import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/social/post-card";
import { TokenCard } from "@/components/trading/token-card";

export default function Home() {
  // Sample data for demonstration
  const samplePosts = [
    {
      id: "1",
      author: {
        address: "8Kw7zWoJH5Luy4wVSXfubNzEjF4NJCcFgV5cxP2XTtSE",
        displayName: "CryptoGamer",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      content: "Just defeated the final boss in Aurory! Check out this epic gameplay clip! #GameFi #Solana",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      likes: 42,
      shares: 12,
      comments: 7,
      media: {
        type: "image" as const,
        url: "https://picsum.photos/seed/aurory/800/450",
      },
      tokenized: true,
      tokenPrice: 0.85,
      tokenSymbol: "$CLIP",
    },
    {
      id: "2",
      author: {
        address: "6Kw7zWoJH5Luy4wVSXfubNzEjF4NJCcFgV5cxP2XTtSE",
        displayName: "SolanaBuilder",
      },
      content: "Just deployed my first Solana program using Anchor! The developer experience is amazing. Who wants to help test it out? #SolanaDevs #Web3",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      likes: 28,
      shares: 5,
      comments: 12,
      tokenized: false,
    },
  ];

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
          <GlassCard className="p-4">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">?</span>
              </div>
              <div className="flex-1">
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's happening in the Solana ecosystem?"
                  rows={3}
                />
                <div className="flex justify-between mt-3">
                  <div className="flex gap-2">
                    <Button variant="glass" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Media
                    </Button>
                    <Button variant="glass" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Clip
                    </Button>
                  </div>
                  <Button
                    variant="glassColored"
                    gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Feed</h2>
            {samplePosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
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
