// Master timeline, in seconds. Every scene reads its start from here, and the audio script reads the cues.
export const S = {
  intro: 0,
  ad: 6.2,
  chat: 15.6,
  zoom: 42.8,
  board: 48.6,
  drawer: 52.4,
  recap: 66.6,
  outro: 80.8,
};
export const TOTAL = 89.5;

// Chat script. `at` is seconds from the start of the chat scene.
export const CHAT = [
  { id: 'm1', who: 'me', at: 0.9, text: "Hi! I'm Riya from Mira Skin. We're launching a new serum and need launch PR plus influencer seeding. Budget is around ₹5 to 8 lakh and we'd like to start within a month. Evenings are best to reach me.", paste: true },
  { id: 'a1', who: 'bot', at: 4.4, typing: [2.6, 4.4], text: 'Hi Riya, so glad you came! A serum launch with PR and creator seeding is right in our sweet spot. Which cities are you launching in?' },
  { id: 'm2', who: 'me', at: 8.4, typeFrom: 5.9, text: 'Mumbai, Delhi and Bangalore mainly. Three products so far, all skincare' },
  { id: 'a2', who: 'bot', at: 11.5, typing: [9.6, 11.5], text: 'Perfect, metro beauty is where we do our best work. Have you worked with creators before?' },
  { id: 'm3', who: 'me', at: 15.3, typeFrom: 12.4, text: 'Tried about 20 micro-influencers on our own, never tracked the results properly' },
  { id: 'a3', who: 'bot', at: 18.4, typing: [16.3, 18.4], text: 'Very common. We build a tracked seeding list so every creator ties back to sales. Your budget fits our launch packages well. When can our brand lead call you?' },
  { id: 'm4', who: 'me', at: 21.6, typeFrom: 20.4, text: 'Tomorrow 5 pm works' },
  { id: 'a4', who: 'bot', at: 24.2, typing: [22.4, 24.2], text: "Booked for tomorrow at 5:00 PM with Ananya from our brand team. I'll remind you an hour before. Speak soon!" },
];
// Lead profile fields as the assistant understands them (chat-scene seconds)
export const FIELDS = [
  { k: 'Brand', v: 'Mira Skin  ·  D2C skincare', at: 2.4 },
  { k: 'Looking for', v: 'Launch PR + influencer seeding', at: 3.4 },
  { k: 'Target cities', v: 'Mumbai · Delhi · Bangalore', at: 9.2 },
  { k: 'Budget', v: '₹5 to 8 lakh', at: 3.9, meter: true },
  { k: 'Wants to start', v: 'Within a month', at: 4.5 },
  { k: 'Creator history', v: '~20 micro-influencers, untracked', at: 15.8 },
  { k: 'Call booked', v: 'Tomorrow, 5:00 PM  ·  Ananya Rao', at: 23.0, call: true },
];
export const VERDICT_AT = 25.0;

// Sound cues (absolute seconds) used to build the soundtrack
export const cues = () => {
  const out = [];
  out.push({ t: 0.2, n: 'boom' }, { t: 3.0, n: 'whoosh' }, { t: 5.9, n: 'whoosh' });
  // ad -> form
  out.push({ t: S.ad + 1.65, n: 'tap' }, { t: S.ad + 2.1, n: 'whoosh_s' });
  for (const x of [4.35, 4.7, 5.05, 5.4]) out.push({ t: S.ad + x, n: 'tick' });
  out.push({ t: S.ad + 6.05, n: 'tap' }, { t: S.ad + 6.7, n: 'success' }, { t: S.ad + 7.7, n: 'whoosh_s' });
  for (const m of CHAT) {
    if (m.who === 'me') out.push({ t: S.chat + m.at, n: 'send' });
    else out.push({ t: S.chat + m.at, n: 'recv' });
  }
  for (const f of FIELDS) out.push({ t: S.chat + f.at + 0.25, n: 'tick' });
  out.push({ t: S.chat + VERDICT_AT, n: 'chime' });
  // zoom out and CRM
  out.push({ t: S.zoom, n: 'whoosh' }, { t: S.zoom + 2.4, n: 'orb' }, { t: S.zoom + 3.8, n: 'land' });
  out.push({ t: S.board + 3.3, n: 'tap' }, { t: S.drawer + 0.15, n: 'whoosh_s' });
  out.push({ t: S.drawer + 13.4, n: 'tap' });
  for (const x of [0.2, 3.7, 7.2, 10.7]) out.push({ t: S.recap + x - 0.45, n: 'tap' });
  for (const x of [0.2, 3.7, 7.2, 10.7]) out.push({ t: S.recap + x + 0.1, n: 'tick' });
  out.push({ t: S.outro, n: 'whoosh' }, { t: S.outro + 1.6, n: 'success' });
  return out.sort((a, b) => a.t - b.t);
};
