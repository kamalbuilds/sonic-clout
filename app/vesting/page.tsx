"use client";

import React from 'react';
import { VestingDashboard } from '@/components/vesting/vesting-dashboard';

export default function VestingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Skill Vesting</h1>
        <p className="text-gray-400">
          Manage your vesting schedules tied to your social metrics and content performance.
          Earn tokens as you reach follower and view milestones.
        </p>
      </div>
      
      <VestingDashboard />
      
      <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4">How Skill Vesting Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold">Create a Vesting Schedule</h3>
            </div>
            <p className="text-sm text-gray-400">
              Lock your tokens and set milestones based on followers, views, or engagement.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold">2</div>
              <h3 className="font-semibold">Track Your Progress</h3>
            </div>
            <p className="text-sm text-gray-400">
              As you gain followers and views, check your progress toward each milestone.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">3</div>
              <h3 className="font-semibold">Claim Your Tokens</h3>
            </div>
            <p className="text-sm text-gray-400">
              Once you reach milestones, claim your unlocked tokens to your wallet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 