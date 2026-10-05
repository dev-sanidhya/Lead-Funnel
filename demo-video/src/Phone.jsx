import React from 'react';
import { INTER } from './lib.js';

// iPhone-style device. Screen content is laid out on a 388 x 852 canvas.
export const SCREEN_W = 388;
export const SCREEN_H = 852;

export const Phone = ({ x, y, scale = 1, rotY = 0, rotX = 0, opacity = 1, blur = 0, children }) => (
  <div
    style={{
      position: 'absolute', left: x - 201, top: y - 433, width: 402, height: 866, opacity,
      transform: `perspective(2600px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${scale})`,
      filter: blur ? `blur(${blur}px)` : undefined,
    }}
  >
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: 66, padding: 7,
        background: 'linear-gradient(145deg, #3a3f3e 0%, #121414 38%, #1d2120 70%, #0b0c0c 100%)',
        boxShadow: '0 70px 140px rgba(0,0,0,.65), 0 0 0 1.5px rgba(255,255,255,.16) inset, 0 0 120px rgba(94,234,212,.10)',
      }}
    >
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 58, overflow: 'hidden', clipPath: 'inset(0 round 58px)', isolation: 'isolate', transform: 'translateZ(0)', background: '#000', fontFamily: INTER }}>
        {children}
        {/* dynamic island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 118, height: 33, borderRadius: 20, background: '#000', zIndex: 50 }} />
        {/* glass reflection */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 28%)', pointerEvents: 'none', zIndex: 60 }} />
      </div>
    </div>
    {/* side buttons */}
    <div style={{ position: 'absolute', right: -3, top: 210, width: 4, height: 92, borderRadius: 2, background: '#2a2e2d' }} />
    <div style={{ position: 'absolute', left: -3, top: 170, width: 4, height: 56, borderRadius: 2, background: '#2a2e2d' }} />
    <div style={{ position: 'absolute', left: -3, top: 250, width: 4, height: 80, borderRadius: 2, background: '#2a2e2d' }} />
  </div>
);

export const StatusBar = ({ light = true }) => {
  const col = light ? '#fff' : '#000';
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 34px 0 38px', color: col, fontSize: 16, fontWeight: 600 }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={col}><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 4.2a9.5 9.5 0 0 1 13 0" /><path d="M4 7a6 6 0 0 1 8 0" /><circle cx="8" cy="10" r="1" fill={col} stroke="none" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke={col} opacity=".45" /><rect x="2" y="2" width="19" height="9" rx="2.2" fill={col} /><rect x="24" y="4.2" width="2" height="4.6" rx="1" fill={col} opacity=".5" /></svg>
      </span>
    </div>
  );
};

export const Ico = ({ d, size = 24, stroke = '#fff', fill = 'none', sw = 1.8, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);

export const I = {
  back: <path d="M15 5l-7 7 7 7" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  video: (<><rect x="3" y="6" width="13" height="12" rx="3" /><path d="M16 10l5-3v10l-5-3" /></>),
  camera: (<><path d="M4 8h3l1.5-2h7L17 8h3v11H4z" /><circle cx="12" cy="13" r="3.4" /></>),
  mic: (<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>),
  image: (<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="M4 18l5-5 4 4 3-3 4 4" /></>),
  sticker: (<><path d="M20 12a8 8 0 1 1-8-8c0 4 4 8 8 8z" /><path d="M9 13c.8 1.2 2 1.8 3.2 1.8" /></>),
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  comment: <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.2A8 8 0 1 1 21 12z" />,
  send: (<><path d="M22 3L10.5 13.5" /><path d="M22 3l-7 18-4.5-7.5L3 9z" /></>),
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  plus: (<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M12 8v8M8 12h8" /></>),
  reels: (<><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M3.5 9h17M9 3.5L11.5 9M14.5 3.5L17 9" /><path d="M10 12.5l4 2.5-4 2.5z" fill="#fff" /></>),
  dots: (<><circle cx="5" cy="12" r="1.3" fill="#fff" /><circle cx="12" cy="12" r="1.3" fill="#fff" /><circle cx="19" cy="12" r="1.3" fill="#fff" /></>),
  chevron: <path d="M9 5l7 7-7 7" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

// The brand avatar used for the agency account
export const GucAvatar = ({ size = 40 }) => (
  <div
    style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'radial-gradient(circle at 30% 25%, #a7f3d0 0%, #34d399 45%, #0f9d77 100%)',
      display: 'grid', placeItems: 'center', color: '#04231a', fontWeight: 800, fontSize: size * 0.4, letterSpacing: '-0.04em',
      boxShadow: '0 0 0 2px #000, 0 0 0 3.5px rgba(94,234,212,.55)',
    }}
  >
    G
  </div>
);
