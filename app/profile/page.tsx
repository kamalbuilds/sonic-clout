"use client";
import { LoadingCircle } from '@/components/LoadingCircle';
import { ProfileDetails } from '@/components/profile/ProfileDetails';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/button';
import { WalletButton } from '@/components/wallet/wallet-connect-button';
import { UserProfile } from '@/types/profile';
// @ts-ignore
import { useOrbis } from '@orbisclub/components';
import React from 'react';

const ProfilePage = () => {

    const { orbis, user, setConnectModalVis } = useOrbis();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="flex justify-center items-center h-64">
                    <div>Please connect your wallet</div>
                    <Button
                        onClick={() => setConnectModalVis(true)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-md hover:from-cyan-500 hover:to-purple-500 transition-all font-mono border border-cyan-400/20 shadow-lg shadow-cyan-500/20"
                    >
                        Connect Wallet
                    </Button>
                </div>

            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ProfileHeader user={user as UserProfile} />
            <ProfileDetails user={user as UserProfile} />
        </div>
    );
};

export default ProfilePage;