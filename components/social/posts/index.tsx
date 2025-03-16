"use client";
import React, { useEffect, useState } from 'react';
import { PostCard } from '../post-card';
import { useOrbis } from "@orbisclub/components";
import { ORBIS_CONTEXT } from '@/constants';
import { LoadingCircle } from '@/components/LoadingCircle';
import { Post } from '@/types';
import PostContainer from './PostContainer';
import { GlassCard } from '@/components/ui/glass-card';
import ReplyContainer from './ReplyContainer';
import { useGlobalContext } from '@/context/GlobalContext';

const Posts = () => {

    const [isLoading, setIsLoading] = useState(false);
    const { orbis, user } = useOrbis();
    const [error, setError] = useState();

    const { fetchPosts, posts, loadingPosts } = useGlobalContext();

    const [selectedPostToReply, setSelectedPostToReply] = useState<Post | null>(null)

    useEffect(() => {
        if (user) fetchPosts(ORBIS_CONTEXT);
    }, [user])

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
                displayName: "FlipMaster",
                avatar: "https://i.pravatar.cc/150?img=6",
            },
            content: "Just deployed my first Solana program using Anchor! The developer experience is amazing. Who wants to help test it out? #SolanaDevs #Web3",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            likes: 28,
            shares: 5,
            comments: 12,
            tokenized: false,
        },
        {
            id: "3",
            author: {
                address: "5KE8nSM2xTVzkLMJx9iFX7NBf9a8yQNnBc8RCsjuF3yN",
                displayName: "LimboMaster",
                avatar: "https://i.pravatar.cc/150?img=3",
            },
            content: "I've cracked the code on Limbo! Consistently winning with 1.94x multipliers 🚀 Here's my proven strategy for minimizing risk while maximizing profit. #Zeebit #GamingStrategy",
            timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            likes: 57,
            shares: 23,
            comments: 15,
            media: {
                type: "image" as const,
                url: "/zeebit/limbo.png",
            },
            tokenized: true,
            tokenPrice: 1.2,
            tokenSymbol: "$STRAT",
        },
        {
            id: "4",
            author: {
                address: "7LwHPkWzBRJJqQpFEthDNbmhyBAEZSyHWK75fDvAND7M",
                displayName: "DiceAnalyst",
                avatar: "https://i.pravatar.cc/150?img=4",
            },
            content: "After 100 dice rolls, I've compiled this statistical analysis showing optimal betting patterns. Success rate significantly improves when targeting 50-65 range. Full spreadsheet in tokenized content. #DataDriven #Zeebit",
            timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
            likes: 89,
            shares: 41,
            comments: 27,
            media: {
                type: "image" as const,
                url: "/zeebit/dice.png",
            },
            tokenized: true,
            tokenPrice: 1.5,
            tokenSymbol: "$DICE",
        },
        {
            id: "5",
            author: {
                address: "3ZA4Yx7T9KBZd8KvVgfoWQeUqZGZEkFfGZveYVNJgJB9",
                displayName: "RouletteQueen",
                avatar: "https://i.pravatar.cc/150?img=5",
            },
            content: "HUGE WIN on Roulette last night! 😍 Hit three consecutive red/black pairs following my new betting system. Want to learn how? Check out my tokenized guide for the complete strategy breakdown #Roulette #GamblingTips",
            timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
            likes: 112,
            shares: 38,
            comments: 42,
            media: {
                type: "image" as const,
                url: "/zeebit/roulette.png",
            },
            tokenized: true,
            tokenPrice: 2.0,
            tokenSymbol: "$WHEEL",
        },
        {
            id: "6",
            author: {
                address: "9FZ7tBSKGrZ5oNMgN5N5G5m3JfL8CE8GTKQW7q7TuHen",
                displayName: "FlipMaster",
                avatar: "https://i.pravatar.cc/150?img=6",
            },
            content: "Just broke my personal record with 7 consecutive wins on Coin Flip! 💰 My bankroll management system is paying off. Tokenizing my complete guide soon - who wants access? #CoinFlip #Zeebit #GamingTips",
            timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
            likes: 76,
            shares: 19,
            comments: 23,
            media: {
                type: "image" as const,
                url: "/zeebit/coin-flip.png",
            },
            tokenized: false,
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Posts</h2>
            {loadingPosts ? (
                <LoadingCircle />
            ) : (
                <>
                    {posts.map((post: Post) => (
                        <GlassCard
                            variant="default"
                            hover="scale"
                            className={`overflow-hidden`}
                            key={post.stream_id}
                        >
                            <PostContainer post={post} />
                        </GlassCard>
                    ))}
                    {samplePosts.map((post) => (
                        <PostCard key={post.id} {...post} />
                    ))}
                </>
            )}



        </div>
    );
};

export default Posts;