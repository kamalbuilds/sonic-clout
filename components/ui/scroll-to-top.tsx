"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { cn } from './utils';

export const ScrollToTop: React.FC<{ className?: string }> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 transition-all duration-300 transform',
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
      className
    )}>
      <Button 
        onClick={scrollToTop}
        className="rounded-full w-12 h-12 flex items-center justify-center shadow-xl"
        variant="glassColored"
        gradient="rgba(138, 43, 226, 0.5), rgba(56, 189, 248, 0.5)"
        aria-label="Scroll to top"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 15l7-7 7 7" 
          />
        </svg>
      </Button>
    </div>
  );
}; 