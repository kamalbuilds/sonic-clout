"use client";

import React from 'react';
import { SonicBonds } from '@/components/bonds/sonic-bonds';

export default function BondsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sonic Bonds Marketplace</h1>
        <p className="text-white-400">
          Trade bonds pegged to in-game metrics, social trends, and content performance.
        </p>
      </div>
      
      <SonicBonds />
    </div>
  );
} 