"use client";

import { Post } from '@/types';
import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";
import ReplyContainer from './ReplyContainer';
import FeedContainer from '@/reusables/posts/Feed-Container';
import Replies from './Replies';
import { TokenizeContent } from '../tokenize-content';
import { Button } from '@/components/ui/button';

const PostContainer = ({ post }: { post: Post }) => {

    const { orbis, user } = useOrbis()
    const [showReplyContainer, setShowReplyContainer] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showTokenizeModal, setShowTokenizeModal] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);

    const handleDisplayReplies = async (id: string) => {

        if (showReplyContainer) {
            setShowReplyContainer(false)
            setSelectedId(null);
        } else {
            setShowReplyContainer(true)
            setSelectedId(id);
            getReplies(id);
        }
    }

    const [replies, setReplies] = useState<Post[] | []>([])
    const [isLoading, setIsLoading] = useState(false);
    const getReplies = async (post_id: string) => {
        try {
            setIsLoading(true);
            const res = await orbis.getPosts({ context: post_id })
            if (res.status == 200) {
                setReplies(res.data)
            }

        } catch (error) {
            console.log("Error in getting replies", error)
        } finally {
            setIsLoading(false);
        }
    }

    const handleTokenizeSuccess = (address: string) => {
        setTokenAddress(address);
        setShowTokenizeModal(false);
    };

    return (
        <>
            <div className="flex flex-col gap-4">
                <FeedContainer post={post} handleDisplayReplies={handleDisplayReplies} />

                {/* Tokenization Button */}
                {(!tokenAddress && post.creator === user.did) && (
                    <div className="flex justify-end">
                        <Button
                            variant="glass"
                            size="sm"
                            onClick={() => setShowTokenizeModal(true)}
                        >
                            Tokenize Content
                        </Button>
                    </div>
                )}

                {/* Show tokenization status if tokenized */}
                {tokenAddress && (
                    <div className="bg-white/5 rounded-md p-3 flex justify-between items-center">
                        <div>
                            <div className="text-sm font-medium text-green-400">Tokenized Content</div>
                            <div className="text-xs text-gray-400">
                                Token Address: {tokenAddress.slice(0, 8)}...{tokenAddress.slice(-6)}
                            </div>
                        </div>
                        <Button
                            variant="glass"
                            size="sm"
                        >
                            Trade
                        </Button>
                    </div>
                )}
            </div>

            {showReplyContainer && <Replies replies={replies} isLoading={isLoading} />}
            {selectedId && <ReplyContainer post={post} getReplies={getReplies} />}

            {/* Tokenization Modal */}
            {showTokenizeModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-md">
                        <TokenizeContent
                            post={post}
                            onSuccess={handleTokenizeSuccess}
                            onClose={() => setShowTokenizeModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    )
};

export default PostContainer;