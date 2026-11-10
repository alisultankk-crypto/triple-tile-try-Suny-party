import React from 'react';

export const CosmicBackground: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black"
    style={{
      background: [
        'radial-gradient(ellipse at 12% 24%, rgba(128, 42, 48, .12), transparent 40%)',
        'radial-gradient(ellipse at 86% 76%, rgba(96, 124, 54, .12), transparent 42%)',
        'radial-gradient(ellipse at 52% 48%, rgba(72, 42, 78, .08), transparent 54%)',
        'linear-gradient(180deg, #030404 0%, #080909 52%, #030404 100%)',
      ].join(', '),
    }}
  >
    <div className="absolute inset-0 opacity-[.08]" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 34px, rgba(142, 119, 96, .18) 35px, transparent 36px 72px)' }} />
  </div>
);
