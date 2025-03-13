import React, { useEffect, useMemo, useState } from 'react';
import { Post } from '@/types';
import PostContainer from './PostContainer';
import { Separator } from '@/components/ui/separator';
import { LoadingCircle } from '@/components/LoadingCircle';

const Replies = ({ replies, isLoading }: { replies: Post[], isLoading: boolean }) => {
    if (isLoading) {
        return (
            <LoadingCircle />
        )
    }

    return (
        <div>
            {replies.map((reply) => (
                <div key={reply.stream_id}>
                    <Separator className="my-4 bg-gray-500" />
                    <div className='pl-8 '>
                        <PostContainer post={reply} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Replies;