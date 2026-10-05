import React from 'react';
import { INTER } from './lib.js';
import { CHAT } from './timeline.js';

/* The product's own design language (flat, hairline, one accent), re-tinted in Glad U Came mint. Native size 1280 x 720. */
const RAW = `
.crm { --bg:#fff; --side:#fafbfb; --surface:#fff; --ink:#14161a; --muted:#667078; --faint:#97a1a8; --line:#e8ecee; --line-strong:#d8dfe2; --soft:#f4f7f7; --hover:#f1f5f5;
  --brand:#0f9d77; --brand-soft:#e0f5ee; --brand-deep:#0b7a5c;
  --new:#8a929a; --new-bg:#f0f2f3; --talk:#2f6feb; --talk-bg:#e9f0fe; --active:#12875a; --active-bg:#e3f5ec; --nurture:#b97308; --nurture-bg:#fdf0d8; --nofit:#d92d57; --nofit-bg:#fdeaee; --human:#7d4fd6; --human-bg:#f0eafc; --urgent:#d93f45; --urgent-bg:#fdeded;
  font-family:${INTER}; font-size:14px; line-height:1.5; color:var(--ink); background:var(--bg); display:flex; width:1280px; height:720px; position:relative; overflow:hidden; -webkit-font-smoothing:antialiased; }
.crm * { box-sizing:border-box; }
.crm svg.i { width:16px; height:16px; stroke:currentColor; fill:none; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; }
.crm svg.i.sm { width:14px; height:14px; }
.crm h1 { font-size:22px; line-height:1.25; margin:0; letter-spacing:-.02em; font-weight:650; }
.crm h3 { font-size:14px; margin:0; font-weight:650; }
.crm .mute { color:var(--muted); }
.crm .btn { display:inline-flex; align-items:center; gap:7px; border:1px solid var(--line-strong); background:var(--surface); padding:6px 12px; border-radius:8px; font-weight:550; font-size:13px; color:var(--ink); white-space:nowrap; }
.crm .btn.primary { background:var(--ink); border-color:var(--ink); color:#fff; }
.crm .btn.sm { padding:4px 10px; font-size:12.5px; }
.crm .pill { align-self:center; display:inline-flex; align-items:center; gap:6px; padding:2px 9px; border-radius:6px; font-size:12px; font-weight:600; line-height:1.5; white-space:nowrap; }
.crm .pill.qualifying { background:var(--talk-bg); color:var(--talk); } .crm .pill.active { background:var(--active-bg); color:var(--active); }
.crm .pill.nurture { background:var(--nurture-bg); color:var(--nurture); } .crm .pill.disqualified { background:var(--nofit-bg); color:var(--nofit); }
.crm .pill.human { background:var(--human-bg); color:var(--human); } .crm .pill.urgent { background:var(--urgent-bg); color:var(--urgent); }
.crm .pill.soon { background:var(--nurture-bg); color:var(--nurture); } .crm .pill.plain { background:var(--soft); color:var(--muted); } .crm .pill.brand { background:var(--brand-soft); color:var(--brand-deep); }
.crm .dot { width:8px; height:8px; border-radius:50%; background:var(--faint); display:inline-block; flex-shrink:0; }
.crm .avatar { width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-weight:650; font-size:12px; flex-shrink:0; background:var(--brand-soft); color:var(--brand-deep); }
.crm .avatar.lg { width:46px; height:46px; font-size:16px; }
.crm aside { width:224px; background:var(--side); border-right:1px solid var(--line); padding:18px 12px; display:flex; flex-direction:column; flex-shrink:0; height:720px; }
.crm .brand { display:flex; align-items:center; gap:10px; padding:2px 8px 20px; }
.crm .brand .mark { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#34d399,#0f9d77); color:#fff; display:grid; place-items:center; font-weight:750; font-size:14px; }
.crm .brand b { display:block; font-size:14px; letter-spacing:-.01em; line-height:1.2; }
.crm .brand small { color:var(--muted); font-size:12px; }
.crm nav .nv { display:flex; align-items:center; gap:10px; width:100%; padding:7px 10px; margin-bottom:2px; border-radius:8px; font-weight:550; font-size:13.5px; color:var(--muted); }
.crm nav .nv.on { background:var(--hover); color:var(--ink); } .crm nav .nv.on svg { color:var(--brand); }
.crm nav .badge { margin-left:auto; background:var(--urgent); color:#fff; font-size:11px; font-weight:700; min-width:20px; height:20px; border-radius:10px; display:grid; place-items:center; padding:0 6px; }
.crm .side-foot { margin-top:auto; padding:12px 8px 0; font-size:12.5px; color:var(--muted); line-height:2; border-top:1px solid var(--line); }
.crm main { flex:1; min-width:0; height:720px; overflow:hidden; position:relative; }
.crm .page { padding:30px 36px 0; }
.crm .page-head { display:flex; align-items:flex-end; gap:10px; margin-bottom:20px; }
.crm .page-head p { margin:4px 0 0; color:var(--muted); }
.crm .toolbar { display:flex; gap:10px; align-items:center; margin-bottom:20px; }
.crm .chips { display:flex; gap:4px; }
.crm .chip { border:1px solid transparent; border-radius:8px; padding:4px 11px; font-weight:550; font-size:13px; color:var(--muted); }
.crm .chip.on { background:var(--hover); color:var(--ink); border-color:var(--line-strong); }
.crm .search { position:relative; width:230px; }
.crm .search .box { border:1px solid var(--line-strong); border-radius:8px; padding:6px 11px 6px 34px; color:var(--faint); font-size:13.5px; background:#fff; }
.crm .search svg { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--faint); }
.crm .board { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:0 20px; align-items:start; }
.crm .col { min-width:0; }
.crm .col-head { display:flex; align-items:center; gap:8px; padding:0 2px 10px; border-bottom:1px solid var(--line); margin-bottom:12px; }
.crm .col-head b { font-size:13.5px; font-weight:650; }
.crm .count { color:var(--faint); font-size:12.5px; font-weight:600; margin-left:auto; }
.crm .lead { position:relative; background:var(--surface); border:1px solid var(--line); border-radius:10px; padding:12px 13px; margin-bottom:10px; }
.crm .lead .top { display:flex; align-items:center; gap:8px; }
.crm .lead .nm { font-weight:650; font-size:14px; line-height:1.3; letter-spacing:-.005em; }
.crm .lead .sub { color:var(--muted); font-size:12.5px; margin-top:1px; }
.crm .lead .brief { margin-top:7px; font-size:12.5px; line-height:1.5; color:var(--muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.crm .lead .metas { display:flex; flex-wrap:wrap; gap:3px 12px; margin-top:9px; font-size:12.5px; color:var(--muted); }
.crm .lead .metas .m { display:inline-flex; align-items:center; gap:5px; }
.crm .lead .metas .m.good { color:var(--active); font-weight:600; } .crm .lead .metas .m.bad { color:var(--urgent); font-weight:600; } .crm .lead .metas .m.faint { color:var(--faint); }
.crm .lead .nextline { margin-top:9px; padding-top:8px; border-top:1px solid var(--line); font-size:12.5px; line-height:1.45; display:flex; gap:7px; align-items:flex-start; color:var(--muted); }
.crm .lead .nextline.urgent { color:var(--urgent); font-weight:600; } .crm .lead .nextline.soon { color:var(--nurture); font-weight:600; } .crm .lead .nextline.ok { color:var(--active); font-weight:600; }
.crm .lead .nextline svg { margin-top:2px; }
.crm .reddot { width:7px; height:7px; border-radius:50%; background:var(--urgent); flex-shrink:0; margin-left:auto; }
.crm .tiles { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid var(--line); border-radius:12px; background:var(--surface); margin-bottom:26px; }
.crm .tile { padding:16px 20px; border-right:1px solid var(--line); } .crm .tile:last-child { border-right:0; }
.crm .tile .n { font-size:28px; font-weight:650; letter-spacing:-.03em; line-height:1.1; } .crm .tile .l { color:var(--muted); font-weight:500; font-size:13px; margin-top:4px; }
.crm .tile.alert .n { color:var(--urgent); } .crm .tile .d { font-size:12px; color:var(--active); font-weight:600; margin-top:2px; }
.crm .two { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); gap:36px; align-items:start; }
.crm .section-title { display:flex; align-items:center; gap:8px; margin:0 0 6px; }
.crm .item { display:flex; align-items:center; gap:14px; padding:11px 8px; border-bottom:1px solid var(--line); margin:0 -8px; border-radius:8px; }
.crm .item .t { font-weight:600; } .crm .item .s { color:var(--muted); font-size:13px; }
.crm .item.urgent .t::before, .crm .item.soon .t::before { content:""; display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:9px; vertical-align:middle; }
.crm .item.urgent .t::before { background:var(--urgent); } .crm .item.soon .t::before { background:var(--nurture); }
.crm .funnel .bar { display:flex; align-items:center; gap:10px; margin:10px 0; font-size:13.5px; }
.crm .funnel .bar span.name { width:104px; color:var(--muted); } .crm .funnel .bar .track { flex:1; height:6px; background:var(--soft); border-radius:99px; overflow:hidden; } .crm .funnel .bar .fill { height:100%; border-radius:99px; } .crm .funnel .bar b { width:26px; text-align:right; font-weight:600; }
.crm .timeline .ev { display:flex; gap:12px; padding:7px 0; font-size:13.5px; } .crm .timeline .ev .dot { margin-top:7px; }
.crm .daygroup { margin-bottom:22px; } .crm .daygroup h3 { margin-bottom:6px; display:flex; gap:8px; align-items:center; }
.crm .callrow { display:grid; grid-template-columns:100px minmax(0,1fr) auto; gap:16px; align-items:center; padding:12px 8px; border-bottom:1px solid var(--line); margin:0 -8px; border-radius:8px; }
.crm .callrow .time { font-weight:650; font-size:15px; letter-spacing:-.01em; } .crm .callrow .time small { display:block; font-weight:500; color:var(--muted); font-size:12px; }
.crm .card { background:var(--surface); border:1px solid var(--line); border-radius:12px; padding:20px; }
.crm .set-grid { display:grid; grid-template-columns:180px minmax(0,1fr); gap:36px; align-items:start; }
.crm .subnav .sb { display:block; padding:7px 11px; border-radius:8px; font-weight:550; font-size:13.5px; color:var(--muted); margin-bottom:2px; } .crm .subnav .sb.on { background:var(--hover); color:var(--ink); }
.crm .bigmoney { font-size:40px; font-weight:650; letter-spacing:-.03em; line-height:1.1; }
.crm .stackbar { display:flex; height:24px; border-radius:7px; overflow:hidden; background:var(--soft); } .crm .stackbar div { display:grid; place-items:center; color:#fff; font-size:12px; font-weight:700; min-width:0; }
.crm .tog { display:flex; align-items:center; gap:12px; font-weight:500; padding:9px 0; }
.crm .sw { width:34px; height:20px; border-radius:11px; background:var(--brand); position:relative; flex-shrink:0; } .crm .sw::after { content:""; position:absolute; right:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#fff; }
.crm .scrim { position:absolute; inset:0; background:rgba(5,9,9,.72); z-index:30; }
.crm .drawer { position:absolute; top:0; right:0; bottom:0; width:720px; background:var(--bg); border-left:1px solid var(--line-strong); z-index:31; display:flex; flex-direction:column; box-shadow:0 24px 70px rgba(20,20,30,.28); }
.crm .d-head { padding:16px 24px 14px; border-bottom:1px solid var(--line); }
.crm .d-body { flex:1; overflow:hidden; position:relative; }
.crm .d-inner { padding:18px 24px 80px; }
.crm .next { border-radius:10px; padding:12px 14px; margin-bottom:10px; display:flex; gap:11px; align-items:flex-start; font-size:13.5px; }
.crm .next.ok { background:var(--active-bg); } .crm .next b { display:block; color:var(--ink); }
.crm .glance { background:var(--soft); border-radius:10px; padding:12px 14px; line-height:1.55; font-size:13.5px; }
.crm .quick-head { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin:22px 0 10px; }
.crm .said { margin-top:10px; padding:2px 0 2px 12px; border-left:2px solid var(--line-strong); font-size:13.5px; }
.crm .facts { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
.crm .fld { margin-bottom:11px; } .crm .fld label { display:block; font-size:12.5px; font-weight:600; color:var(--muted); margin:0 0 5px; }
.crm .fld .in { border:1px solid var(--line-strong); border-radius:8px; padding:7px 11px; font-size:13.5px; min-height:35px; background:#fff; }
.crm .sec { margin-top:26px; } .crm .sec > h3 { margin-bottom:10px; display:flex; align-items:center; gap:8px; }
.crm .callcard { border:1px solid var(--line); border-radius:10px; padding:14px 16px; display:flex; align-items:center; gap:14px; }
.crm .chat { background:var(--soft); border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:8px; }
.crm .msg { max-width:80%; padding:8px 12px; border-radius:14px; font-size:13.5px; line-height:1.45; }
.crm .msg.in { align-self:flex-start; background:var(--surface); border:1px solid var(--line); border-bottom-left-radius:4px; }
.crm .msg.bot { align-self:flex-end; background:var(--ink); color:#fff; border-bottom-right-radius:4px; }
.crm .toast { position:absolute; left:50%; bottom:26px; transform:translateX(-50%); background:var(--ink); color:#fff; padding:11px 18px; border-radius:11px; z-index:60; font-weight:550; font-size:13.5px; display:flex; align-items:center; gap:10px; box-shadow:0 14px 40px rgba(0,0,0,.3); white-space:nowrap; }
`;
const CSS = RAW.replace(/(^|\})\s*([^{}]+)\{/g, (m, a, sel) => `${a}\n${sel.trim()}{`);

export const CrmStyle = () => <style>{CSS}</style>;

/* icons */
const P = {
  today: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  leads: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
  calls: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.2A8 8 0 1 1 21 12z"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
export const Ic = ({ n, cls = '' }) => <svg className={`i ${cls}`} viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: P[n] || '' }} />;

/* data (all fictional) */
export const LEADS = {
  riya: { name: 'Riya Mehta', brand: 'Mira Skin', ch: 'Instagram', brief: 'Founder of a D2C skincare brand launching a new serum. Wants launch PR and creator seeding in three metros.', budget: '₹5 to 8 L', bk: 'good', time: 'Within a month', who: 'Ananya', next: { k: 'ok', i: 'cal', t: 'Call tomorrow, 5:00 PM' } },
  kabir: { name: 'Kabir Shah', brand: 'Urban Weave', ch: 'Instagram', brief: 'Menswear label planning celebrity gifting and a launch event for the winter drop.', budget: '₹8 to 12 L', bk: 'good', time: 'Next month', who: 'Ananya', next: { k: 'soon', i: 'clock', t: 'Call today, 4:30 PM' } },
  sneha: { name: 'Sneha Iyer', brand: 'Oro Jewels', ch: 'Instagram', brief: 'Festive jewellery campaign with around 30 creators across fashion and lifestyle.', budget: '₹10 L', bk: 'good', time: 'In 3 weeks', who: 'Dev', next: { k: 'ok', i: 'cal', t: 'Call Friday, 11:00 AM' } },
  isha: { name: 'Isha Nair', brand: 'Kind Earth', ch: 'Instagram', brief: 'Asking about a Diwali launch for a home care range. Still sharing budget details.', budget: 'Not shared yet', bk: 'faint', time: 'Diwali', who: '', next: { k: '', i: 'chat', t: 'Aria is chatting with her now' } },
  dev: { name: 'Dev Malhotra', brand: 'FitFuel', ch: 'Instagram', brief: 'New enquiry from a Meta ad. First reply sent a few seconds ago.', budget: 'Not shared yet', bk: 'faint', time: '', who: '', next: { k: '', i: 'clock', t: 'Waiting for their reply' } },
  tanvi: { name: 'Tanvi Joshi', brand: 'Brew & Co', ch: 'Instagram', brief: 'Good fit, but would like to start only in four months.', budget: '₹4 L', bk: 'good', time: 'In 4 months', who: '', next: { k: '', i: 'clock', t: 'Friendly check-in in 3 weeks' } },
  arjun: { name: 'Arjun Rao', brand: 'Loom Home', ch: 'Instagram', brief: 'Exploring options for a 2027 launch of a furniture label.', budget: '₹3.5 L', bk: 'good', time: 'Next year', who: '', next: { k: '', i: 'clock', t: 'Check-in on 12 Nov' } },
  rohit: { name: 'Rohit Verma', brand: 'Sharma Salon', ch: 'Instagram', brief: 'Local salon looking for five promotional posts.', budget: '₹40k', bk: 'bad', time: 'This week', who: '', next: { k: '', i: 'check', t: 'Politely declined. Below your ₹3 L minimum.' } },
  mehul: { name: 'Mehul Shah', brand: 'College fest', ch: 'Instagram', brief: 'Asking for free collaborations in return for exposure.', budget: '₹0', bk: 'bad', time: '', who: '', next: { k: '', i: 'check', t: 'Politely declined. Outside your services.' } },
};

export const Sidebar = ({ view, navHot }) => (
  <aside>
    <div className="brand"><div className="mark">G</div><div><b>Lead Desk</b><small>Glad U Came</small></div></div>
    <nav>
      {[['today', 'Today', 'Today', 3], ['leads', 'Leads', 'Leads'], ['calls', 'Calls', 'Calls'], ['settings', 'Rules', 'Settings']].map(([k, ico, label, badge]) => (
        <div key={k} className={`nv ${view === k ? 'on' : ''}`} style={navHot === k ? { background: 'var(--hover)' } : undefined}>
          <Ic n={k === 'settings' ? 'gear' : ico.toLowerCase() === 'rules' ? 'gear' : k} />
          {label === 'Settings' ? 'Rules' : label}
          {badge ? <span className="badge">{badge}</span> : null}
        </div>
      ))}
    </nav>
    <div className="side-foot">
      <div><span className="dot" style={{ background: '#12875a', marginRight: 8 }} />Instagram connected</div>
      <div><span className="dot" style={{ background: '#12875a', marginRight: 8 }} />Assistant on</div>
    </div>
  </aside>
);

export const LeadCard = ({ l }) => (
  <div className="lead">
    <div className="top"><span className="nm">{l.name}</span></div>
    <div className="sub">{l.brand} · {l.ch}</div>
    <div className="brief">{l.brief}</div>
    <div className="metas">
      <span className={`m ${l.bk}`}>{l.budget}</span>
      {l.time ? <span className="m">{l.time}</span> : null}
      {l.who ? <span className="m"><Ic n="user" cls="sm" />{l.who}</span> : null}
    </div>
    <div className={`nextline ${l.next.k}`}><Ic n={l.next.i} cls="sm" />{l.next.t}</div>
  </div>
);

const Col = ({ color, title, count, children }) => (
  <div className="col">
    <div className="col-head"><span className="dot" style={{ background: color }} /><b>{title}</b><span className="count">{count}</span></div>
    {children}
  </div>
);

export const CARD_H = 203;
// arrive: 0..1 how much of the new card has dropped in. glow: 0..1 highlight pulse.
export const LeadsView = ({ arrive = 1, glow = 0, riyaHot = false }) => {
  const L = LEADS;
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Leads</h1><p>Everyone who enquired, sorted by what to do next.</p></div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}><span className="btn">Export</span><span className="btn primary">New lead</span></div>
      </div>
      <div className="toolbar">
        <div className="chips"><span className="chip on">All channels</span><span className="chip">Instagram</span><span className="chip">Telegram</span></div>
        <div className="search"><Ic n="search" /><div className="box">Search name or brand</div></div>
        <div className="chips" style={{ marginLeft: 'auto' }}><span className="chip on">Board</span><span className="chip">List</span></div>
      </div>
      <div className="board">
        <Col color="#2f6feb" title="In conversation" count={2}><LeadCard l={L.isha} /><LeadCard l={L.dev} /></Col>
        <Col color="#12875a" title="Active" count={2 + (arrive > 0.5 ? 1 : 0)}>
          <div style={{ height: arrive * CARD_H, overflow: 'visible', position: 'relative' }}>
            <div style={{ opacity: Math.min(1, arrive * 1.6), transform: `translateY(${(1 - arrive) * -24}px)`, boxShadow: glow ? `0 0 0 ${2 + glow * 3}px rgba(15,157,119,${0.55 * glow}), 0 10px 40px rgba(15,157,119,${0.35 * glow})` : 'none', borderRadius: 10, position: 'relative', background: '#fff' }}>
              <LeadCard l={L.riya} />
            </div>
          </div>
          <LeadCard l={L.kabir} /><LeadCard l={L.sneha} />
        </Col>
        <Col color="#b97308" title="Nurture" count={2}><LeadCard l={L.tanvi} /><LeadCard l={L.arjun} /></Col>
        <Col color="#d92d57" title="Not a fit" count={2}><LeadCard l={L.rohit} /><LeadCard l={L.mehul} /></Col>
      </div>
    </div>
  );
};

export const TodayView = () => (
  <div className="page">
    <div className="page-head"><div><h1>Today</h1><p>Good morning. Here is what needs you.</p></div></div>
    <div className="tiles">
      <div className="tile"><div className="n">14</div><div className="l">New enquiries</div><div className="d">+5 vs yesterday</div></div>
      <div className="tile"><div className="n">9</div><div className="l">Qualified by Aria</div><div className="d">64% of enquiries</div></div>
      <div className="tile alert"><div className="n">3</div><div className="l">Need you now</div></div>
      <div className="tile"><div className="n">6 sec</div><div className="l">Average first reply</div><div className="d">24/7</div></div>
    </div>
    <div className="two">
      <div>
        <div className="section-title"><h3>Needs you now</h3><span className="count">3</span></div>
        <div className="item urgent"><div className="avatar">VM</div><div style={{ flex: 1 }}><div className="t">Varun Menon · Fable Footwear</div><div className="s">Asked to speak to a person</div></div><span className="pill human">Needs a person</span></div>
        <div className="item urgent"><div className="avatar">NK</div><div style={{ flex: 1 }}><div className="t">Neha Kapoor · Lumen Skin</div><div className="s">Call was due 12 minutes ago</div></div><span className="pill urgent">Overdue</span></div>
        <div className="item soon"><div className="avatar">KS</div><div style={{ flex: 1 }}><div className="t">Kabir Shah · Urban Weave</div><div className="s">Call at 4:30 PM, reminder sent</div></div><span className="pill soon">In 45 min</span></div>
      </div>
      <div>
        <div className="section-title"><h3>Pipeline</h3></div>
        <div className="funnel">
          {[['In conversation', 6, '#2f6feb', 55], ['Active', 9, '#12875a', 80], ['Nurture', 11, '#b97308', 100], ['Not a fit', 7, '#d92d57', 64]].map(([n, v, c, w]) => (
            <div className="bar" key={n}><span className="name">{n}</span><span className="track"><span className="fill" style={{ display: 'block', width: `${w}%`, background: c }} /></span><b>{v}</b></div>
          ))}
        </div>
        <div className="section-title" style={{ marginTop: 18 }}><h3>Latest</h3></div>
        <div className="timeline">
          <div className="ev"><span className="dot" style={{ background: '#12875a' }} /><div><b>Riya Mehta</b> qualified and booked<div className="mute" style={{ fontSize: 12 }}>just now</div></div></div>
          <div className="ev"><span className="dot" style={{ background: '#b97308' }} /><div>Reminder sent to <b>Kabir Shah</b><div className="mute" style={{ fontSize: 12 }}>12 min ago</div></div></div>
        </div>
      </div>
    </div>
  </div>
);

export const CallsView = ({ hot = 0 }) => (
  <div className="page">
    <div className="page-head"><div><h1>Calls</h1><p>Every call Aria has booked, with reminders sent for you.</p></div></div>
    <div className="daygroup">
      <h3>Today <span className="count" style={{ marginLeft: 0 }}>2</span></h3>
      <div className="callrow"><div className="time">4:30 PM<small>in 45 min</small></div><div><div style={{ fontWeight: 600 }}>Kabir Shah · Urban Weave</div><div className="mute" style={{ fontSize: 13 }}>Celebrity gifting and winter launch event</div></div><div style={{ display: 'flex', gap: 8 }}><span className="pill plain">Ananya</span><span className="pill brand">Reminder sent</span></div></div>
      <div className="callrow"><div className="time" style={{ color: 'var(--urgent)' }}>2:00 PM<small>12 min ago</small></div><div><div style={{ fontWeight: 600 }}>Neha Kapoor · Lumen Skin</div><div className="mute" style={{ fontSize: 13 }}>Creator seeding for a new range</div></div><div style={{ display: 'flex', gap: 8 }}><span className="pill plain">Dev</span><span className="pill urgent">Overdue</span></div></div>
    </div>
    <div className="daygroup">
      <h3>Tomorrow <span className="count" style={{ marginLeft: 0 }}>2</span></h3>
      <div className="callrow" style={{ background: hot ? `rgba(15,157,119,${0.09 * hot})` : undefined }}><div className="time">5:00 PM<small>Tomorrow</small></div><div><div style={{ fontWeight: 600 }}>Riya Mehta · Mira Skin <span className="pill active" style={{ marginLeft: 6 }}>New</span></div><div className="mute" style={{ fontSize: 13 }}>Launch PR and creator seeding, ₹5 to 8 L</div></div><div style={{ display: 'flex', gap: 8 }}><span className="pill plain">Ananya</span><span className="pill brand">Scheduled</span></div></div>
      <div className="callrow"><div className="time">11:00 AM<small>Friday</small></div><div><div style={{ fontWeight: 600 }}>Sneha Iyer · Oro Jewels</div><div className="mute" style={{ fontSize: 13 }}>Festive campaign with 30 creators</div></div><div style={{ display: 'flex', gap: 8 }}><span className="pill plain">Dev</span><span className="pill brand">Scheduled</span></div></div>
    </div>
  </div>
);

export const RulesView = ({ slide = 3 }) => {
  const left = ((slide - 1) / 9) * 100;
  const inr = slide <= 3 ? '₹3 L' : `₹${Math.round(slide * 10) / 10} L`;
  return (
    <div className="page">
      <div className="page-head"><div><h1>Your rules</h1><p>Set the bar once. The assistant applies it to every enquiry.</p></div></div>
      <div className="set-grid">
        <div className="subnav"><div className="sb on">Qualification</div><div className="sb">Follow-ups</div><div className="sb">Team</div><div className="sb">Channels</div></div>
        <div>
          <div className="card">
            <h3>Minimum monthly budget</h3>
            <div className="bigmoney" style={{ margin: '10px 0 14px' }}>{inr}</div>
            <div style={{ position: 'relative', height: 26, marginBottom: 6 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 11, height: 4, borderRadius: 2, background: 'var(--line-strong)' }} />
              <div style={{ position: 'absolute', left: 0, width: `${left}%`, top: 11, height: 4, borderRadius: 2, background: 'var(--brand)' }} />
              <div style={{ position: 'absolute', left: `calc(${left}% - 10px)`, top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '2px solid var(--brand)', boxShadow: '0 2px 6px rgba(0,0,0,.15)' }} />
            </div>
            <div className="mute" style={{ fontSize: 12.5 }}>Anyone below this is politely declined and never reaches your team.</div>
            <div style={{ marginTop: 18 }}>
              <div className="stackbar"><div style={{ width: '38%', background: '#12875a' }}>38%</div><div style={{ width: '29%', background: '#b97308' }}>29%</div><div style={{ width: '33%', background: '#d92d57' }}>33%</div></div>
              <div className="mute" style={{ fontSize: 12.5, marginTop: 8, display: 'flex', gap: 16 }}><span>Active</span><span>Nurture</span><span>Not a fit</span><span style={{ marginLeft: 'auto' }}>Last 30 days</span></div>
            </div>
          </div>
          <div className="card" style={{ marginTop: 14, padding: '10px 20px' }}>
            <div className="tog"><span className="sw" />Remind the team 60 minutes before every call</div>
            <div className="tog" style={{ borderTop: '1px solid var(--line)' }}><span className="sw" />Follow up automatically inside Instagram's 24-hour window</div>
            <div className="tog" style={{ borderTop: '1px solid var(--line)' }}><span className="sw" />Hand the chat to a person when a customer asks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- lead drawer ---------------- */
const Fld = ({ k, v }) => (<div className="fld"><label>{k}</label><div className="in">{v}</div></div>);

export const Drawer = ({ scroll = 0 }) => (
  <div className="drawer">
    <div className="d-head">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="avatar lg">RM</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 650, letterSpacing: '-0.02em' }}>Riya Mehta</div>
          <div className="mute" style={{ fontSize: 13 }}>Mira Skin · via Instagram · 2 min ago</div>
        </div>
        <span className="pill active">Active</span><span className="pill brand">Meta ad</span>
        <Ic n="x" />
      </div>
    </div>
    <div className="d-body">
      <div className="d-inner" style={{ transform: `translateY(${-scroll}px)` }}>
        <div className="next ok"><Ic n="cal" /><div><b>Call tomorrow at 5:00 PM</b>Ananya Rao will call Riya on +91 98765 43210. A reminder goes out an hour before.</div></div>
        <div className="quick-head"><h3>Quick summary</h3><span className="mute" style={{ fontSize: 12.5 }}>Written by the assistant</span></div>
        <div className="glance">
          Riya runs <b>Mira Skin</b>, a D2C skincare brand launching a new serum. She wants launch PR and influencer seeding across Mumbai, Delhi and Bangalore. Her budget of <b>₹5 to 8 lakh</b> clears your ₹3 L minimum and she would like to start within a month. She has tried about 20 micro-influencers on her own, without tracking results.
          <div className="said">“Evenings are best to reach me.”</div>
        </div>
        <div className="sec" style={{ marginTop: 24 }}>
          <h3>Details</h3>
          <div className="facts">
            <Fld k="What they want" v="Launch PR + influencer seeding" />
            <Fld k="Brand" v="Mira Skin · D2C skincare" />
            <Fld k="Target cities" v="Mumbai, Delhi, Bangalore" />
            <Fld k="Budget (INR)" v="500000 to 800000" />
            <Fld k="Wants to start" v="Within a month" />
            <Fld k="Creator history" v="~20 micro-influencers, untracked" />
            <Fld k="Phone" v="+91 98765 43210" />
            <Fld k="Best time to reach them" v="Evenings" />
          </div>
        </div>
        <div className="sec">
          <h3><Ic n="calls" />Call</h3>
          <div className="callcard">
            <div className="avatar" style={{ width: 40, height: 40 }}><Ic n="cal" /></div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 650, fontSize: 15 }}>Tomorrow · 5:00 PM IST</div><div className="mute" style={{ fontSize: 13 }}>With Ananya Rao, Brand Lead · matched on beauty and D2C</div></div>
            <span className="pill brand">Scheduled</span>
          </div>
        </div>
        <div className="sec">
          <h3><Ic n="chat" />Conversation</h3>
          <div className="chat">
            {CHAT.map((m) => (<div key={m.id} className={`msg ${m.who === 'me' ? 'in' : 'bot'}`}>{m.text}</div>))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Toast = ({ children }) => (<div className="toast"><span className="dot" style={{ background: '#34d399' }} />{children}</div>);
