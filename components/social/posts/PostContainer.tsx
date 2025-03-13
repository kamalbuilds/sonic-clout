"use client";

import { GlassCard } from '@/components/ui/glass-card';
import { formatAddress } from '@/components/ui/utils';
import { Post, PostReactionType } from '@/types';
import React, { useState } from 'react';
import { useOrbis } from "@orbisclub/components";
import ReplyContainer from './ReplyContainer';
import FeedContainer from '@/reusables/posts/Feed-Container';
import Replies from './Replies';

const PostContainer = ({ post }: { post: Post }) => {

    const { orbis } = useOrbis()
    const [showReplyContainer, setShowReplyContainer] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    return (
        <>
            <FeedContainer post={post} handleDisplayReplies={handleDisplayReplies} />
            {showReplyContainer && <Replies replies={replies} isLoading={isLoading} />}
            {selectedId && <ReplyContainer post={post} getReplies={getReplies} />}
        </>
    )
};

export default PostContainer;