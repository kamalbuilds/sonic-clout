"use client";

import React from 'react';
import { SonicVestingProvider } from '@/context/SonicVestingContext';
import VestingDashboard from '@/components/vesting/VestingDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VestingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sonic Skill Vesting</h1>
        <p className="text-white-400">
          Manage your token vesting schedules that unlock based on social media metrics like followers, views, and engagement.
        </p>
      </div>
      
      <SonicVestingProvider>
        <VestingDashboard />
      </SonicVestingProvider>
      
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About Skill Vesting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Skill Vesting lets you create token vesting schedules where tokens unlock based on 
              reaching specific social media metric thresholds, like follower counts or content views.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm list-decimal pl-4">
              <li>Create a vesting schedule with your chosen token</li>
              <li>Set milestone thresholds based on metrics (e.g., 1K, 5K, 10K followers)</li>
              <li>As you reach milestones, tokens unlock automatically</li>
              <li>Withdraw your unlocked tokens to your wallet</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Powered by Sonic</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              This vesting mechanism runs on Solana for fast, low-cost transactions, using 
              on-chain oracle data to verify your social media metrics and unlock tokens as 
              you hit milestones.
            </p>
            <p className="text-xs mt-4 text-white-300">
              Contract Address: <span className="font-mono">DeBYJGUnhGxwxGUg9UmT4LPyTNKvN2Nf5o2GnCLnRmVC</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 