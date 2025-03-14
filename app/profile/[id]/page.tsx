"use client";

import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserProfile } from '@/types/profile';
import { useOrbis } from '@orbisclub/components';
import React, { useEffect, useState } from 'react';
import { LoadingCircle } from '@/components/LoadingCircle';

const UserProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const unwrappedParams = React.use(params);
    const decodedId = decodeURIComponent(unwrappedParams.id);

    const { orbis } = useOrbis();

    const [userDetails, setUserDetails] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    const fetchProfile = async (profile_id: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await orbis.getProfile(profile_id);

            if (data) {
                setUserDetails(data.details);
            }

            if (error) {
                console.log("Error from API in getting profile", error);
                setError("Failed to load user profile");
            }
        } catch (err) {
            console.log("Error in getting profile", err);
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        if (decodedId) {
            fetchProfile(decodedId)
        }
    }, [decodedId, orbis]);

    return (
        <div className="min-h-screen bg-gray-50">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <LoadingCircle />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500">
                    <h2 className="text-xl font-bold">Error</h2>
                    <p>{error}</p>
                </div>
            ) : userDetails ? (
                <>
                    <ProfileHeader user={userDetails} />
                    <ProfileDetails user={userDetails} />
                </>
            ) : (
                <div className="text-center p-8">
                    <h2 className="text-xl font-bold">User Not Found</h2>
                    <p>Could not find user with ID: {decodedId}</p>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;