"use client";

import React, { useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useOrbis } from "@orbisclub/components";
import { ORBIS_CONTEXT } from '@/constants';

const CreatePost = () => {

    const { orbis, user } = useOrbis();

    const [postText, setPostText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreatePost = async () => {
        console.log("Post Text >>>>", postText);
        try {
            setIsLoading(true);
            const res = await orbis.createPost({
                context: ORBIS_CONTEXT,
                title: 'Post',
                body: postText,
            })

            console.log("Res >>>", res);
        } catch (error) {
            console.log("Error creating post", error);
        } finally {
            setIsLoading(false)
        }

    }


    return (
        <GlassCard className="p-4">
            <h2 className="text-xl font-bold mb-4">Create Post</h2>
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">?</span>
                </div>
                <div className="flex-1">
                    <Textarea
                        className="w-full bg-transparent border border-white/10 resize-none rounded-md p-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What's happening in the Solana ecosystem?"
                        rows={3}
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                    />
                    <div className="flex justify-between mt-3">
                        <div className="flex gap-2">
                            <Button variant="glass" size="sm" className='cursor-pointer'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Media
                            </Button>
                            <Button variant="glass" size="sm" className='cursor-pointer'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Clip
                            </Button>
                        </div>
                        <Button
                            className='cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            variant="glassColored"
                            onClick={handleCreatePost}
                        >
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CreatePost;