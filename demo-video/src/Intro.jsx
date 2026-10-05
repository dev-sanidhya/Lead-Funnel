import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, INTER, SERIF, E, tw, useVertical } from './lib.js';

// A word that rises out of a mask, staggered by index.
const Word = ({ t, at, i = 0, children, serif, color, size }) => {
  const p = tw(t, at + i * 0.07, at + i * 0.07 + 0.9, 0, 1, E.out);
  return (
    <span style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.12em', marginRight: '0.27em', fontSize: size }}>
      <span
        style={{
          display: 'inline-block',
          transform: `translateY(${(1 - p) * 112}%) rotate(${(1 - p) * 3}deg)`,
          opacity: Math.min(1, p * 2.2),
          fontFamily: serif ? SERIF : INTER,
          fontStyle: serif ? 'italic' : 'normal',
          fontWeight: serif ? 400 : 600,
          letterSpacing: serif ? '-0.01em' : '-0.045em',
          color: color || C.ink,
          fontSize: serif ? size * 1.07 : size,
          filter: `blur(${(1 - p) * 8}px)`,
        }}
      >
        {children}
      </span>
    </span>
  );
};

const Line = ({ words, t, at, size = 118, out }) => {
  const o = out ? tw(t, out, out + 0.55, 1, 0, E.inOut) : 1;
  const y = out ? tw(t, out, out + 0.55, 0, -40, E.inOut) : 0;
  return (
    <div style={{ opacity: o, transform: `translateY(${y}px)`, lineHeight: 1.04, textAlign: 'center' }}>
      {words.map((w, i) => (
        <Word key={i} t={t} at={at} i={i} serif={w.s} color={w.c} size={size}>
          {w.w}
        </Word>
      ))}
    </div>
  );
};

export const Intro = ({ t }) => {
  const V = useVertical();
  // t: seconds since the start of the film. Visible 0 .. ~6.2
  const fadeOut = tw(t, 5.5, 6.2, 1, 0, E.inOut);
  const tag = tw(t, 0.2, 1.0, 0, 1, E.out);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: fadeOut }}>
      {/* eyebrow */}
      <div
        style={{
          position: 'absolute', top: V ? 300 : 150, opacity: tag, transform: `translateY(${(1 - tag) * 14}px)`,
          display: 'flex', alignItems: 'center', gap: 14, fontFamily: INTER, fontSize: V ? 25 : 21, letterSpacing: V ? '0.22em' : '0.28em', textTransform: 'uppercase', color: C.mint, fontWeight: 600,
        }}
      >
        <span style={{ width: 44, height: 1, background: C.mint, opacity: 0.7 }} />
        Glad U Came  ×  Aperture
        <span style={{ width: 44, height: 1, background: C.mint, opacity: 0.7 }} />
      </div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: V ? 960 : 1500 }}>
          {V ? (
            <>
              <Line t={t} at={0.45} out={2.95} size={124} words={[{ w: 'Every' }, { w: 'ad' }]} />
              <Line t={t} at={0.65} out={2.95} size={124} words={[{ w: 'enquiry' }, { w: 'deserves' }]} />
              <Line t={t} at={0.85} out={2.95} size={124} words={[{ w: 'an', s: 1, c: C.mint }, { w: 'instant', s: 1, c: C.mint }, { w: 'reply.' }]} />
            </>
          ) : (
            <>
              <Line t={t} at={0.45} out={2.95} words={[{ w: 'Every' }, { w: 'ad' }, { w: 'enquiry' }]} />
              <Line t={t} at={0.75} out={2.95} words={[{ w: 'deserves' }, { w: 'an', s: 1, c: C.mint }, { w: 'instant', s: 1, c: C.mint }, { w: 'reply.' }]} />
            </>
          )}
        </div>
        <div style={{ position: 'absolute', width: V ? 960 : 1500 }}>
          {V ? (
            <>
              <Line t={t} at={3.2} size={124} words={[{ w: 'Here' }, { w: 'is' }, { w: 'how' }]} />
              <Line t={t} at={3.4} size={124} words={[{ w: 'it' }, { w: 'works' }, { w: 'for' }]} />
              <Line t={t} at={3.6} size={124} words={[{ w: 'Glad', s: 1, c: C.mint }, { w: 'U', s: 1, c: C.mint }, { w: 'Came.', s: 1, c: C.mint }]} />
            </>
          ) : (
            <>
              <Line t={t} at={3.2} size={104} words={[{ w: 'Here' }, { w: 'is' }, { w: 'how' }, { w: 'it' }, { w: 'works' }]} />
              <Line t={t} at={3.5} size={104} words={[{ w: 'for' }, { w: 'Glad', s: 1, c: C.mint }, { w: 'U', s: 1, c: C.mint }, { w: 'Came.', s: 1, c: C.mint }]} />
            </>
          )}
        </div>
      </div>

      {/* progress hairline */}
      <div style={{ position: 'absolute', bottom: V ? 300 : 96, width: 360, height: 2, background: 'rgba(255,255,255,.1)', borderRadius: 2, overflow: 'hidden', opacity: tag }}>
        <div style={{ width: `${tw(t, 0.3, 5.8, 0, 100, (x) => x)}%`, height: '100%', background: `linear-gradient(90deg, transparent, ${C.mint})` }} />
      </div>
    </AbsoluteFill>
  );
};
