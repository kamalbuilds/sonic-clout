import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useOrbis } from '@orbisclub/components';
import { pinata } from '@/config/pinata';
import { Button } from '../ui/button';

interface ProfilePhotoUploadProps {
    onPhotoChange: (photo: string) => void;
}

export function ProfilePhotoUpload({ onPhotoChange }: ProfilePhotoUploadProps) {

    const { orbis, user, setConnectModalVis } = useOrbis();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadToPinata = async (previewURL: string) => {
        try {
            const file = new File([previewURL], `${user.did}.txt`, { type: "text/plain" });
            const upload = await pinata.upload.public.file(file);

            if (upload) {
                return upload.cid
            }

        } catch (error) {
            console.log("Eror in uploading to Pinata");
            throw new Error('Error uploading to pinata');

        }
    }

    const handleUpload = async () => {
        if (previewUrl) {
            setIsUploading(true);
            onPhotoChange(previewUrl);

            try {
                const cid = await uploadToPinata(previewUrl);

                const res = await orbis.updateProfile({
                    pfp: cid,
                })
            } catch (error) {
                console.log("Error in uploading", error);
            } finally {
                setIsUploading(false);
            }

        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update profile photo</DialogTitle>
                    <DialogDescription>
                        Choose a new photo to update your profile
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center justify-center">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-32 h-32 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                                <Camera className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {selectedFile && (
                            <Button
                                disabled={isUploading}
                                onClick={handleUpload}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Photo'}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}