import React from 'react';
import { E, tw, kf, useVertical } from './lib.js';
import { S } from './timeline.js';
import { phonePose } from './Story.jsx';
import { Captions } from './Captions.jsx';
import { CrmSceneV } from './CrmSceneV.jsx';
import { CrmStyle, Sidebar, LeadsView, TodayView, CallsView, RulesView, Drawer } from './Crm.jsx';

const BASE = 1.5;

/* ---------------- camera ---------------- */
const FULL = { z: 1.0, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 };
const D = S.drawer;
const R = S.recap;
const camFrames = [
  [S.zoom - 0.3, { z: 0.5, cx: 640, cy: 360, ox: 330, oy: 40, o: 0 }],
  [S.zoom + 1.6, { z: 0.62, cx: 640, cy: 360, ox: 250, oy: 0, o: 1 }, E.out],
  [S.zoom + 3.9, { z: 0.62, cx: 640, cy: 360, ox: 250, oy: 0, o: 1 }],
  [S.board, { ...FULL, z: 1.0 }, E.smooth],
  [D - 0.1, { ...FULL, z: 1.04, cx: 700, cy: 340 }, E.smooth],
  [D + 1.0, { z: 1.1, cx: 960, cy: 300, ox: 0, oy: 0, o: 1 }, E.smooth],
  [D + 13.3, { z: 1.15, cx: 960, cy: 300, ox: 0, oy: 0, o: 1 }, (x) => x],
  [R - 0.2, { ...FULL, z: 1.0 }, E.smooth],
  // recap: a barely-there push per view, so the sidebar and page edges never get cropped
  [R + 0.1, { z: 1.0, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }],
  [R + 3.4, { z: 1.025, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }, (x) => x],
  [R + 3.7, { z: 1.0, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }, E.smooth],
  [R + 6.9, { z: 1.025, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }, (x) => x],
  [R + 7.2, { z: 1.0, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }, E.smooth],
  [R + 10.4, { z: 1.0, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }],
  [R + 13.6, { z: 1.03, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }, (x) => x],
  [S.outro - 0.3, { z: 1.03, cx: 640, cy: 360, ox: 0, oy: 0, o: 1 }],
  [S.outro + 1.1, { z: 0.78, cx: 640, cy: 360, ox: 0, oy: -30, o: 0 }, E.inOut],
];
export const camAt = (t) => {
  const c = kf(t, camFrames);
  if (c.z >= 1) { // never drift past the window edge
    const hx = 640 / c.z, hy = 360 / c.z;
    c.cx = Math.min(Math.max(c.cx, hx), 1280 - hx);
    c.cy = Math.min(Math.max(c.cy, hy), 720 - hy);
  }
  return c;
};
export const toScreen = (cam, nx, ny) => {
  const s = BASE * cam.z;
  return [960 + cam.ox + (nx - cam.cx) * s, 540 + cam.oy + (ny - cam.cy) * s];
};

/* ---------------- cursor ---------------- */
const curFrames = [
  [S.board - 0.2, { x: 1010, y: 640, a: 0 }],
  [S.board + 0.4, { x: 960, y: 590, a: 1 }, E.out],
  [S.board + 3.2, { x: 628, y: 300, a: 1 }, E.smooth],
  [D + 0.8, { x: 628, y: 300, a: 1 }],
  [D + 1.8, { x: 980, y: 420, a: 1 }, E.smooth],
  [D + 12.9, { x: 1000, y: 330, a: 1 }],
  [D + 13.4, { x: 1249, y: 40, a: 1 }, E.smooth],
  [R - 0.2, { x: 112, y: 96, a: 1 }, E.smooth],
  [R + 1.0, { x: 330, y: 400, a: 1 }, E.smooth],
  [R + 3.25, { x: 112, y: 132, a: 1 }, E.smooth],
  [R + 4.6, { x: 640, y: 420, a: 1 }, E.smooth],
  [R + 6.75, { x: 112, y: 168, a: 1 }, E.smooth],
  [R + 8.0, { x: 520, y: 330, a: 1 }, E.smooth],
  [R + 10.25, { x: 112, y: 204, a: 1 }, E.smooth],
  [R + 11.6, { x: 651, y: 224, a: 1 }, E.smooth],
  [R + 13.0, { x: 690, y: 226, a: 0 }, E.smooth],
];
const clicks = [S.board + 3.3, D + 13.4, R - 0.2, R + 3.25, R + 6.75, R + 10.25];

const Cursor = ({ t, scale }) => {
  const p = kf(t, curFrames);
  const k = 1 / scale;
  let press = 0, ring = 0;
  for (const c of clicks) {
    press = Math.max(press, tw(t, c - 0.08, c, 0, 1, E.out) * (1 - tw(t, c + 0.05, c + 0.22, 0, 1, E.out)));
    if (t > c && t < c + 0.7) ring = tw(t, c, c + 0.7, 0, 1, E.out);
  }
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, zIndex: 100, opacity: p.a, pointerEvents: 'none' }}>
      {ring > 0 && <div style={{ position: 'absolute', left: -22 * k, top: -22 * k, width: 44 * k, height: 44 * k, borderRadius: '50%', border: `${2 * k}px solid rgba(15,157,119,${0.8 * (1 - ring)})`, transform: `scale(${0.3 + ring * 1.1})` }} />}
      <svg width={26 * k} height={26 * k} viewBox="0 0 26 26" style={{ transform: `scale(${1 - press * 0.14})`, transformOrigin: '3px 2px', filter: `drop-shadow(0 ${3 * k}px ${5 * k}px rgba(0,0,0,.35))` }}>
        <path d="M4 2.5v19.2l5.2-4.9 3.4 7.6 3.3-1.5-3.4-7.4h7.2z" fill="#0b0d0f" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/* ---------------- the energy orb that carries the lead from the phone to the CRM ---------------- */
const Orb = ({ t }) => {
  const t0 = S.zoom + 2.0;
  const t1 = S.zoom + 3.8;
  if (t < t0 - 0.05 || t > t1 + 1.0) return null;
  const cam = camAt(S.zoom + 3.0);
  const target = toScreen(cam, 626, 292);
  const pos = (tt) => {
    const p = tw(tt, t0, t1, 0, 1, E.inOut);
    const ph = phonePose(tt);
    const sx = ph.x + 30, sy = ph.y - 20;
    return [sx + (target[0] - sx) * p, sy + (target[1] - sy) * p - Math.sin(p * Math.PI) * 190, p];
  };
  const dots = [];
  for (let k = 0; k < 16; k++) {
    const [x, y, p] = pos(t - k * 0.028);
    if (p <= 0 || p >= 1) continue;
    const a = (1 - k / 16);
    dots.push(<div key={k} style={{ position: 'absolute', left: x - 18 * a, top: y - 18 * a, width: 36 * a, height: 36 * a, borderRadius: '50%', background: `radial-gradient(circle, rgba(167,243,208,${0.9 * a}), rgba(52,211,153,${0.35 * a}) 55%, transparent 72%)` }} />);
  }
  const land = tw(t, t1, t1 + 0.9, 0, 1, E.out);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 150, pointerEvents: 'none' }}>
      {dots}
      {land > 0 && land < 1 && <div style={{ position: 'absolute', left: target[0] - 160 * land, top: target[1] - 160 * land, width: 320 * land, height: 320 * land, borderRadius: '50%', border: `3px solid rgba(94,234,212,${0.9 * (1 - land)})`, boxShadow: `0 0 60px rgba(94,234,212,${0.5 * (1 - land)})` }} />}
    </div>
  );
};

/* ---------------- the scene ---------------- */
const CrmSceneH = ({ t }) => {
  if (t < S.zoom - 0.4 || t > S.outro + 1.3) return null;
  const cam = camAt(t);
  const scale = BASE * cam.z;
  // active board lead arrival
  const arrive = tw(t, S.zoom + 3.8, S.zoom + 4.6, 0, 1, E.back);
  const glow = tw(t, S.zoom + 4.2, S.zoom + 4.9, 0, 1, E.out) * (1 - tw(t, D - 0.3, D + 0.4, 0, 1, E.out)) * (0.75 + 0.25 * Math.sin(t * 5));
  // views
  const rv = (a, b) => tw(t, a - 0.001, a + 0.22, 0, 1, (x) => x) * (1 - tw(t, b - 0.22, b, 0, 1, (x) => x));
  const inRecap = t >= R - 0.3;
  const vToday = rv(R - 0.1, R + 3.5);
  const vLeads = inRecap ? rv(R + 3.5, R + 7.0) : 1;
  const vCalls = rv(R + 7.0, R + 10.5);
  const vRules = tw(t, R + 10.5, R + 10.72, 0, 1, (x) => x);
  const lv = t < R - 0.1 ? 1 : vLeads;
  const navView = t < R + 3.5 ? (t < R - 0.1 ? 'leads' : 'today') : t < R + 7.0 ? 'leads' : t < R + 10.5 ? 'calls' : 'settings';
  const drawerP = tw(t, D, D + 0.65, 0, 1, E.out) * (1 - tw(t, D + 13.55, D + 14.0, 0, 1, E.inOut));
  const scroll = kf(t, [
    [D, { s: 0 }], [D + 5.2, { s: 0 }, (x) => x], [D + 6.2, { s: 290 }, E.smooth], [D + 8.6, { s: 290 }],
    [D + 9.5, { s: 560 }, E.smooth], [D + 11.0, { s: 560 }], [D + 12.0, { s: 640 }, E.smooth], [D + 13.4, { s: 1000 }, (x) => x],
  ]).s;
  const slide = t > R + 10.7 ? 3 : 3;
  const rad = tw(cam.z, 0.9, 1.0, 20, 0, (x) => x);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: cam.o }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: 1280, height: 720, transformOrigin: '0 0',
            transform: `translate(${960 + cam.ox}px, ${540 + cam.oy}px) scale(${scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
            borderRadius: rad, boxShadow: '0 60px 160px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.1)', overflow: 'hidden',
          }}
        >
          <div className="crm">
            <CrmStyle />
            <Sidebar view={navView} />
            <main style={{ filter: drawerP > 0.01 ? `blur(${drawerP * 2.5}px)` : undefined }}>
              <div style={{ position: 'absolute', inset: 0, opacity: lv, display: lv > 0.01 ? 'block' : 'none' }}><LeadsView arrive={arrive} glow={glow} /></div>
              {vToday > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vToday, background: '#fff' }}><TodayView /></div>}
              {vCalls > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vCalls, background: '#fff' }}><CallsView hot={tw(t, R + 7.4, R + 8.2) * (1 - tw(t, R + 9.2, R + 10.2))} /></div>}
              {vRules > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vRules, background: '#fff' }}><RulesView slide={slide} /></div>}
            </main>
            {drawerP > 0.002 && (
              <>
                <div className="scrim" style={{ opacity: drawerP }} />
                <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - drawerP) * 660}px)`, zIndex: 31 }}><Drawer scroll={scroll} /></div>
              </>
            )}
            <Cursor t={t} scale={scale} />
          </div>
        </div>
      </div>
      <Orb t={t} />
      <Captions t={t} />
    </>
  );
};

export const CrmScene = ({ t }) => (useVertical() ? <CrmSceneV t={t} /> : <CrmSceneH t={t} />);
