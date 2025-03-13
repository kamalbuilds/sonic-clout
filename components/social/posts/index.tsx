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

const Posts = () => {

    const [isLoading, setIsLoading] = useState(false);
    const { orbis, user } = useOrbis();
    const [posts, setPosts] = useState<Post[] | []>([]);
    const [error, setError] = useState();

    const [selectedPostToReply, setSelectedPostToReply] = useState<Post | null>(null)

    const loadPosts = async () => {
        setIsLoading(true);
        let { data, error } = await orbis.getPosts({ context: ORBIS_CONTEXT });
        console.log("posts available", data);

        if (data) {
            setPosts(data);
        }
        setIsLoading(false);
        setError(error)
    }

    useEffect(() => {
        console.log("user >>>>", user);
        if (user) loadPosts();
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

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Posts</h2>
            {isLoading ? (
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