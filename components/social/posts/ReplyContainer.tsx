"use client";

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Post } from '@/types';
import React, { useState } from 'react';
import { CgProfile } from "react-icons/cg";
import { useOrbis } from "@orbisclub/components";

const ReplyContainer = ({ post, getReplies }: { post: Post, getReplies: (id: string) => Promise<void> }) => {
    const { orbis } = useOrbis()

    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const handleReply = async () => {
        try {
            setSendingReply(true);

            const res = await orbis.createPost({
                body: replyMessage,
                context: post.stream_id,
                reply_to: post.stream_id
            })

            if (res.status == 200) {
                setTimeout(() => {
                    setSendingReply(false);
                    getReplies(post.stream_id)
                }, 3000);
            }

        } catch (error) {
            setSendingReply(false);
            console.log("Error in sending reply", error);

        }


    }
    return (
        <div className='flex flex-row gap-4 mt-12'>
            <div>
                <CgProfile size={38} />
            </div>
            <div className='flex flex-col flex-1 gap-2'>
                <Textarea
                    className="w-full bg-transparent border border-white/10 resize-none rounded-md p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add your comment..."
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                />
                <div className='flex justify-end'>
                    <Button disabled={sendingReply} onClick={handleReply}>
                        {sendingReply ? 'Replying' : 'Comment'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default ReplyContainer;