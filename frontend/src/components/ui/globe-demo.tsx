import React from 'react';
import { Globe } from './globe';

export function GlobeDemo({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 opacity-20">
        <Globe />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 