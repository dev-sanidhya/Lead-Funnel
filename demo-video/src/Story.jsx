import React from 'react';
import { C, INTER, SERIF, E, tw, kf, typed, useVertical } from './lib.js';
import { S, FIELDS, VERDICT_AT } from './timeline.js';
import { Phone } from './Phone.jsx';
import { FeedScreen, FormSheet, SuccessOverlay, DMScreen } from './IGScreens.jsx';

/* ---------------- phone choreography ---------------- */
export const phonePose = (t, V = false) =>
  V
    ? kf(t, [
      [S.ad - 0.2, { x: 540, y: 2400, s: 1.42, ry: -14, rx: 6, o: 0 }],
      [S.ad + 1.0, { x: 540, y: 1235, s: 1.42, ry: -5, rx: 1, o: 1 }, E.out],
      [S.ad + 8.4, { x: 540, y: 1235, s: 1.42, ry: -5, rx: 1, o: 1 }],
      [S.chat + 0.4, { x: 540, y: 775, s: 1.66, ry: 0, rx: 0, o: 1 }, E.smooth],
      [S.zoom, { x: 540, y: 775, s: 1.66, ry: 0, rx: 0, o: 1 }],
      [S.zoom + 1.9, { x: 540, y: 330, s: 0.5, ry: 0, rx: 0, o: 1 }, E.smooth],
      [S.zoom + 4.6, { x: 540, y: 330, s: 0.5, ry: 0, rx: 0, o: 1 }],
      [S.zoom + 6.0, { x: 540, y: -320, s: 0.5, ry: 0, rx: 0, o: 0 }, E.inOut],
    ])
    : kf(t, [
      [S.ad - 0.2, { x: 1360, y: 1700, s: 0.96, ry: -22, rx: 8, o: 0 }],
      [S.ad + 1.0, { x: 1360, y: 540, s: 0.96, ry: -9, rx: 2, o: 1 }, E.out],
      [S.ad + 8.4, { x: 1360, y: 540, s: 0.96, ry: -9, rx: 2, o: 1 }],
      [S.chat + 0.4, { x: 590, y: 540, s: 1.13, ry: 0, rx: 0, o: 1 }, E.smooth],
      [S.zoom, { x: 590, y: 540, s: 1.13, ry: 0, rx: 0, o: 1 }],
      [S.zoom + 1.9, { x: 330, y: 560, s: 0.52, ry: 14, rx: 0, o: 1 }, E.smooth],
      [S.zoom + 4.6, { x: 330, y: 560, s: 0.52, ry: 14, rx: 0, o: 1 }],
      [S.zoom + 6.0, { x: -260, y: 560, s: 0.52, ry: 24, rx: 0, o: 0 }, E.inOut],
    ]);

export const PhoneStory = ({ t }) => {
  const V = useVertical();
  if (t < S.ad - 0.3 || t > S.zoom + 6.1) return null;
  const p = phonePose(t, V);
  const a = t - S.ad;
  const c = t - S.chat;
  const dm = tw(a, 7.7, 8.5, 0, 1, E.soft);
  return (
    <Phone x={p.x} y={p.y} scale={p.s} rotY={p.ry} rotX={p.rx} opacity={p.o}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-dm * 90}px)`, filter: `brightness(${1 - dm * 0.6})` }}>
        <FeedScreen a={a} />
        {a > 1.9 && <FormSheet a={a} />}
        <SuccessOverlay a={a} />
      </div>
      {a >= 7.65 && (
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${(1 - dm) * 388}px)`, boxShadow: '-30px 0 60px rgba(0,0,0,.6)', zIndex: 45 }}>
          <DMScreen c={c} />
        </div>
      )}
    </Phone>
  );
};

/* ---------------- left captions for the ad scene ---------------- */
const STEPS = [
  { n: '01', at: 0.7, until: 2.8, h: [['A Meta ad catches the '], ['right brand.', 1]], sub: 'Targeted creative. One tap to enquire.' },
  { n: '02', at: 3.0, until: 7.5, h: [['A 30-second form captures '], ['intent.', 1]], sub: 'Name, brand, need, budget and timing, before a single message is sent.' },
  { n: '03', at: 7.8, until: 9.6, h: [['Straight into their '], ['Instagram DMs.', 1]], sub: 'No new app to install. No waiting on your team.' },
];
export const AdCaptions = ({ t }) => {
  const V = useVertical();
  const a = t - S.ad;
  return (
    <>
      {STEPS.map((s) => {
        const pin = tw(a, s.at, s.at + 0.9, 0, 1, E.out);
        const pout = tw(a, s.until - 0.4, s.until, 0, 1, E.inOut);
        const op = pin * (1 - pout);
        if (op <= 0.001) return null;
        return (
          <div key={s.n} style={{ position: 'absolute', left: V ? 70 : 150, top: V ? 150 : 330, width: V ? 940 : 760, opacity: op, transform: `translateY(${(1 - pin) * 36 - pout * 24}px)`, filter: `blur(${(1 - pin) * 6 + pout * 6}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: INTER, fontWeight: 600, fontSize: V ? 26 : 20, letterSpacing: '0.24em', color: C.mint }}>
              <span>{s.n}</span><span style={{ width: 56, height: 1, background: C.mint, opacity: 0.6 }} /><span style={{ color: C.faint }}>03</span>
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: V ? 82 : 82, lineHeight: 1.04, letterSpacing: '-0.048em', color: C.ink, marginTop: V ? 20 : 26 }}>
              {s.h.map(([txt, em], i) => (em ? <span key={i} style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, color: C.mint, fontSize: '1.08em', letterSpacing: '-0.01em' }}>{txt}</span> : <span key={i}>{txt}</span>))}
            </div>
            <div style={{ fontFamily: INTER, fontSize: V ? 34 : 28, lineHeight: 1.38, color: C.mute, marginTop: V ? 20 : 26, maxWidth: V ? 900 : 620 }}>{s.sub}</div>
          </div>
        );
      })}
    </>
  );
};

/* ---------------- the live lead profile that fills while they chat ---------------- */
const Check = ({ p }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: p }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(52,211,153,.35)" strokeWidth="1.5" />
    <path d="M7.5 12.5l3 3 6-6.5" strokeDasharray="22" strokeDashoffset={22 * (1 - p)} />
  </svg>
);

const Row = ({ f, c }) => {
  const p = tw(c, f.at, f.at + 0.7, 0, 1, E.out);
  const flash = c < f.at ? 0 : 1 - tw(c, f.at + 0.1, f.at + 1.5, 0, 1, E.out);
  const val = typed(f.v, c, f.at + 0.15, f.at + 0.15 + Math.min(1.0, f.v.length * 0.035));
  const chk = tw(c, f.at + 0.8, f.at + 1.2, 0, 1, E.out);
  return (
    <div style={{ position: 'relative', opacity: 0.18 + 0.82 * p, transform: `translateY(${(1 - p) * 12}px)` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr 34px', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ fontFamily: INTER, fontSize: 20, color: C.faint, fontWeight: 500 }}>{f.k}</div>
        <div style={{ fontFamily: INTER, fontSize: 27, color: C.ink, fontWeight: 560, letterSpacing: '-0.02em', background: `linear-gradient(90deg, rgba(94,234,212,${0.22 * flash}), transparent)`, borderRadius: 8, padding: '2px 8px', marginLeft: -8, minHeight: 38, whiteSpace: 'pre' }}>{c >= f.at ? val : ''}</div>
        <Check p={c >= f.at ? chk : 0} />
      </div>
      {f.meter && c >= f.at + 0.9 && (
        <div style={{ position: 'absolute', right: 56, top: -2, fontFamily: INTER, fontSize: 15, fontWeight: 650, color: '#34d399', background: 'rgba(52,211,153,.12)', border: '1px solid rgba(52,211,153,.35)', padding: '3px 11px', borderRadius: 20, opacity: tw(c, f.at + 0.9, f.at + 1.4), transform: `translateY(${(1 - tw(c, f.at + 0.9, f.at + 1.4)) * 6}px)` }}>
          Above your ₹3L minimum
        </div>
      )}
    </div>
  );
};

export const ProfilePanel = ({ t }) => {
  const c = t - S.chat;
  const enter = tw(c, 0.4, 1.4, 0, 1, E.out);
  const exit = tw(t, S.zoom + 0.1, S.zoom + 1.0, 0, 1, E.inOut);
  if (enter <= 0 || exit >= 1) return null;
  const done = c >= VERDICT_AT;
  const v = tw(c, VERDICT_AT, VERDICT_AT + 0.9, 0, 1, E.out);
  const listening = !done;
  return (
    <div style={{ position: 'absolute', left: 1030, top: 118, width: 770, opacity: enter * (1 - exit), transform: `translateX(${(1 - enter) * 90 + exit * 60}px) scale(${1 - exit * 0.04})`, filter: `blur(${exit * 8}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: INTER, fontSize: 19, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.mint, marginBottom: 20 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.mint, boxShadow: `0 0 ${10 + 8 * Math.sin(c * 5)}px ${C.mint}`, opacity: listening ? 1 : 0.5 }} />
        {listening ? 'Aria is reading the chat' : 'Lead qualified'}
      </div>
      <div style={{ borderRadius: 30, background: 'linear-gradient(160deg, rgba(255,255,255,.075), rgba(255,255,255,.025))', border: '1px solid rgba(255,255,255,.12)', padding: '34px 40px 30px', boxShadow: '0 40px 120px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#c7d2fe,#818cf8)', display: 'grid', placeItems: 'center', fontFamily: INTER, fontWeight: 700, fontSize: 28, color: '#1e1b4b' }}>R</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: INTER, fontSize: 38, fontWeight: 650, letterSpacing: '-0.035em', color: C.ink }}>{c > 0.9 ? 'Riya Mehta' : ''}</div>
            <div style={{ fontFamily: INTER, fontSize: 20, color: C.faint, marginTop: 2 }}>via Instagram DM · Meta ad lead</div>
          </div>
          <div style={{ fontFamily: INTER, fontSize: 19, fontWeight: 650, padding: '8px 18px', borderRadius: 12, background: done ? 'rgba(52,211,153,.16)' : 'rgba(96,165,250,.16)', color: done ? '#34d399' : '#60a5fa', border: `1px solid ${done ? 'rgba(52,211,153,.4)' : 'rgba(96,165,250,.4)'}` }}>
            {done ? 'Active' : 'In conversation'}
          </div>
        </div>
        <div style={{ marginTop: 6 }}>
          {[...FIELDS].sort((x, y) => x.at - y.at).map((f) => (<Row key={f.k} f={f} c={c} />))}
        </div>
        <div style={{ marginTop: 22, height: 74, borderRadius: 18, overflow: 'hidden', position: 'relative', border: `1px solid ${done ? 'rgba(52,211,153,.5)' : 'rgba(255,255,255,.08)'}`, background: done ? 'linear-gradient(90deg, rgba(52,211,153,.22), rgba(94,234,212,.08))' : 'rgba(255,255,255,.03)', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16, boxShadow: done ? `0 0 ${50 * v}px rgba(52,211,153,${0.3 * v})` : 'none' }}>
          {done ? (
            <>
              <Check p={1} />
              <div style={{ fontFamily: INTER, fontSize: 25, fontWeight: 650, color: C.ink, letterSpacing: '-0.02em', opacity: v, transform: `translateX(${(1 - v) * 12}px)` }}>Qualified. Assigned to Ananya Rao.</div>
              <div style={{ marginLeft: 'auto', fontFamily: INTER, fontSize: 18, color: '#34d399', fontWeight: 600, opacity: v }}>9 seconds from enquiry</div>
            </>
          ) : (
            <div style={{ fontFamily: INTER, fontSize: 21, color: C.faint }}>Checking your budget bar and booking a call…</div>
          )}
        </div>
      </div>
      <div style={{ fontFamily: INTER, fontSize: 19, color: C.faint, marginTop: 22, lineHeight: 1.5, maxWidth: 700 }}>
        The AI understands the conversation. Your rules decide the outcome, so budgets and call times are never left to a guess.
      </div>
    </div>
  );
};

/* ---------------- vertical layout: the lead profile as a compact chip cloud under the phone ---------------- */
const SHORT = {
  Brand: 'Mira Skin · D2C skincare',
  'Looking for': 'Launch PR + seeding',
  'Target cities': 'Mumbai · Delhi · Bangalore',
  Budget: '₹5 to 8 L · above minimum',
  'Wants to start': 'Within a month',
  'Creator history': '~20 creators, untracked',
  'Call booked': 'Tomorrow, 5:00 PM',
};
export const ProfileChips = ({ t }) => {
  const c = t - S.chat;
  const enter = tw(c, 0.4, 1.2, 0, 1, E.out);
  const exit = tw(t, S.zoom + 0.1, S.zoom + 0.9, 0, 1, E.inOut);
  if (enter <= 0 || exit >= 1) return null;
  const done = c >= VERDICT_AT;
  const v = tw(c, VERDICT_AT, VERDICT_AT + 0.9, 0, 1, E.out);
  return (
    <div style={{ position: 'absolute', left: 54, top: 1528, width: 972, opacity: enter * (1 - exit), transform: `translateY(${(1 - enter) * 40 + exit * 30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: INTER, fontSize: 24, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.mint, marginBottom: 16 }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: C.mint, boxShadow: `0 0 ${10 + 8 * Math.sin(c * 5)}px ${C.mint}` }} />
        {done ? 'Lead qualified' : 'Aria is reading the chat'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {[...FIELDS].sort((x, y) => x.at - y.at).map((f) => {
          const p = tw(c, f.at, f.at + 0.6, 0, 1, E.out);
          if (c < f.at) return null;
          const flash = 1 - tw(c, f.at + 0.1, f.at + 1.4, 0, 1, E.out);
          return (
            <div key={f.k} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${0.95 + 0.05 * p})`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 16, fontFamily: INTER, fontSize: 26, fontWeight: 560, letterSpacing: '-0.02em', color: C.ink, background: `rgba(255,255,255,${0.07 + 0.1 * flash})`, border: `1px solid rgba(94,234,212,${0.2 + 0.5 * flash})` }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mint }}>{f.k === 'Looking for' ? 'Need' : f.k === 'Wants to start' ? 'Start' : f.k === 'Target cities' ? 'Cities' : f.k === 'Creator history' ? 'History' : f.k === 'Call booked' ? 'Call' : f.k}</span>
              {SHORT[f.k]}
            </div>
          );
        })}
      </div>
      {done && (
        <div style={{ marginTop: 16, height: 76, borderRadius: 18, border: '1px solid rgba(52,211,153,.5)', background: 'linear-gradient(90deg, rgba(52,211,153,.24), rgba(94,234,212,.08))', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 14, opacity: v, transform: `translateY(${(1 - v) * 14}px)`, boxShadow: `0 0 ${50 * v}px rgba(52,211,153,${0.3 * v})` }}>
          <Check p={1} />
          <div style={{ fontFamily: INTER, fontSize: 30, fontWeight: 650, color: C.ink, letterSpacing: '-0.02em' }}>Qualified. Assigned to Ananya Rao.</div>
        </div>
      )}
    </div>
  );
};
