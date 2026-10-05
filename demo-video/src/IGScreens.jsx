import React, { useLayoutEffect, useRef, useState } from 'react';
import { delayRender, continueRender } from 'remotion';
import { INTER, SERIF, E, tw, typed } from './lib.js';
import { CHAT } from './timeline.js';
import { StatusBar, Ico, I, GucAvatar } from './Phone.jsx';

/* ------------------------------------------------------------------ */
/* Tap indicator (a finger press on the phone screen)                  */
/* ------------------------------------------------------------------ */
export const Tap = ({ a, at, x, y }) => {
  const p = tw(a, at, at + 0.7, 0, 1, (v) => v);
  if (a < at - 0.12 || a > at + 0.8) return null;
  const press = tw(a, at - 0.12, at, 0, 1, E.out) * (1 - tw(a, at + 0.1, at + 0.35, 0, 1, E.out));
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 70, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: -48, top: -48, width: 96, height: 96, borderRadius: '50%', border: '2px solid rgba(255,255,255,.7)', opacity: (1 - p) * 0.9, transform: `scale(${0.4 + p * 0.9})` }} />
      <div style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.55)', boxShadow: '0 4px 22px rgba(0,0,0,.35)', opacity: press, transform: `scale(${0.7 + press * 0.3})` }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 1. The Meta ad in the feed                                          */
/* ------------------------------------------------------------------ */
export const FeedScreen = ({ a }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#000', fontFamily: INTER, color: '#fff' }}>
    <StatusBar />
    <div style={{ position: 'absolute', top: 54, left: 0, right: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
      <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 31, letterSpacing: '-0.01em' }}>Instagram</span>
      <span style={{ display: 'flex', gap: 18 }}><Ico d={I.heart} size={25} /><Ico d={I.send} size={25} /></span>
    </div>
    {/* post header */}
    <div style={{ position: 'absolute', top: 108, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
      <GucAvatar size={34} />
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>instagladucame</div>
        <div style={{ fontSize: 12, color: '#a8a8a8' }}>Sponsored</div>
      </div>
      <span style={{ marginLeft: 'auto' }}><Ico d={I.dots} size={22} /></span>
    </div>
    {/* creative */}
    <div style={{ position: 'absolute', top: 156, left: 0, width: 388, height: 420, overflow: 'hidden', background: 'linear-gradient(150deg, #0e5f4a 0%, #0b3b32 45%, #06231f 100%)' }}>
      <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', right: -120, top: -90, background: 'radial-gradient(circle at 35% 35%, #99f6e0, #2dd4aa 40%, transparent 70%)', opacity: 0.85 }} />
      <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', left: -90, bottom: -80, background: 'radial-gradient(circle at 60% 40%, #34d399, transparent 70%)', opacity: 0.55 }} />
      <div style={{ position: 'absolute', left: 26, top: 28, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, color: '#bffcec' }}>PR · Influencers · Launches</div>
      <div style={{ position: 'absolute', left: 26, bottom: 36, right: 26 }}>
        <div style={{ fontSize: 46, lineHeight: 1.0, fontWeight: 700, letterSpacing: '-0.04em' }}>Launching</div>
        <div style={{ fontSize: 46, lineHeight: 1.0, fontWeight: 700, letterSpacing: '-0.04em' }}>a brand?</div>
        <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, lineHeight: 1.05, color: '#99f6e0', marginTop: 4 }}>Get talked about.</div>
      </div>
    </div>
    {/* CTA */}
    <div style={{ position: 'absolute', top: 576, left: 0, width: 388, height: 52, background: '#1b2a29', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 15, fontWeight: 600 }}>
      <span>Get a free launch strategy call</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#5eead4' }}>Learn more <Ico d={I.chevron} size={16} stroke="#5eead4" /></span>
    </div>
    <div style={{ position: 'absolute', top: 640, left: 14, right: 14 }}>
      <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}><Ico d={I.heart} size={26} /><Ico d={I.comment} size={26} /><Ico d={I.send} size={26} /></div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>1,284 likes</div>
      <div style={{ fontSize: 14, lineHeight: 1.35, color: '#e8e8e8', marginTop: 4 }}><b>instagladucame</b> From launch day buzz to creator seeding that actually sells. Tap to talk to us.</div>
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, borderTop: '1px solid #1c1c1c', background: '#000', display: 'flex', justifyContent: 'space-around', padding: '14px 12px 0' }}>
      <Ico d={I.home} fill="#fff" /><Ico d={I.search} /><Ico d={I.plus} /><Ico d={I.reels} /><div style={{ width: 26, height: 26, borderRadius: '50%', background: '#444' }} />
    </div>
    <Tap a={a} at={1.65} x={290} y={602} />
  </div>
);

/* ------------------------------------------------------------------ */
/* 2. The lead form that fills itself                                  */
/* ------------------------------------------------------------------ */
const Field = ({ label, value, focus, caret }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', marginBottom: 6 }}>{label}</div>
    <div style={{ height: 44, borderRadius: 12, background: '#262626', border: `1.5px solid ${focus ? '#5eead4' : 'transparent'}`, padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: 16, color: '#fff', boxShadow: focus ? '0 0 0 4px rgba(94,234,212,.15)' : 'none' }}>
      {value}
      {caret ? <span style={{ width: 2, height: 20, background: '#5eead4', marginLeft: 1, opacity: Math.floor(caret * 2.6) % 2 ? 0.2 : 1 }} /> : null}
    </div>
  </div>
);

const Chip = ({ children, on, at, a }) => {
  const p = on ? tw(a, at, at + 0.35, 0, 1, E.back) : 0;
  return (
    <span
      style={{
        display: 'inline-block', padding: '8px 14px', borderRadius: 22, fontSize: 14, fontWeight: 600, marginRight: 8, marginBottom: 8,
        border: `1.5px solid ${p > 0.2 ? '#5eead4' : '#3a3a3a'}`,
        background: p > 0.2 ? '#5eead4' : 'transparent', color: p > 0.2 ? '#04231a' : '#d0d0d0',
        transform: `scale(${1 + Math.sin(p * Math.PI) * 0.1})`,
      }}
    >
      {children}
    </span>
  );
};

export const FormSheet = ({ a }) => {
  const slide = tw(a, 2.0, 2.75, 0, 1, E.out);
  const nameT = typed('Riya Mehta', a, 2.85, 3.5);
  const brandT = typed('Mira Skin', a, 3.6, 4.2);
  const submit = a >= 6.05;
  const pressP = tw(a, 5.95, 6.1, 0, 1, E.out) * (1 - tw(a, 6.15, 6.35, 0, 1, E.out));
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30 }}>
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${0.55 * slide})` }} />
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 700, borderRadius: '30px 30px 0 0', background: '#161618',
          transform: `translateY(${(1 - slide) * 720}px)`, padding: '12px 20px', fontFamily: INTER, color: '#fff',
          boxShadow: '0 -20px 60px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ width: 44, height: 5, borderRadius: 3, background: '#3a3a3a', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>Tell us about your launch</div>
        <div style={{ fontSize: 13.5, color: '#9a9a9a', margin: '3px 0 16px' }}>Takes 30 seconds. We reply on Instagram instantly.</div>
        <Field label="Your name" value={nameT} focus={a > 2.8 && a < 3.55} caret={a > 2.8 && a < 3.55 ? a : 0} />
        <Field label="Brand" value={brandT} focus={a > 3.55 && a < 4.3} caret={a > 3.55 && a < 4.3 ? a : 0} />
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', margin: '4px 0 8px' }}>What do you need?</div>
        <div>
          <Chip on={a >= 4.35} at={4.35} a={a}>Launch PR</Chip>
          <Chip on={a >= 4.7} at={4.7} a={a}>Influencer seeding</Chip>
          <Chip>Events</Chip>
          <Chip>Social media</Chip>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', margin: '6px 0 8px' }}>Monthly budget</div>
        <div>
          <Chip>Under ₹3L</Chip>
          <Chip>₹3 to 5L</Chip>
          <Chip on={a >= 5.05} at={5.05} a={a}>₹5 to 8L</Chip>
          <Chip>₹8L+</Chip>
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#9a9a9a', margin: '6px 0 8px' }}>When do you want to start?</div>
        <div>
          <Chip on={a >= 5.4} at={5.4} a={a}>This month</Chip>
          <Chip>In 1 to 3 months</Chip>
          <Chip>Just exploring</Chip>
        </div>
        <div
          style={{
            position: 'absolute', left: 20, right: 20, bottom: 34, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center',
            background: submit ? '#34d399' : '#5eead4', color: '#04231a', fontSize: 17, fontWeight: 700, transform: `scale(${1 - pressP * 0.04})`,
            boxShadow: '0 10px 30px rgba(52,211,153,.35)',
          }}
        >
          {submit ? 'Sending…' : 'Continue on Instagram'}
        </div>
      </div>
      <Tap a={a} at={6.05} x={194} y={782} />
    </div>
  );
};

export const SuccessOverlay = ({ a }) => {
  const p = tw(a, 6.45, 7.0, 0, 1, E.out);
  const draw = tw(a, 6.6, 7.1, 0, 1, E.smooth);
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 35, background: `rgba(10,12,12,${0.96 * p})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: INTER, color: '#fff', opacity: p }}>
      <div style={{ width: 92, height: 92, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(94,234,212,.14)', border: '2px solid #5eead4', transform: `scale(${0.7 + p * 0.3})`, boxShadow: '0 0 60px rgba(94,234,212,.35)' }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset={24 * (1 - draw)} />
        </svg>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 24 }}>You're in, Riya</div>
      <div style={{ fontSize: 15, color: '#a8a8a8', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>Opening Instagram messages</div>
      <div style={{ width: 150, height: 3, borderRadius: 2, background: '#2a2a2a', marginTop: 22, overflow: 'hidden' }}>
        <div style={{ width: `${tw(a, 6.7, 7.8, 0, 100, (v) => v)}%`, height: '100%', background: '#5eead4' }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* 3. The Instagram DM thread                                          */
/* ------------------------------------------------------------------ */
const BW = 262;
const bubble = (who) => ({
  maxWidth: BW, padding: '11px 15px', fontSize: 15.5, lineHeight: 1.34, borderRadius: 22, color: '#fff', wordBreak: 'break-word',
  background: who === 'me' ? 'linear-gradient(180deg,#8f5cff 0%,#5a4cf2 100%)' : '#262626',
});

const useHeights = () => {
  const ref = useRef(null);
  const [h, setH] = useState(null);
  const [handle] = useState(() => delayRender('measure bubbles'));
  useLayoutEffect(() => {
    if (!ref.current) return;
    const out = {};
    for (const el of ref.current.children) out[el.dataset.id] = el.offsetHeight;
    setH(out);
    continueRender(handle);
  }, [handle]);
  return [ref, h];
};

const VH = 638 - 26;

export const DMScreen = ({ c }) => {
  const [mref, hs] = useHeights();
  const heights = hs || {};
  // layout (final positions)
  let y = 16;
  const introTop = y; y += 176;
  const stampTop = y; y += 38;
  const items = CHAT.map((m) => { const h = heights[m.id] || 60; const it = { m, y, h }; y += h + 12; return it; });
  // scroll: a smoothed step every time the bottom of the visible content grows
  const ev = [];
  for (const it of items) {
    if (it.m.who === 'me') ev.push({ ts: it.m.at, b: it.y + it.h });
    else { ev.push({ ts: it.m.typing[0], b: it.y + 40 }); ev.push({ ts: it.m.at, b: it.y + it.h }); }
  }
  let prev = 0, scroll = 0;
  for (const e of ev) { const tgt = Math.max(0, e.b - VH); scroll += (tgt - prev) * tw(c, e.ts, e.ts + 0.7, 0, 1, E.soft); prev = tgt; }

  // input bar text
  let inputText = '';
  let inputLong = false;
  for (const m of CHAT) {
    if (m.who !== 'me') continue;
    if (m.paste) { if (c >= m.at - 0.85 && c < m.at) { inputText = m.text; inputLong = true; } }
    else if (c >= m.typeFrom && c < m.at) inputText = typed(m.text, c, m.typeFrom, m.at - 0.35);
  }

  const dots = (ph) => 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(c * 7 - ph));
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', fontFamily: INTER, color: '#fff' }}>
      {/* hidden measurer */}
      <div ref={mref} style={{ position: 'absolute', visibility: 'hidden', left: 0, top: 0, width: 360, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {CHAT.map((m) => (<div key={m.id} data-id={m.id} style={bubble(m.who)}>{m.text}</div>))}
      </div>
      <StatusBar />
      {/* header */}
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, height: 60, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px 0 12px', borderBottom: '1px solid #151515', background: '#000', zIndex: 20 }}>
        <Ico d={I.back} size={28} />
        <GucAvatar size={36} />
        <div style={{ lineHeight: 1.18 }}>
          <div style={{ fontSize: 16, fontWeight: 650 }}>Glad U Came</div>
          <div style={{ fontSize: 12, color: '#9a9a9a' }}>instagladucame</div>
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}><Ico d={I.phone} size={25} /><Ico d={I.video} size={26} /></span>
      </div>
      {/* thread */}
      <div style={{ position: 'absolute', top: 115, left: 0, right: 0, height: 638, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 14, right: 14, top: 0, transform: `translateY(${-scroll}px)` }}>
          <div style={{ position: 'absolute', top: introTop, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><GucAvatar size={76} /></div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Glad U Came</div>
            <div style={{ fontSize: 13, color: '#9a9a9a', marginTop: 2 }}>instagladucame · PR and influencer agency</div>
            <div style={{ display: 'inline-block', marginTop: 12, padding: '7px 18px', borderRadius: 10, background: '#262626', fontSize: 13.5, fontWeight: 600 }}>View profile</div>
          </div>
          <div style={{ position: 'absolute', top: stampTop, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: '#8e8e8e', fontWeight: 500 }}>Today 9:41 AM</div>
          {items.map(({ m, y: top, h }) => {
            if (m.who === 'me') {
              const p = tw(c, m.at, m.at + 0.38, 0, 1, E.out);
              if (c < m.at - 0.01) return null;
              return (
                <div key={m.id} style={{ position: 'absolute', top, right: 0, opacity: p, transform: `translateY(${(1 - p) * 26}px) scale(${0.94 + 0.06 * p})`, transformOrigin: 'bottom right' }}>
                  <div style={bubble('me')}>{m.text}</div>
                </div>
              );
            }
            const typing = c >= m.typing[0] && c < m.at;
            const pt = tw(c, m.typing[0], m.typing[0] + 0.3, 0, 1, E.out);
            const pm = tw(c, m.at, m.at + 0.4, 0, 1, E.out);
            return (
              <React.Fragment key={m.id}>
                {typing && (
                  <div style={{ position: 'absolute', top, left: 0, opacity: pt, transform: `translateY(${(1 - pt) * 14}px)` }}>
                    <div style={{ ...bubble('bot'), height: 40, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {[0, 0.9, 1.8].map((ph, i) => (<span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', opacity: dots(ph) }} />))}
                    </div>
                  </div>
                )}
                {c >= m.at && (
                  <div style={{ position: 'absolute', top, left: 0, opacity: pm, transform: `translateY(${(1 - pm) * 10}px) scale(${0.96 + 0.04 * pm})`, transformOrigin: 'bottom left' }}>
                    <div style={bubble('bot')}>{m.text}</div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        {/* top fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 26, background: 'linear-gradient(#000, transparent)' }} />
      </div>
      {/* composer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 98, background: '#000', padding: '12px 12px 0', zIndex: 20 }}>
        <div style={{ height: 48, borderRadius: 26, background: '#1a1a1a', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 0 7px' }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7b5bff,#2d8bff)', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Ico d={I.camera} size={19} /></span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, color: inputText ? '#fff' : '#8e8e8e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {inputText || 'Message…'}
            {inputText && !inputLong && <span style={{ display: 'inline-block', width: 2, height: 18, background: '#8f5cff', marginLeft: 1, verticalAlign: 'middle', opacity: Math.floor(c * 2.6) % 2 ? 0.2 : 1 }} />}
          </span>
          {inputText ? (
            <span style={{ fontSize: 15, fontWeight: 700, color: '#7c6cff', paddingRight: 8 }}>Send</span>
          ) : (
            <span style={{ display: 'flex', gap: 12, paddingRight: 6 }}><Ico d={I.mic} size={22} /><Ico d={I.image} size={22} /><Ico d={I.sticker} size={22} /></span>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 128, height: 5, borderRadius: 3, background: 'rgba(255,255,255,.85)' }} />
      </div>
    </div>
  );
};
