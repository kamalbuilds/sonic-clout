"use client";

import React, { useRef, useState } from 'react';
import { GlassCard } from '../ui/glass-card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useOrbis } from "@orbisclub/components";
import { ORBIS_CONTEXT } from '@/constants';
import { LoadingCircle } from '../LoadingCircle';
import { X } from 'lucide-react';
import { useGlobalContext } from '@/context/GlobalContext';
import { pinata } from '@/config/pinata';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || '08cfe93a827cb51ceb2e';
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '82243dadbca59772dab1119066db44cc9d9acf03065d2821cfd06c0bd3e9853f';

const CreatePost = () => {

    const { orbis, user } = useOrbis();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [postText, setPostText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const { fetchPosts } = useGlobalContext();

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImageToIPFS = async (imagePreview: string): Promise<string | null> => {
        try {

            const fileToUpload = new File([imagePreview], `${imageFile?.name}.txt`, { type: "text/plain" });

            const upload = await pinata.upload.private.file(fileToUpload);

            return `ipfs://${upload.cid}`

        } catch (error) {
            console.error('Error uploading image to IPFS:', error);
            return null;
        }
    };

    const handleCreatePost = async () => {
        if (!postText.trim() && !imageFile) {
            alert('Please enter some text or upload an image');
            return;
        }

        try {
            setIsLoading(true);

            let media = null;

            // Upload image if present
            if (imageFile && imagePreview) {
                setUploadProgress(0);
                const ipfsUrl = await uploadImageToIPFS(imagePreview);

                if (ipfsUrl) {
                    media = [{
                        url: ipfsUrl,
                        type: imageFile.type
                    }];
                } else {
                    alert('Failed to upload image. Post will be created without the image.');
                }
            }

            // Create post with Orbis
            const res = await orbis.createPost({
                context: ORBIS_CONTEXT,
                title: 'Post',
                body: postText,
                media: media
            });

            if (res.status === 200) {
                // Clear form after successful post
                setPostText('');
                removeImage();
                fetchPosts(ORBIS_CONTEXT);
                // You might want to trigger a refresh of the posts feed here
            } else {
                alert('Failed to create post');
            }
        } catch (error) {
            console.log("Error creating post", error);
            alert('An error occurred while creating your post');
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
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
                        placeholder="What's happening in the Sonic ecosystem?"
                        rows={3}
                        value={postText}
                        onChange={(e) => setPostText(e.target.value)}
                        disabled={isLoading}
                    />

                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative mt-3 rounded-lg overflow-hidden">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-h-64 w-auto rounded-lg"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
                                disabled={isLoading}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                        </div>
                    )}


                    <div className="flex justify-between mt-3">
                        <div className="flex gap-2">
                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                                disabled={isLoading}
                            />

                            <Button
                                variant="glass"
                                size="sm"
                                className='cursor-pointer'
                                onClick={handleImageClick}
                                disabled={isLoading || !!imageFile}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Media
                            </Button>
                        </div>
                        <Button
                            className='cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            variant="glassColored"
                            onClick={handleCreatePost}
                            disabled={isLoading || (!postText.trim() && !imageFile)}
                        >
                            {isLoading ? <LoadingCircle /> : 'Post'}
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

export default CreatePost;