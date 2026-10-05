import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from './lib.js';

const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>"
)}")`;

// Slow-drifting mint aurora, a faint grid and film grain. `glow` lifts the aurora, `dim` pushes it back behind UI.
export const Background = ({ t, glow = 1, dim = 0 }) => {
  const b = (x, y, r, col, a) => `radial-gradient(circle at ${x}% ${y}%, ${col.replace('A', a * glow)} 0%, transparent ${r}%)`;
  const drift = (s, p) => Math.sin(t * s + p);
  const layers = [
    b(22 + 8 * drift(0.21, 0), 28 + 7 * drift(0.17, 1), 46, 'rgba(45,212,170,A)', 0.34),
    b(78 + 7 * drift(0.19, 2), 70 + 8 * drift(0.23, 3), 50, 'rgba(16,185,129,A)', 0.26),
    b(60 + 10 * drift(0.14, 4), 14 + 6 * drift(0.2, 5), 36, 'rgba(94,234,212,A)', 0.14),
    b(10 + 6 * drift(0.16, 6), 88 + 5 * drift(0.18, 7), 40, 'rgba(99,102,241,A)', 0.12),
  ];
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: layers.join(','), opacity: 1 - dim * 0.55 }} />
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, #000 0%, transparent 72%)',
          maskImage: 'radial-gradient(ellipse at 50% 50%, #000 0%, transparent 72%)',
          opacity: 0.9,
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: GRAIN, opacity: 0.07, mixBlendMode: 'overlay' }} />
    </AbsoluteFill>
  );
};
