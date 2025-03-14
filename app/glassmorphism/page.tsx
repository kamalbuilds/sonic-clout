"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';

export default function GlassmorphismShowcase() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Glassmorphism Showcase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Default Glass Card */}
        <GlassCard className="p-6 h-[280px] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3">Default Glass Card</h2>
            <p className="text-sm text-white/70">
              This is the default glassmorphism effect with subtle transparency and blur.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glass" size="sm">Submit</Button>
          </div>
        </GlassCard>
        
        {/* Dark Glass Card */}
        <GlassCard variant="dark" className="p-6 h-[280px] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3">Dark Glass Card</h2>
            <p className="text-sm text-white/70">
              A darker glassmorphism effect, ideal for sections that need more contrast.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glass" size="sm">Submit</Button>
          </div>
        </GlassCard>
        
        {/* Light Glass Card */}
        <GlassCard variant="light" className="p-6 h-[280px] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-3">Light Glass Card</h2>
            <p className="text-sm text-white/70">
              A lighter glassmorphism effect that works well on darker backgrounds.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glass" size="sm">Submit</Button>
          </div>
        </GlassCard>
        
        {/* Colored Glass Card */}
        <GlassCard 
          variant="colored" 
          gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
          className="p-6 h-[280px] flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold mb-3">Colored Glass Card</h2>
            <p className="text-sm text-white/70">
              Glassmorphism with gradient background colors that maintains the glass effect.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glassColored" gradient="rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8)" size="sm">Submit</Button>
          </div>
        </GlassCard>
        
        {/* Hover Scale Effect */}
        <GlassCard 
          hover="scale" 
          glassBefore={true}
          className="p-6 h-[280px] flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold mb-3">Scale on Hover</h2>
            <p className="text-sm text-white/70">
              This card scales up slightly on hover for an interactive feel. Also has the glassBefore effect.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glass" size="sm">Submit</Button>
          </div>
        </GlassCard>
        
        {/* Glow Effect */}
        <GlassCard 
          hover="glow" 
          className="p-6 h-[280px] flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold mb-3">Glow on Hover</h2>
            <p className="text-sm text-white/70">
              This card glows on hover with a subtle white shadow for an ethereal effect.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="glass" size="sm">Cancel</Button>
            <Button variant="glassColored" gradient="rgba(236, 72, 153, 0.7), rgba(59, 130, 246, 0.7)" size="sm">Submit</Button>
          </div>
        </GlassCard>
      </div>
      
      {/* Button Showcase */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Glassmorphism Buttons</h2>
        
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium mb-2">Glass Button</h3>
              <Button variant="glass" size="default">Default Size</Button>
              <Button variant="glass" size="sm">Small Size</Button>
              <Button variant="glass" size="lg">Large Size</Button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium mb-2">Colored Glass</h3>
              <Button 
                variant="glassColored" 
                gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
              >
                Blue-Purple
              </Button>
              <Button 
                variant="glassColored" 
                gradient="rgba(236, 72, 153, 0.5), rgba(59, 130, 246, 0.5)"
              >
                Pink-Blue
              </Button>
              <Button 
                variant="glassColored" 
                gradient="rgba(16, 185, 129, 0.5), rgba(59, 130, 246, 0.5)"
              >
                Green-Blue
              </Button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium mb-2">With Icon</h3>
              <Button variant="glass">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add New
              </Button>
              <Button 
                variant="glassColored" 
                gradient="rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                Connect
              </Button>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium mb-2">States</h3>
              <Button variant="glass" disabled>Disabled</Button>
              <Button 
                variant="glassColored" 
                gradient="rgba(239, 68, 68, 0.5), rgba(236, 72, 153, 0.5)"
              >
                Danger
              </Button>
              <Button 
                variant="glassColored" 
                gradient="rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.5)"
              >
                Success
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 