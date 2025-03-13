"use client";

import { formatAddress } from '@/components/ui/utils';
import { Post, PostReactionType } from '@/types';
import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";
import { FaRegThumbsDown } from "react-icons/fa6";


const FeedContainer = ({ post, handleDisplayReplies }: { post: Post, handleDisplayReplies: (id: string) => void }) => {
    const { orbis } = useOrbis()

    const [updatedPost, setUpdatedPost] = useState<Post>(post);
    const [reacting, setReacting] = useState(false);

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(post.timestamp);

    const getUpdatedPost = async () => {
        try {

            const res = await orbis.getPost(post.stream_id);

            if (res.status == 200) {
                setUpdatedPost(res.data)
            }

        } catch (error) {
            console.log("Error in getting post details", error);
        }
    }

    const handleReaction = async (post_id: string, type: PostReactionType) => {
        try {
            setReacting(true);
            const res = await orbis.react(post_id, type)

            if (res.status == 200) {
                setTimeout(async () => {
                    setReacting(false);
                    await getUpdatedPost();
                }, 3000);
            }
        } catch (error) {
            setReacting(false);
            console.log("Error in sending reaction", error);
        }
    }

    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                <img src='https://i.pravatar.cc/150?img=1' className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div className="font-medium">
                        {formatAddress(updatedPost.creator_details.metadata.address)}
                    </div>
                    <div className="text-xs text-gray-400">{formattedDate}</div>
                </div>

                <div className="mt-2 text-sm">{updatedPost.content.body}</div>

                <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleDisplayReplies(updatedPost.stream_id)}
                            className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{updatedPost.count_replies}</span>
                        </button>

                        <button
                            disabled={reacting}
                            onClick={() => handleReaction(updatedPost.stream_id, 'like')}
                            className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{updatedPost.count_likes}</span>
                        </button>

                        <button
                            disabled={reacting}
                            onClick={() => handleReaction(updatedPost.stream_id, 'downvote')}
                            className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                            <FaRegThumbsDown />
                            <span>{updatedPost.count_downvotes}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedContainer;