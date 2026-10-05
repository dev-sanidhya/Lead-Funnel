import React from 'react';
import { C, INTER, SERIF, E, tw, useVertical } from './lib.js';
import { S } from './timeline.js';

const D = S.drawer;
const R = S.recap;

/* ---------------- captions ---------------- */
const CAPS = [
  [S.zoom + 0.9, S.zoom + 3.7, 'And the lead lands in your CRM, instantly.'],
  [S.board + 0.1, S.board + 2.9, 'New lead. Already qualified. Already booked.'],
  [R + 0.35, R + 3.2, 'Today: everything that needs you, in one place.'],
  [R + 3.85, R + 6.7, 'Leads: the whole pipeline, at a glance.'],
  [R + 7.35, R + 10.2, 'Calls: booked automatically, reminders handled.'],
  [R + 10.6, R + 13.9, 'Rules: you set the bar. The assistant enforces it.'],
];
// captions that sit in the dimmed space beside the lead drawer
const SIDE = [
  [D + 1.2, D + 5.0, 'Summary', 'A plain-English *summary* and the next step, ready for your team.'],
  [D + 5.5, D + 8.3, 'Details', 'Every detail *captured.* Nothing typed by hand.'],
  [D + 8.8, D + 10.7, 'Call', 'Call *booked,* and a reminder is already scheduled.'],
  [D + 11.0, D + 13.2, 'Conversation', 'The full chat, *one click* away.'],
];
const SideCaptions = ({ t }) => {
  const V = useVertical();
  return (
  <>
    {SIDE.map(([a, b, eyebrow, text], i) => {
      const pin = tw(t, a, a + 0.8, 0, 1, E.out);
      const pout = tw(t, b - 0.4, b, 0, 1, E.inOut);
      const op = pin * (1 - pout);
      if (op <= 0.001) return null;
      return (
        <div key={i} style={{ position: 'absolute', left: V ? 70 : 84, top: V ? 120 : 300, width: V ? 940 : 600, opacity: op, transform: `translateY(${(1 - pin) * 30 - pout * 16}px)`, filter: `blur(${(1 - pin) * 6 + pout * 5}px)`, zIndex: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: INTER, fontWeight: 600, fontSize: V ? 24 : 20, letterSpacing: '0.24em', textTransform: 'uppercase', color: C.mint }}>
            <span style={{ width: 40, height: 1, background: C.mint, opacity: 0.7 }} />{eyebrow}
          </div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: V ? 62 : 60, lineHeight: 1.06, letterSpacing: '-0.045em', color: C.ink, marginTop: V ? 18 : 24 }}>
            {text.split('*').map((seg, k) => (k % 2 ? <span key={k} style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.mint, fontSize: '1.08em', letterSpacing: '-0.01em' }}>{seg}</span> : <span key={k}>{seg}</span>))}
          </div>
        </div>
      );
    })}
  </>
  );
};
export const Captions = ({ t }) => {
  const V = useVertical();
  return (
  <>
    <SideCaptions t={t} />
    {CAPS.map(([a, b, text], i) => {
      const pin = tw(t, a, a + 0.55, 0, 1, E.out);
      const pout = tw(t, b - 0.35, b, 0, 1, E.inOut);
      const op = pin * (1 - pout);
      if (op <= 0.001) return null;
      return (
        <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: V ? 190 : 62, display: 'flex', justifyContent: 'center', padding: V ? '0 40px' : 0, opacity: op, transform: `translateY(${(1 - pin) * 22 + pout * 10}px)`, zIndex: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: V ? '22px 36px 22px 30px' : '17px 32px 17px 26px', borderRadius: V ? 52 : 60, background: 'rgba(7,13,12,.86)', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 24px 70px rgba(0,0,0,.45)', fontFamily: INTER, fontSize: V ? 38 : 31, lineHeight: V ? 1.2 : 1.5, fontWeight: 560, letterSpacing: '-0.02em', color: C.ink }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: C.mint, boxShadow: `0 0 14px ${C.mint}` }} />
            {text}
          </div>
        </div>
      );
    })}
  </>
  );
};
