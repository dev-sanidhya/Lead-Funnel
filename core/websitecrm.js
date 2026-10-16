'use strict';
// The studio's own "Lead Inbox" (the CRM page built for the website), backed by a real database.
//
// The original page kept leads in each browser's localStorage, so nothing a server learned (an
// Instagram DM, say) could ever appear in it. This module serves that same page from the funnel and
// feeds it from the funnel's database, so every lead lands in one inbox whichever door it came
// through: Instagram, Telegram, the enquiry form, or the chatbot widget on the website.
//
//   GET   /api/crm/leads          (signed in)  every real lead, in the Lead Inbox's shape
//   PATCH /api/crm/leads/:id      (signed in)  { status: new | contacted | closed }
//   POST  /api/crm/ingest         (public)     the website widget sends its lead here (create or update)

const { formatMoney, parseAmount } = require('./budget');
const { formatWhen } = require('./when');
const { briefFor } = require('./attention');
const { STAGE_LABELS } = require('./qualify');

const STATUSES = ['new', 'contacted', 'closed'];
const clip = (v, n) => String(v == null ? '' : v).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, n);
const SOURCE_LABEL = { instagram: 'Instagram DM', telegram: 'Telegram', web: 'Website chatbot' };

function sourceOf(lead) {
  if (lead.channel === 'web') return 'Website chatbot';
  if (lead.channel === 'instagram') return 'Instagram DM';
  if (lead.source === 'form' || lead.source === 'google-form') return 'Enquiry form';
  return SOURCE_LABEL[lead.channel] || 'Chat';
}

// A funnel lead in the shape the Lead Inbox page already understands.
function toCrmLead(lead, messages, settings) {
  const tz = settings.business.timezone;
  const cur = settings.qualification.currency;
  const months = lead.timeline_months;
  return {
    id: lead.id,
    name: lead.name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    contact: lead.phone || lead.email || (lead.tg_username ? `@${lead.tg_username}` : (lead.channel === 'instagram' ? 'Instagram DM' : '')),
    projectType: lead.scope || lead.project_type || '',
    bhk: lead.property || '',
    location: lead.city || '',
    budget: lead.budget_text || (lead.budget_amount != null ? formatMoney(lead.budget_amount, cur) : ''),
    timeline: lead.timeline_text || (months != null ? (months === 0 ? 'right away' : `in ${months} months`) : ''),
    summary: lead.summary || (lead.meta.web_summary || '') || briefFor(lead, settings),
    source: sourceOf(lead),
    channel: lead.channel,
    stage: STAGE_LABELS[lead.stage] || lead.stage,
    call: lead.callback_at ? formatWhen(lead.callback_at, tz) : '',
    status: STATUSES.includes(lead.meta.crm_status) ? lead.meta.crm_status : 'new',
    time: new Date(lead.created_at).toISOString(),
    transcript: messages.map((m) => ({ role: m.direction === 'in' ? 'user' : 'assistant', content: m.text })),
    summarizing: false,
  };
}

function mount({ route, send, readBody, limit, HttpError, store, settings, engine }) {
  route('GET', '/api/crm/leads', async (req, res) => {
    const s = settings.get();
    const leads = await store.listLeads({ channel: 'real', limit: 500 });
    const ids = leads.map((l) => l.id);
    const byLead = new Map();
    if (ids.length) {
      // one query for all transcripts; the page shows the most recent 80 messages of each chat
      const rows = await store.all(`SELECT lead_id, direction, text FROM messages WHERE lead_id IN (${ids.map(() => '?').join(',')}) ORDER BY id`, ...ids);
      for (const m of rows) { if (!byLead.has(m.lead_id)) byLead.set(m.lead_id, []); byLead.get(m.lead_id).push(m); }
    }
    send(res, 200, { leads: leads.map((l) => toCrmLead(l, (byLead.get(l.id) || []).slice(-80), s)) });
  });

  route('PATCH', '/api/crm/leads/:id', async (req, res, { params }) => {
    const b = await readBody(req);
    if (!STATUSES.includes(b.status)) throw new HttpError(400, 'status must be new, contacted or closed');
    const lead = await store.getLead(Number(params.id));
    if (!lead) throw new HttpError(404, 'Lead not found');
    await store.updateLead(lead.id, { meta: { ...lead.meta, crm_status: b.status } });
    await store.addEvent(lead.id, 'crm_status', { status: b.status });
    send(res, 200, { ok: true, status: b.status });
  });

  // The chatbot widget on the website posts each lead here as it forms and again when its AI summary arrives.
  route('POST', '/api/crm/ingest', { public: true }, async (req, res) => {
    limit(req, 'crm-ingest', 40);
    const b = await readBody(req);
    const key = process.env.CRM_INGEST_KEY || '';
    if (key && String(req.headers['x-site-key'] || b.siteKey || '') !== key) throw new HttpError(401, 'Bad site key');
    const webId = clip(b.id, 40);
    if (!webId) throw new HttpError(400, 'id is required');
    const name = clip(b.name, 80);
    const phone = clip(b.phone, 30);
    const email = clip(b.email, 120);
    if (!name && !phone && !email) throw new HttpError(400, 'A name, phone or email is required');

    const chatId = `web:${webId}`;
    const budgetText = clip(b.budget, 80);
    const fields = {
      name: name || null, phone: phone || null, email: email || null,
      city: clip(b.location, 80) || null, property: clip(b.bhk, 80) || null,
      project_type: clip(b.projectType, 80) || null, budget_text: budgetText || null,
      budget_amount: budgetText ? (parseAmount(budgetText, { allowBare: false }) ?? null) : null,
      timeline_text: clip(b.timeline, 80) || null,
    };
    let lead = await store.getLeadByChat(chatId);
    const summary = clip(b.summary, 700);
    const transcript = (Array.isArray(b.transcript) ? b.transcript : []).slice(-80)
      .map((m) => ({ direction: m && m.role === 'assistant' ? 'out' : 'in', role: m && m.role === 'assistant' ? 'assistant' : 'user', text: clip(m && m.content, 1500) }))
      .filter((m) => m.text);
    const turns = transcript.filter((m) => m.direction === 'in').length;

    if (!lead) {
      lead = await store.createLead({ channel: 'web', chat_id: chatId, source: 'Website Chatbot', start_token: engine.newToken(), ...fields, meta: { turns, web_id: webId, web_summary: summary || undefined } });
      await store.addEvent(lead.id, 'lead_created', { source: 'website chatbot' });
    } else {
      const patch = {};
      for (const [k, v] of Object.entries(fields)) if (v !== null && v !== lead[k]) patch[k] = v; // a later, fuller record never blanks what we already know
      await store.updateLead(lead.id, { ...patch, meta: { ...lead.meta, turns, web_summary: summary || lead.meta.web_summary } });
    }
    if (summary) await store.updateLead(lead.id, { summary });
    if (transcript.length) {
      await store.tx(async (t) => {
        await t.run('DELETE FROM messages WHERE lead_id=?', lead.id);
        for (const m of transcript) await t.addMessage({ lead_id: lead.id, direction: m.direction, role: m.role, text: m.text, status: m.direction === 'in' ? 'received' : 'sent', processed: true });
      });
    }
    await engine.reevaluateLead(lead.id);
    send(res, 200, { ok: true, id: lead.id });
  });
}

module.exports = { mount, toCrmLead, sourceOf };
