import React from 'react';
import { E, tw, kf } from './lib.js';
import { S } from './timeline.js';
import { phonePose } from './Story.jsx';
import { Captions } from './Captions.jsx';
import { CrmStyle, TabBar, LeadsListM, TodayView, CallsView, RulesView, DrawerHead, DrawerBody, Ic } from './Crm.jsx';

/* Vertical (9:16) film: the product's responsive phone layout, native 480 x 853, shown at 2.25x. */
const BASE = 2.25;
const D = S.drawer;
const R = S.recap;

const camFrames = [
  [S.zoom - 0.3, { z: 0.5, cx: 240, cy: 426, ox: 0, oy: 420, o: 0 }],
  [S.zoom + 1.6, { z: 0.6, cx: 240, cy: 426, ox: 0, oy: 206, o: 1 }, E.out],
  [S.zoom + 3.9, { z: 0.6, cx: 240, cy: 426, ox: 0, oy: 206, o: 1 }],
  [S.board, { z: 1.0, cx: 240, cy: 426.5, ox: 0, oy: 0, o: 1 }, E.smooth],
  [R - 0.2, { z: 1.0, cx: 240, cy: 426.5, ox: 0, oy: 0, o: 1 }],
  [R + 13.6, { z: 1.0, cx: 240, cy: 426.5, ox: 0, oy: 0, o: 1 }],
  [S.outro - 0.3, { z: 1.0, cx: 240, cy: 426.5, ox: 0, oy: 0, o: 1 }],
  [S.outro + 1.1, { z: 0.8, cx: 240, cy: 426.5, ox: 0, oy: -40, o: 0 }, E.inOut],
];
export const camAtV = (t) => kf(t, camFrames);
const toScreenV = (cam, nx, ny) => {
  const s = BASE * cam.z;
  return [540 + cam.ox + (nx - cam.cx) * s, 960 + cam.oy + (ny - cam.cy) * s];
};

/* finger taps */
const TAPS = [
  [S.board + 3.3, 240, 262],
  [D + 13.4, 453, 240],
  [R - 0.2, 60, 826],
  [R + 3.25, 180, 826],
  [R + 6.75, 300, 826],
  [R + 10.25, 420, 826],
];
const Touch = ({ t }) => {
  const out = [];
  TAPS.forEach(([c, x, y], i) => {
    if (t < c - 0.35 || t > c + 0.8) return;
    const down = tw(t, c - 0.3, c - 0.02, 0, 1, E.out);
    const up = tw(t, c + 0.04, c + 0.28, 0, 1, E.out);
    const ring = tw(t, c, c + 0.7, 0, 1, E.out);
    const a = down * (1 - up);
    out.push(
      <div key={i} style={{ position: 'absolute', left: x, top: y, zIndex: 100, pointerEvents: 'none' }}>
        {ring > 0 && ring < 1 && <div style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: '50%', border: `2px solid rgba(15,157,119,${0.8 * (1 - ring)})`, transform: `scale(${0.4 + ring})` }} />}
        <div style={{ position: 'absolute', left: -20, top: -20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(20,24,26,.38)', border: '2px solid rgba(255,255,255,.9)', boxShadow: '0 4px 14px rgba(0,0,0,.3)', opacity: a, transform: `scale(${1.25 - 0.3 * a})` }} />
      </div>
    );
  });
  return <>{out}</>;
};

const OrbV = ({ t }) => {
  const t0 = S.zoom + 2.0;
  const t1 = S.zoom + 3.8;
  if (t < t0 - 0.05 || t > t1 + 1.0) return null;
  const cam = camAtV(S.zoom + 3.0);
  const target = toScreenV(cam, 240, 252);
  const pos = (tt) => {
    const p = tw(tt, t0, t1, 0, 1, E.inOut);
    const ph = phonePose(tt, true);
    const sx = ph.x, sy = ph.y + 40;
    return [sx + (target[0] - sx) * p + Math.sin(p * Math.PI) * 150, sy + (target[1] - sy) * p, p];
  };
  const dots = [];
  for (let k = 0; k < 16; k++) {
    const [x, y, p] = pos(t - k * 0.028);
    if (p <= 0 || p >= 1) continue;
    const a = 1 - k / 16;
    dots.push(<div key={k} style={{ position: 'absolute', left: x - 22 * a, top: y - 22 * a, width: 44 * a, height: 44 * a, borderRadius: '50%', background: `radial-gradient(circle, rgba(167,243,208,${0.9 * a}), rgba(52,211,153,${0.35 * a}) 55%, transparent 72%)` }} />);
  }
  const land = tw(t, t1, t1 + 0.9, 0, 1, E.out);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 150, pointerEvents: 'none' }}>
      {dots}
      {land > 0 && land < 1 && <div style={{ position: 'absolute', left: target[0] - 190 * land, top: target[1] - 190 * land, width: 380 * land, height: 380 * land, borderRadius: '50%', border: `3px solid rgba(94,234,212,${0.9 * (1 - land)})`, boxShadow: `0 0 60px rgba(94,234,212,${0.5 * (1 - land)})` }} />}
    </div>
  );
};

export const CrmSceneV = ({ t }) => {
  if (t < S.zoom - 0.4 || t > S.outro + 1.3) return null;
  const cam = camAtV(t);
  const scale = BASE * cam.z;
  const arrive = tw(t, S.zoom + 3.8, S.zoom + 4.6, 0, 1, E.back);
  const glow = tw(t, S.zoom + 4.2, S.zoom + 4.9, 0, 1, E.out) * (1 - tw(t, D - 0.3, D + 0.4, 0, 1, E.out)) * (0.75 + 0.25 * Math.sin(t * 5));
  const rv = (a, b) => tw(t, a - 0.001, a + 0.22, 0, 1, (x) => x) * (1 - tw(t, b - 0.22, b, 0, 1, (x) => x));
  const inRecap = t >= R - 0.3;
  const vToday = rv(R - 0.1, R + 3.5);
  const vLeads = inRecap ? rv(R + 3.5, R + 7.0) : 1;
  const vCalls = rv(R + 7.0, R + 10.5);
  const vRules = tw(t, R + 10.5, R + 10.72, 0, 1, (x) => x);
  const lv = t < R - 0.1 ? 1 : vLeads;
  const navView = t < R + 3.5 ? (t < R - 0.1 ? 'leads' : 'today') : t < R + 7.0 ? 'leads' : t < R + 10.5 ? 'calls' : 'settings';
  const sheetP = tw(t, D, D + 0.7, 0, 1, E.out) * (1 - tw(t, D + 13.55, D + 14.05, 0, 1, E.inOut));
  const scroll = kf(t, [
    [D, { s: 0 }], [D + 5.2, { s: 0 }, (x) => x], [D + 6.2, { s: 360 }, E.smooth], [D + 8.6, { s: 360 }],
    [D + 9.5, { s: 690 }, E.smooth], [D + 11.0, { s: 690 }], [D + 12.0, { s: 760 }, E.smooth], [D + 13.4, { s: 1180 }, (x) => x],
  ]).s;
  const rad = tw(cam.z, 0.9, 1.0, 22, 0, (x) => x);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: cam.o }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: 480, height: 853, transformOrigin: '0 0',
            transform: `translate(${540 + cam.ox}px, ${960 + cam.oy}px) scale(${scale}) translate(${-cam.cx}px, ${-cam.cy}px)`,
            borderRadius: rad, boxShadow: '0 60px 160px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.1)', overflow: 'hidden',
          }}
        >
          <div className="crm m">
            <CrmStyle />
            <main style={{ filter: sheetP > 0.01 ? `blur(${sheetP * 1.6}px)` : undefined }}>
              <div style={{ position: 'absolute', inset: 0, opacity: lv, display: lv > 0.01 ? 'block' : 'none' }}><LeadsListM arrive={arrive} glow={glow} /></div>
              {vToday > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vToday, background: '#fff' }}><TodayView /></div>}
              {vCalls > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vCalls, background: '#fff' }}><CallsView hot={tw(t, R + 7.4, R + 8.2) * (1 - tw(t, R + 9.2, R + 10.2))} /></div>}
              {vRules > 0.01 && <div style={{ position: 'absolute', inset: 0, opacity: vRules, background: '#fff' }}><RulesView slide={3} /></div>}
            </main>
            <TabBar view={navView} />
            {sheetP > 0.002 && (
              <>
                <div className="scrim" style={{ opacity: sheetP }} />
                <div className="sheet" style={{ transform: `translateY(${(1 - sheetP) * 680}px)` }}>
                  <DrawerHead />
                  <DrawerBody scroll={scroll} />
                </div>
              </>
            )}
            <Touch t={t} />
          </div>
        </div>
      </div>
      <OrbV t={t} />
      <Captions t={t} />
    </>
  );
};
