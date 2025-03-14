import React from 'react';
import { Shield, Key, Hash } from 'lucide-react';
import { UserProfile } from '@/types/profile';

interface ProfileDetailsProps {
    user: UserProfile;
}

export function ProfileDetails({ user }: ProfileDetailsProps) {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Details</h2>

                <div className="space-y-6">
                    {/* DID */}
                    <div className="flex items-start">
                        <Shield className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">DID</h3>
                            <p className="mt-1 text-sm text-gray-500 break-all">{user.did}</p>
                        </div>
                    </div>

                    {/* Chain & Address */}
                    <div className="flex items-start">
                        <Key className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">Blockchain</h3>
                            <p className="mt-1 text-sm text-gray-500">{user.metadata.chain}</p>
                            <p className="mt-1 text-sm text-gray-500 break-all">{user.metadata.address}</p>
                        </div>
                    </div>

                    {/* Nonces */}
                    <div className="flex items-start">
                        <Hash className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900">Nonces</h3>
                            <div className="mt-1 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Global</p>
                                    <p className="text-sm font-medium text-gray-900">{user.nonces.global}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Solana</p>
                                    <p className="text-sm font-medium text-gray-900">{user.nonces.solana}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}