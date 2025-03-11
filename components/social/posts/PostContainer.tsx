"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { formatAddress } from '@/components/ui/utils';
import { Post, PostReactionType } from '@/types';
import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";
import ReplyContainer from './ReplyContainer';

const PostContainer = ({ post }: { post: Post }) => {

    const { orbis } = useOrbis()
    const [showReplyContainer, setShowReplyContainer] = useState(false);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(post.timestamp);

    const handleReaction = async (post_id: string, type: PostReactionType) => {
        try {
            const res = await orbis.react(post_id, type)
            console.log("REsponse >>>>", res)
        } catch (error) {
            console.log("Error in sending reaction", error);
        }
    }

    return (
        <GlassCard
            variant="default"
            hover="scale"
            className={`overflow-hidden`}
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                    <img src='https://i.pravatar.cc/150?img=1' className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="font-medium">
                            {formatAddress(post.creator_details.metadata.address)}
                        </div>
                        <div className="text-xs text-gray-400">{formattedDate}</div>
                    </div>

                    <div className="mt-2 text-sm">{post.content.body}</div>

                    {/* {media && (
<div className="mt-3 rounded-md overflow-hidden">
{media.type === 'image' && (
<img src={media.url} alt="Post media" className="w-full h-auto max-h-80 object-cover" />
)}
{media.type === 'video' && (
<video src={media.url} controls className="w-full h-auto max-h-80" />
)}
{media.type === 'clip' && (
<div className="relative pt-[56.25%] bg-black">
<iframe 
src={media.url} 
className="absolute top-0 left-0 w-full h-full" 
allowFullScreen
/>
</div>
)}
</div>
)} */}

                    {/* {tokenized && (
<div className="mt-3 p-2 rounded-md bg-white/5 border border-white/10 flex items-center justify-between">
<div className="text-xs">
<span className="text-green-400">Tokenized</span>
{tokenPrice && tokenSymbol && (
<span className="ml-2">{tokenPrice} {tokenSymbol}</span>
)}
</div>
<Button variant="glass" size="sm">Trade</Button>
</div>
)} */}

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleReaction(post.stream_id, 'like')}
                                className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{post.count_likes}</span>
                            </button>

                            <button
                                onClick={() => setShowReplyContainer(true)}
                                className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{post.count_replies}</span>
                            </button>

                            <button
                                onClick={() => handleReaction(post.stream_id, 'downvote')}
                                className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>{post.count_downvotes}</span>
                            </button>
                        </div>

                        {/* {!tokenized && (
<Button variant="glass" size="sm">Tokenize</Button>
)} */}
                    </div>
                </div>
            </div>
            {showReplyContainer && <ReplyContainer post={post} />}
        </GlassCard>
    )
};

export default PostContainer;