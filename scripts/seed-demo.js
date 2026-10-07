'use strict';
// Wipes every lead, message and activity row, then fills the CRM with sample leads that
// show every stage, every "needs you now" state and every field, for demos.
//   node scripts/seed-demo.js --wipe          (needs the flag, because it deletes data)
// Settings, designers and channel tokens are kept. Sample leads carry meta.demo, so they never
// message a real account and the background timers leave them alone until you press
// "Run follow-ups now".
const config = require('../src/config');
const { Store } = require('../src/db');
const { Settings } = require('../src/settings');
const { evaluate, pickDesigner } = require('../src/qualify');

if (!process.argv.includes('--wipe')) {
  console.log('This deletes ALL leads, messages and activity. Re-run with --wipe to confirm.');
  process.exit(1);
}

const store = new Store(config.dbPath);
const settings = new Settings(store).get();
const designers = store.listDesigners();
const NOW = Date.now();
const MIN = 60000;
const HOUR = 3600000;
const ago = (min) => NOW - min * MIN;
const IST = 5.5 * HOUR;
// A wall-clock time in India, `days` from today
const at = (days, hh, mm = 0) => {
  const d = new Date(NOW + IST);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days, hh, mm) - IST;
};
const lakh = (n) => Math.round(n * 100000);
const half = 30 * MIN;
const roundUp30 = (ts) => Math.ceil((ts + IST) / half) * half - IST;
const roundDown30 = (ts) => Math.floor((ts + IST) / half) * half - IST;
const clock = (ts) => { const d = new Date(ts + IST); let h = d.getUTCHours(); const m = d.getUTCMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`; };
const clock2 = (ts) => { const d = new Date(ts + IST); let h = d.getUTCHours(); const m = d.getUTCMinutes(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')} ${ap}`; };
const dayName = (days) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(NOW + IST + days * 86400000).getUTCDay()];
const rahulAt = roundUp30(ago(-70));
const snehaAt = roundDown30(ago(55));
const harshAt = roundDown30(ago(190));
const designerId = (name) => (designers.find((d) => d.name.startsWith(name)) || {}).id || null;

store.tx(() => {
  for (const t of ['messages', 'events', 'webhook_outbox', 'leads']) store.run(`DELETE FROM ${t}`);
  store.run("DELETE FROM sqlite_sequence WHERE name IN ('messages','events','webhook_outbox','leads')");
});

let n = 0;
// chat: [who, text, minutes ago]; who is c (customer), a (assistant), h (a person from the team)
function lead(spec) {
  n += 1;
  const { chat = [], events = [], stage, reason, meta = {}, created = 300, ...f } = spec;
  const msgs = chat.map(([who, text, m]) => ({ who, text, t: ago(m) })).sort((a, b) => a.t - b.t);
  const lastIn = [...msgs].reverse().find((m) => m.who === 'c');
  const lastOut = [...msgs].reverse().find((m) => m.who !== 'c');
  const isTg = f.channel === 'telegram';
  const row = {
    channel: 'instagram', source: 'Instagram', campaign: null, ...f,
    chat_id: f.chat_id === null ? null : (f.chat_id || (isTg ? String(7000000000 + n) : `ig:demo${1000 + n}`)),
    tg_username: isTg ? f.tg_username : null,
    meta: { demo: true, turns: msgs.filter((m) => m.who === 'c').length, ...meta },
    last_inbound_at: lastIn ? lastIn.t : null,
    last_outbound_at: lastOut ? lastOut.t : null,
    start_token: f.chat_id === null ? `demo-token-${n}` : null,
  };
  let l = store.createLead(row);
  // classify with the real rules, unless the spec pins a stage
  const ev = evaluate(l, settings, { hasInbound: msgs.some((m) => m.who === 'c') });
  const finalStage = stage || ev.stage;
  const patch = {
    stage: finalStage, stage_reason: reason || ev.reason, score: spec.score ?? ev.score,
    qualified_at: finalStage === 'active' ? (spec.qualified_at || ago(created > 120 ? 150 : 60)) : null,
    summary: spec.summary || '',
  };
  if (f.designer) patch.designer_id = designerId(f.designer);
  else if (finalStage === 'active') { const d = pickDesigner(designers, l); patch.designer_id = d ? d.id : null; }
  l = store.updateLead(l.id, patch);
  for (const m of msgs) {
    const out = m.who !== 'c';
    const failed = m.failed === true;
    store.run(
      'INSERT INTO messages(lead_id,direction,role,text,status,processed,attempts,error,created_at) VALUES(?,?,?,?,?,?,?,?,?)',
      l.id, out ? 'out' : 'in', m.who === 'c' ? 'user' : m.who === 'h' ? 'admin' : 'assistant', m.text,
      out ? 'sent' : 'received', 1, 0, null, m.t,
    );
  }
  const created_at = NOW - created * MIN;
  const updated_at = msgs.length ? msgs[msgs.length - 1].t : created_at;
  store.run('UPDATE leads SET created_at=?, updated_at=? WHERE id=?', created_at, updated_at, l.id);
  const base = [['lead_created', { source: row.source, campaign: row.campaign }, created]];
  if (row.chat_id) base.push(['chat_linked', { via: 'referral', channel: row.channel }, created - 1]);
  if (msgs.some((m) => m.who === 'c')) base.push(['facts_updated', { fields: ['project_type', 'city', 'budget_amount', 'timeline_months'].filter((k) => l[k] != null) }, Math.max(created - 4, 5)]);
  if (finalStage !== 'new') base.push(['stage_changed', { from: 'qualifying', to: finalStage, reason: patch.stage_reason, score: patch.score }, Math.max(created - 6, 4)]);
  if (patch.designer_id) base.push(['designer_assigned', { designer: designers.find((d) => d.id === patch.designer_id).name }, Math.max(created - 6, 4)]);
  for (const [type, data, m] of [...base, ...events.map((e) => [e[0], e[1] || {}, e[2]])]) {
    store.run('INSERT INTO events(lead_id,type,data,created_at) VALUES(?,?,?,?)', l.id, type, JSON.stringify(data), ago(m));
  }
  return l;
}

/* ============================ ACTIVE ============================ */
lead({
  name: 'Rahul Deshmukh', phone: '+91 98200 11001', email: 'rahul.deshmukh@example.com', campaign: 'Diwali Home Makeover',
  project_type: 'Full home', scope: 'Full home interiors, living room, 3 bedrooms and kitchen', property: '3BHK apartment, 1450 sq ft', city: 'Kharadi, Pune',
  budget_amount: lakh(14), budget_text: 'around 14 lakh', timeline_months: 1, timeline_text: 'within a month, we get possession next week',
  style: 'Modern minimal with warm wood', contact_pref: 'Afternoon', callback_at: rahulAt, callback_text: `today around ${clock(rahulAt)}`, callback_status: 'scheduled', callback_kind: 'call',
  designer: 'Priya', created: 190,
  summary: 'Rahul is taking possession of a 3BHK in Kharadi next week and wants a full-home redesign in a modern, minimal style with warm wood. Budget about 14 lakh. Call booked for today at ' + clock(rahulAt) + '.',
  chat: [
    ['c', 'Hi, saw your Diwali offer. We are getting a 3BHK in Kharadi next week, want complete interiors', 190],
    ['a', "Hi Rahul, congratulations on the new home! I'm Aria, a virtual design consultant at Aperture Interiors. Is this for the full home, or specific rooms first?", 189],
    ['c', 'Full home. Living, 3 bedrooms, kitchen. Modern but warm, not too cold', 186],
    ['a', 'Lovely, modern minimal with warm wood works beautifully in Pune light. Roughly what budget are you planning, so we can match the right designer?', 185],
    ['c', 'Around 14 lakh', 183],
    ['a', 'Great, that gives us a lot of room to work with. When would you like to start?', 182],
    ['c', `Immediately, possession is next week. Can someone call me today around ${clock(rahulAt)}?`, 178],
    ['a', `Booked: Priya Sharma will call you today at ${clock2(rahulAt)}. What's the best number?`, 177],
    ['c', '98200 11001', 176],
    ['a', "Perfect, Priya has everything. I'll send you a reminder an hour before. Speak soon!", 175],
  ],
});

lead({
  name: 'Sneha Kulkarni', phone: '+91 98221 33455', email: 'sneha.k@example.com', campaign: 'Modular Kitchen Month',
  project_type: 'Modular kitchen', scope: 'Modular kitchen with loft and chimney', property: '2BHK flat, 980 sq ft', city: 'Baner, Pune',
  budget_amount: lakh(6.5), budget_text: '6.5 lakh', timeline_months: 2, timeline_text: 'in 2 months', style: 'Warm, wooden, lots of storage',
  contact_pref: 'Evening', callback_at: snehaAt, callback_text: `today ${clock(snehaAt)}`, callback_status: 'scheduled', callback_kind: 'call', designer: 'Priya', created: 420,
  events: [['reminder_sent', { n: 1 }, 108]],
  meta: { fu: { reminded_at: ago(108) } },
  summary: 'Sneha wants a warm, wooden modular kitchen with a loft in her Baner flat, budget about 6.5 lakh, starting in two months. A call was booked for ' + clock(snehaAt) + ' today.',
  chat: [
    ['c', 'Looking for a modular kitchen, 2BHK in Baner', 420],
    ['a', "Hi Sneha, I'm Aria from Aperture Interiors. Happy to help. Any style in mind, and roughly what budget?", 419],
    ['c', 'Wooden finish, lots of storage. Budget 6.5 lakh', 415],
    ['a', 'That works well for a full modular kitchen with a loft. When are you hoping to start?', 414],
    ['c', `In about 2 months. Call me today at ${clock(snehaAt)}?`, 410],
    ['a', `Booked for today at ${clock2(snehaAt)} with Priya. See you then!`, 409],
    ['a', `Reminder: Priya will call you at ${clock2(snehaAt)} today.`, 108],
  ],
});

lead({
  name: 'Vikram Joshi', phone: '+91 98900 22877', email: 'vikram.joshi@example.com', source: 'Google Form', campaign: 'Villa Series',
  project_type: 'Full home', scope: 'Full villa interiors including pooja room and home theatre', property: '4BHK villa, 3200 sq ft', city: 'Wakad, Pune',
  budget_amount: lakh(28), budget_text: '28 lakh', timeline_months: 3, timeline_text: 'within 3 months', style: 'Classic with modern touches',
  contact_pref: 'Evening', callback_at: at(1, 11, 0), callback_text: 'tomorrow 11 am', callback_status: 'scheduled', callback_kind: 'call', designer: 'Priya', created: 640,
  summary: 'Vikram is building out a 4BHK villa in Wakad: classic style with modern touches, pooja room and home theatre. Budget 28 lakh. Call booked tomorrow 11 am.',
  chat: [
    ['c', 'Hi! I filled the villa form. 4BHK villa in Wakad, want full interiors', 640],
    ['a', "Hi Vikram, thanks for reaching out to Aperture Interiors, I'm Aria. A villa is a lovely canvas. Anything specific you want, like a pooja room or home theatre?", 639],
    ['c', 'Both. Classic look but not old fashioned', 632],
    ['a', 'Understood, classic with modern touches. Budget range you have in mind?', 631],
    ['c', 'Around 28 lakh, want to finish within 3 months', 625],
    ['a', 'That fits our villa projects well. When can our senior designer call you?', 624],
    ['c', 'Tomorrow 11 am works', 620],
    ['a', 'Booked: Priya Sharma, tomorrow at 11:00 AM. Which number should she use?', 619],
    ['c', '98900 22877', 618],
    ['a', 'Thanks Vikram, all set!', 617],
  ],
});

lead({
  name: 'Karan Mehta (Brightline Studio)', phone: '+91 98190 55012', email: 'karan@brightline.example.com', campaign: 'Office Fit-outs',
  project_type: 'Office', scope: 'New office fit-out with open workspace, 2 cabins and a cafeteria', property: 'Commercial office, 3000 sq ft', city: 'Mumbai',
  budget_amount: lakh(45), budget_text: '45 lakh', timeline_months: 2, timeline_text: 'in 2 months', style: 'Bright, open, creative studio',
  contact_pref: 'Morning', callback_at: at(2, 15, 0), callback_text: `${dayName(2)} 3 pm`, callback_status: 'scheduled', callback_kind: 'video', designer: 'Arjun', created: 1500,
  summary: 'Karan runs Brightline Studio and is fitting out a 3000 sq ft office in Mumbai. Open workspace, two cabins, cafeteria. Budget about 45 lakh. Video call booked ' + dayName(2) + ' 3 pm.',
  chat: [
    ['c', 'We are a design studio shifting to a new 3000 sq ft office in Mumbai. Need fit-out partner', 1500],
    ['a', "Hi Karan, I'm Aria from Aperture Interiors. Office fit-outs are a speciality for us. What do you need inside: open desks, cabins, meeting rooms?", 1499],
    ['c', 'Open workspace, 2 cabins, cafeteria. Budget 45 lakh, move in 2 months', 1490],
    ['a', "Great, that's a clear brief. Would a video call with our principal commercial designer work?", 1489],
    ['c', `${dayName(2)} 3 pm video call works`, 1480],
    ['a', `Booked: Arjun Nair, ${dayName(2)} at 3:00 PM on video. Anything to share beforehand, like a floor plan?`, 1479],
  ],
});

lead({
  name: 'Neha Patil', email: 'neha.patil@example.com', campaign: 'Renovation Offer',
  project_type: 'Renovation', scope: 'Bathroom and balcony renovation', property: '2BHK apartment, 1100 sq ft', city: 'Koregaon Park, Pune',
  budget_amount: lakh(9), budget_text: '9 lakh', timeline_months: 1, timeline_text: 'next month', style: 'Clean and bright',
  callback_text: 'sometime next week, evenings', callback_status: 'requested', callback_kind: 'call', contact_pref: 'Evening', designer: 'Meera', created: 330, qualified_at: ago(300),
  summary: 'Neha wants her bathrooms and balcony renovated next month, around 9 lakh. She would like a call next week in the evenings but has not agreed an exact time or shared a phone number.',
  chat: [
    ['c', 'Need to renovate 2 bathrooms and balcony', 330],
    ['a', "Hi Neha, I'm Aria from Aperture Interiors. Which area of Pune, and roughly what budget?", 329],
    ['c', 'Koregaon Park. About 9 lakh', 326],
    ['a', 'Perfect. When would you like to start?', 325],
    ['c', 'Next month. Call me sometime next week evenings maybe', 321],
    ['a', 'Sure! Which evening works, and what number should Meera call?', 320],
  ],
});

lead({
  name: 'Aditya Rao', channel: 'telegram', tg_username: 'aditya_rao', source: 'Telegram', campaign: 'Diwali Home Makeover',
  project_type: 'Modular kitchen', scope: 'Kitchen and wardrobes', property: '2BHK flat', city: 'Pune',
  budget_amount: lakh(7), budget_text: '7 lakh', timeline_months: 2, timeline_text: 'in about 2 months', created: 260, qualified_at: ago(190),
  summary: 'Aditya (on Telegram) wants a kitchen and wardrobes for his 2BHK in Pune, around 7 lakh, in two months. No phone number or call time yet.',
  chat: [
    ['c', 'hi, kitchen and wardrobes for 2BHK, pune', 260],
    ['a', "Hi Aditya, I'm Aria, a virtual design consultant at Aperture Interiors. What budget are you thinking?", 259],
    ['c', '7 lakh, in a couple of months', 255],
    ['a', 'That works. Can I get a phone number so a designer can call and plan it with you?', 254],
  ],
});

lead({
  name: 'Siddharth Nair', phone: '+91 98230 77123', email: 'sid.nair@example.com', campaign: 'Modular Kitchen Month',
  project_type: 'Modular kitchen', scope: 'Kitchen, wardrobes and TV unit', property: '3BHK apartment, 1600 sq ft', city: 'Hinjewadi, Pune',
  budget_amount: lakh(11), budget_text: '11 lakh', timeline_months: 1, timeline_text: 'next month', contact_pref: 'Morning',
  callback_at: at(1, 10, 0), callback_text: 'tomorrow 10 am', callback_status: 'scheduled', callback_kind: 'call', designer: 'Priya', created: 2100,
  meta: { fu: { manual_needed_at: ago(110), manual_reason: "Their Instagram 24-hour messaging window has closed, so the assistant can no longer message them. Call or message them about the booked call." } },
  events: [['manual_followup_needed', { reason: 'Instagram 24-hour window closed before the reminder' }, 110]],
  summary: 'Siddharth wants a kitchen, wardrobes and TV unit in Hinjewadi, about 11 lakh, starting next month. Call booked tomorrow 10 am, but his Instagram window closed so a person has to confirm.',
  chat: [
    ['c', 'Interested in kitchen + wardrobes, Hinjewadi', 2100],
    ['a', "Hi Siddharth, I'm Aria from Aperture Interiors. What budget range, and when would you like to start?", 2099],
    ['c', '11 lakh, next month', 2095],
    ['a', "Wonderful. Priya Sharma can call you. What time works?", 2094],
    ['c', 'Tomorrow 10 am', 1880],
    ['a', 'Booked for tomorrow at 10:00 AM. Which number?', 1879],
  ],
});

lead({
  name: 'Farhan Ali', phone: '+91 98340 44881', source: 'Referral', campaign: 'Past client referral',
  project_type: 'Full home', scope: 'Full home interiors', property: '3BHK apartment', city: 'Pune',
  stage: 'active', reason: 'Moved manually: referred by a past client, skip qualification', stage_locked: 1, score: 70,
  callback_at: at(1, 12, 0), callback_text: `${dayName(1)} noon`, callback_status: 'scheduled', callback_kind: 'visit', designer: 'Priya', created: 900,
  summary: 'Referred by a past client. Budget not discussed yet, so the owner moved him to Active by hand. Site visit booked ' + dayName(1) + ' noon.',
  chat: [
    ['c', 'Hi, Mrs Kapoor referred me, she said you did her home', 900],
    ['a', "Hi Farhan, lovely to hear that! I'm Aria from Aperture Interiors. Tell me a little about your space.", 899],
    ['c', '3BHK in Pune, want full interiors. Can someone visit the site?', 895],
    ['h', 'Hi Farhan, this is Priya from the design team. Happy to visit. Does ' + dayName(1) + ' at noon work?', 880],
    ['c', `Perfect, ${dayName(1)} noon`, 872],
  ],
});

lead({
  name: 'Harsh Vora', phone: '+91 98500 66210', email: 'harsh.vora@example.com', campaign: 'Villa Series',
  project_type: 'Full home', scope: 'Full home interiors', property: '3BHK apartment, 1500 sq ft', city: 'Aundh, Pune',
  budget_amount: lakh(16), budget_text: '16 lakh', timeline_months: 2, timeline_text: 'in 2 months', style: 'Contemporary',
  callback_at: harshAt, callback_text: `today ${clock(harshAt)}`, callback_status: 'done', callback_kind: 'call', designer: 'Priya', created: 1700,
  notes: 'Site visit booked for Saturday 10 am, quote to follow after measurements.',
  meta: { fu: { done_at: ago(150), human_done_at: ago(150), manual_done_at: ago(150) } },
  summary: 'Harsh wants contemporary full-home interiors in Aundh, about 16 lakh. The call is done, site visit booked for Saturday and a quote will follow.',
  chat: [
    ['c', 'Need interiors for a 3BHK in Aundh', 1700],
    ['a', "Hi Harsh, I'm Aria from Aperture Interiors. Budget and timeline?", 1699],
    ['c', '16 lakh, starting in 2 months', 1695],
    ['a', 'Great. Priya can call you. When?', 1694],
    ['c', 'Today works', 1690],
    ['a', `Booked for today at ${clock2(harshAt)}. Which number?`, 1689],
    ['c', '98500 66210', 1688],
  ],
});

/* ====================== NEEDS A PERSON ====================== */
lead({
  name: 'Priyanka Sethi', email: 'priyanka.sethi@example.com', campaign: 'Diwali Home Makeover',
  project_type: 'Full home', city: 'Pune', budget_amount: lakh(12), budget_text: '12 lakh',
  meta: { flags: { wants_human: true } }, ai_paused: 1, created: 75,
  summary: 'Priyanka is interested in full-home interiors in Pune (about 12 lakh) but has specific questions about contracts and payment schedules and asked for a person.',
  chat: [
    ['c', 'Hi, thinking about full home interiors in Pune, around 12 lakh', 75],
    ['a', "Hi Priyanka, I'm Aria from Aperture Interiors. Lovely, when are you hoping to start?", 74],
    ['c', 'Before that, can I speak to someone? I have a few specific questions about the contract and payment schedule', 22],
  ],
});

lead({
  name: 'Rohan Iyer', phone: '+91 98220 90909', email: 'rohan.iyer@example.com', campaign: 'Villa Series',
  project_type: 'Full home', property: '4BHK duplex, 2800 sq ft', city: 'Pune', budget_amount: lakh(18), budget_text: '18 lakh', timeline_months: 2, timeline_text: 'in 2 months',
  ai_paused: 1, designer: 'Priya', created: 700,
  summary: 'Rohan is planning a 4BHK duplex (about 18 lakh). The team took over the chat. He has just replied asking whether the 3D design is included.',
  events: [['ai_paused', { by: 'admin' }, 180], ['message_while_paused', {}, 12]],
  chat: [
    ['c', 'Hi, 4BHK duplex, full interiors, budget 18 lakh, start in 2 months', 700],
    ['a', "Hi Rohan, I'm Aria from Aperture Interiors. That's a great project. Let me bring in a designer for you.", 699],
    ['h', 'Hi Rohan, Priya here from the design team. Happy to take it from here. Could you share the floor plan?', 190],
    ['c', 'Sure, sending it tomorrow', 185],
    ['c', 'Also is the 3D design included in the quote?', 12],
  ],
});

/* ============== IN CONVERSATION / NEW / TROUBLE ============== */
lead({
  name: 'Meghna Kapoor', campaign: 'Renovation Offer', project_type: 'Renovation', city: 'Pune', created: 50,
  meta: { fu: { ai_failed_at: ago(18) } },
  events: [['llm_error', { step: 'reply', error: 'Assistant service timed out' }, 18]],
  summary: 'Meghna wants a renovation in Pune. Her last message could not be answered because the AI service had a problem.',
  chat: [
    ['c', 'Hello, want to renovate my flat in Pune', 50],
    ['a', "Hi Meghna, I'm Aria from Aperture Interiors. Which part of the home are you renovating?", 49],
    ['c', 'Kitchen mostly, and the living room flooring. What would it cost approximately?', 18],
  ],
});

lead({
  name: 'Kunal Shah', campaign: 'Diwali Home Makeover', project_type: 'Modular kitchen', city: 'Kothrud, Pune', created: 12,
  summary: 'Kunal wants a modular kitchen in Kothrud. Budget and timeline still to find out.',
  chat: [
    ['c', 'Hi, modular kitchen in Kothrud, how does it work?', 12],
    ['a', "Hi Kunal, I'm Aria from Aperture Interiors. We design, build and install the whole kitchen. Do you have a budget in mind?", 11],
    ['c', 'Not sure yet, maybe around 5-6 lakh?', 6],
    ['a', 'That is a good range for a full modular kitchen. When would you like it ready?', 3],
  ],
});

lead({
  name: 'Ishita Verma', phone: '+91 98600 12345', email: 'ishita.verma@example.com', source: 'Google Form', campaign: 'Diwali Home Makeover',
  project_type: 'Full home', city: 'Viman Nagar, Pune', budget_amount: lakh(15), budget_text: '10 to 20 lakh', timeline_months: 1, timeline_text: 'within a month', property: '3BHK apartment',
  chat_id: null, created: 8, contact_pref: 'Afternoon', stage: 'new', reason: 'Waiting for them to open the chat',
  meta: { form: { name: 'Ishita Verma', phone: '+91 98600 12345', scope: ['Full home interiors'], property_type: 'Apartment', size: '3 BHK', city: 'Pune', locality: 'Viman Nagar', budget: '₹10 to 20 lakh', timeline: 'Within a month' } },
  summary: '',
  chat: [],
});

/* =========================== NURTURE =========================== */
lead({
  name: 'Tanvi Gokhale', phone: '+91 98760 31313', email: 'tanvi.g@example.com', campaign: 'Renovation Offer',
  project_type: 'Full home', scope: 'Full home interiors', property: '3BHK under construction', city: 'Pune', budget_amount: lakh(8), budget_text: '8 lakh',
  timeline_months: 8, timeline_text: 'around June, after the flat is ready', style: 'Scandinavian', created: 2800,
  meta: { drips_sent: 1 }, events: [['drip_sent', { n: 1 }, 600]],
  summary: 'Tanvi is a good fit on budget (8 lakh) but her flat will only be ready around June, so she is being nurtured with occasional check-ins.',
  chat: [
    ['c', 'Interested in full interiors, flat will be ready by June', 2800],
    ['a', "Hi Tanvi, I'm Aria from Aperture Interiors. Congratulations! Budget range?", 2799],
    ['c', 'About 8 lakh. Scandinavian style', 2795],
    ['a', "Lovely taste. Since you'll get possession around June, I'll check in with you closer to the time. Anything else I can answer now?", 2794],
    ['a', 'Hi Tanvi, just checking in. Planning is easier a few months before possession. Want a free design consultation when you are ready?', 600],
  ],
});

lead({
  name: 'Manish Agarwal', campaign: 'Modular Kitchen Month', project_type: 'Modular kitchen', city: 'Pune', created: 3000,
  meta: { flags: { stalled: true }, followups_sent: 2 }, events: [['followup_sent', { n: 1 }, 2900], ['followup_sent', { n: 2 }, 1500]],
  summary: 'Manish asked about a modular kitchen in Pune but went quiet before sharing a budget or timeline. Two follow-ups sent, now parked.',
  chat: [
    ['c', 'modular kitchen price?', 3000],
    ['a', "Hi Manish, I'm Aria from Aperture Interiors. Pricing depends on size and finish. Which city, and what budget range are you thinking?", 2999],
    ['c', 'Pune', 2990],
    ['a', 'Great, and roughly what budget did you have in mind?', 2989],
    ['a', 'Hi Manish, just checking if you still want a modular kitchen quote?', 2900],
    ['a', "No pressure at all. If you'd like a free consultation, just reply here anytime.", 1500],
  ],
});

/* ======================== NOT A FIT ======================== */
lead({
  name: 'Pooja Menon', campaign: 'Diwali Home Makeover', project_type: 'Full home', property: '2BHK apartment', city: 'Pune',
  budget_amount: lakh(1.8), budget_text: '1.8 lakh', timeline_months: 1, timeline_text: 'this month', created: 1200,
  summary: 'Pooja wants a full-home makeover but her budget of 1.8 lakh is well below the 5 lakh minimum, so she was politely declined.',
  chat: [
    ['c', 'Need full home interior for my 2BHK, budget 1.8 lakh', 1200],
    ['a', "Hi Pooja, I'm Aria from Aperture Interiors. Thank you for sharing. A full-home project with us starts above our minimum, so I don't want to waste your time. We'd be glad to help with a smaller scope, like a single room.", 1199],
    ['c', 'Okay, will think about it', 1190],
  ],
});

lead({
  name: 'Imran Sheikh', campaign: 'Renovation Offer', city: 'Pune', project_type: 'Other', opted_out: 1,
  meta: { flags: { not_interested: true, opted_out: true } }, created: 1900,
  events: [['opted_out', {}, 1890]],
  summary: 'Imran asked to stop receiving messages, so the assistant will never message him again.',
  chat: [
    ['c', 'what do you do?', 1900],
    ['a', "Hi Imran, I'm Aria from Aperture Interiors. We design and build homes and offices. What are you looking for?", 1899],
    ['c', 'not interested, stop messaging me', 1892],
    ['a', "Understood, I won't message you again. Thanks for your time!", 1891],
  ],
});

console.log(`Seeded ${n} sample leads.`);
const byStage = store.all('SELECT stage, COUNT(*) c FROM leads GROUP BY stage ORDER BY c DESC');
console.log(byStage.map((r) => `${r.stage}: ${r.c}`).join(', '));
store.close();
