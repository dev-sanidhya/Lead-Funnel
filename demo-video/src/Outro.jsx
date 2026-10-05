import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, INTER, SERIF, E, tw } from './lib.js';
import { S, TOTAL } from './timeline.js';

const Stat = ({ t, at, value, unit, label, count }) => {
  const p = tw(t, at, at + 0.9, 0, 1, E.out);
  const out = tw(t, S.outro + 4.4, S.outro + 5.0, 0, 1, E.inOut);
  const n = count ? Math.round(tw(t, at + 0.1, at + 1.5, 0, value, E.out)) : null;
  return (
    <div style={{ width: 430, textAlign: 'center', opacity: p * (1 - out), transform: `translateY(${(1 - p) * 40 - out * 20}px)`, filter: `blur(${(1 - p) * 8}px)` }}>
      <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 168, letterSpacing: '-0.06em', color: C.ink, lineHeight: 1 }}>
        {count ? n : value}
        {unit && <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 82, color: C.mint, letterSpacing: 0, marginLeft: 8 }}>{unit}</span>}
      </div>
      <div style={{ fontFamily: INTER, fontSize: 27, color: C.mute, marginTop: 14, letterSpacing: '-0.01em' }}>{label}</div>
    </div>
  );
};

export const Outro = ({ t }) => {
  const o = t - S.outro;
  if (o < 0.3) return null;
  const fadeEnd = tw(t, TOTAL - 0.9, TOTAL, 1, 0, E.inOut);
  const lock = tw(o, 5.0, 6.1, 0, 1, E.out);
  const l2 = tw(o, 5.8, 6.8, 0, 1, E.out);
  const l3 = tw(o, 6.6, 7.4, 0, 1, E.out);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: fadeEnd }}>
      {/* stats */}
      <div style={{ position: 'absolute', display: 'flex', gap: 60, top: 330 }}>
        <Stat t={t} at={S.outro + 0.8} value={6} unit="sec" label="average first reply" count />
        <Stat t={t} at={S.outro + 1.3} value="24/7" label="every ad enquiry answered" />
        <Stat t={t} at={S.outro + 1.8} value={0} label="leads left waiting" count />
      </div>
      {/* lockup */}
      {lock > 0 && (
        <div style={{ position: 'absolute', textAlign: 'center', opacity: lock, transform: `translateY(${(1 - lock) * 30}px)`, filter: `blur(${(1 - lock) * 8}px)` }}>
          <div style={{ width: 104, height: 104, margin: '0 auto 34px', borderRadius: 30, background: 'radial-gradient(circle at 30% 25%, #a7f3d0 0%, #34d399 45%, #0f9d77 100%)', display: 'grid', placeItems: 'center', fontFamily: INTER, fontWeight: 800, fontSize: 52, color: '#04231a', letterSpacing: '-0.04em', boxShadow: '0 0 90px rgba(52,211,153,.45)' }}>G</div>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 168, color: C.ink, lineHeight: 1, letterSpacing: '-0.015em' }}>Glad U Came</div>
        </div>
      )}
      <div style={{ position: 'absolute', top: 700, textAlign: 'center', fontFamily: INTER, fontSize: 40, color: C.mute, letterSpacing: '-0.02em', opacity: l2, transform: `translateY(${(1 - l2) * 20}px)` }}>
        Every enquiry answered in seconds. Every lead qualified for you.
      </div>
      <div style={{ position: 'absolute', top: 842, display: 'flex', alignItems: 'center', gap: 16, fontFamily: INTER, fontSize: 20, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.mint, fontWeight: 600, opacity: l3 }}>
        <span style={{ width: 44, height: 1, background: C.mint, opacity: 0.6 }} />Built by Aperture<span style={{ width: 44, height: 1, background: C.mint, opacity: 0.6 }} />
      </div>
    </AbsoluteFill>
  );
};
