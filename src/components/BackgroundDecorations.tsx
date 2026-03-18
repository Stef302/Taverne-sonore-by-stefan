import React from 'react';
import { Music, Music2, Music3, Music4 } from 'lucide-react';

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-10">
      {/* Top Left */}
      <div className="absolute top-10 left-10 text-green-400 transform -rotate-12">
        <Music size={64} />
      </div>
      <div className="absolute top-32 left-24 text-green-400 transform rotate-45 opacity-50">
        <Music2 size={48} />
      </div>
      
      {/* Top Right */}
      <div className="absolute top-20 right-16 text-green-400 transform rotate-12">
        <Music3 size={80} />
      </div>
      <div className="absolute top-48 right-8 text-red-400 transform -rotate-45 opacity-50">
        <Music4 size={56} />
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-32 left-12 text-green-400 transform rotate-45">
        <Music4 size={72} />
      </div>
      <div className="absolute bottom-64 left-8 text-green-400 transform -rotate-12 opacity-50">
        <Music size={40} />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-40 right-20 text-green-400 transform -rotate-45">
        <Music2 size={64} />
      </div>
      <div className="absolute bottom-24 right-10 text-red-400 transform rotate-12 opacity-50">
        <Music3 size={48} />
      </div>

      {/* Center-ish */}
      <div className="absolute top-1/3 left-1/4 text-green-400 transform rotate-12 opacity-30">
        <Music size={96} />
      </div>
      <div className="absolute top-2/3 right-1/4 text-green-400 transform -rotate-12 opacity-30">
        <Music4 size={80} />
      </div>
    </div>
  );
}
