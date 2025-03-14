import React, { useEffect, useState } from 'react';
import { User, Twitter, Github, Users, Link, UserPlus } from 'lucide-react';
import { UserProfile } from '@/types/profile';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { pinata } from '@/config/pinata';
import { Button } from '@/components/ui/button';
import { useOrbis } from '@orbisclub/components';

interface ProfileHeaderProps {
    user: UserProfile;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { orbis, user: currentUser } = useOrbis();

    const isCurrentUser = currentUser && currentUser.did === user.did;

    const shortAddress = user?.metadata?.address
        ? user.metadata.address.slice(0, 6) + '...' + user.metadata.address.slice(-4)
        : 'Unknown Address';

    useEffect(() => {
        if (user) {
            const pfpString = user.profile?.pfp;
            if (pfpString) {
                (async () => {
                    try {
                        const res = await pinata.gateways.private.get(pfpString);
                        if (res.data) {
                            setProfilePhoto(res.data as string);
                        }
                    } catch (error) {
                        console.log("Error in fetching user profile");
                    }
                })();
            }
        }
    }, [user]);

    // Check if current user is following this profile
    useEffect(() => {
        if (currentUser && user?.did && currentUser.did !== user.did) {
            checkFollowStatus();
        }
    }, [currentUser, user]);

    const checkFollowStatus = async () => {
        try {
            const { data, error } = await orbis.getIsFollowing(currentUser.did, user.did);
            if (data) {
                setIsFollowing(data);
            }
            if (error) {
                console.log("Error checking follow status:", error);
            }
        } catch (error) {
            console.log("Error in checking follow status:", error);
        }
    };

    const handleFollow = async () => {
        if (!currentUser) {
            alert("Please connect your wallet to follow users");
            return;
        }

        setIsLoading(true);
        try {
            if (isFollowing) {
                // Unfollow
                const res = await orbis.setFollow(user.did, false);
                if (res.status === 200) {
                    setIsFollowing(false);
                }
            } else {
                // Follow
                const res = await orbis.setFollow(user.did, true);
                if (res.status === 200) {
                    setIsFollowing(true);
                }
            }
        } catch (error) {
            console.log("Error toggling follow status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            {/* Profile Info */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-24">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex flex-col sm:flex-row items-center">
                            {/* Avatar with Upload Button */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-400" />
                                    )}
                                </div>
                                {isCurrentUser && <ProfilePhotoUpload onPhotoChange={setProfilePhoto} />}
                            </div>

                            {/* User Info */}
                            <div className="mt-6 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                                <div className="flex items-center justify-center sm:justify-start">
                                    <h1 className="text-2xl font-bold text-gray-900">{shortAddress}</h1>

                                    {/* Follow Button - Only show if not current user */}
                                    {!isCurrentUser && currentUser && (
                                        <Button
                                            onClick={handleFollow}
                                            disabled={isLoading}
                                            className={`ml-4 flex items-center ${isFollowing
                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                }`}
                                            size="sm"
                                        >
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </Button>
                                    )}
                                </div>

                                <p className="text-gray-500 mt-1">{user?.metadata?.chain || 'Unknown Chain'}</p>

                                {/* Stats */}
                                <div className="mt-4 flex items-center justify-center sm:justify-start space-x-6">
                                    <div className="flex items-center">
                                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-gray-900 font-medium">{user?.count_followers || 0}</span>
                                        <span className="ml-1 text-gray-500">Followers</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                                        <span className="text-gray-900 font-medium">{user?.count_following || 0}</span>
                                        <span className="ml-1 text-gray-500">Following</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="mt-6 sm:mt-0 flex space-x-4">
                                {user?.twitter_details && (
                                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <Twitter className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                                {user?.github_details && (
                                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                        <Github className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <Link className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}