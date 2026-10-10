'use strict';
// Last line of defence between the model's draft and the customer. Prompts ask
// nicely; this enforces: no re-asking for known facts, at most one question, no
// em dashes, no leaked instructions, bounded length. An empty return means "use
// the deterministic fallback".

const DASHES = /\s*[‒–—―]\s*/g;
const LEAK = /(system prompt|my instructions|directive|mandatory|as an ai language model|<\/?json>|stage_reason|internal categor)/i;

const ASKS = {
  name: /\b(your name|may i (?:get|have|know) your name|what'?s your name|who am i (?:speaking|talking) (?:with|to))\b/i,
  contact: /\b(phone( number)?|contact (number|info)|email( address)?|whatsapp number|reach you)\b/i,
  city: /\b(which (city|area|location)|what (city|area|location)|where (is|are) (the|your) (project|property|home|site|space)|location of)\b/i,
  budget: /\b(budget|how much (are you|do you)|spend)\b/i,
  timeline: /\b(when (are|do|would) you|timeline|how soon|move[- ]in|start date)\b/i,
  project_type: /\b(what (kind|type) of (space|project)|which (space|room|type)|type of (space|project))\b/i,
};

function splitSentences(text) {
  // a full stop between two digits (6.5 lakh, 4.5 weeks) is a decimal point, not the end of a sentence
  return String(text).match(/(?:[^.!?\n]|(?<=\d)\.(?=\d))+[.!?]*(?:\s+|$)|\n+/g)?.map((s) => s.trim()).filter(Boolean) || [];
}

function isQuestion(s) { return /\?\s*$/.test(s) || /\b(please (share|tell|let me know)|could you (share|tell)|can you (share|tell))\b/i.test(s); }

function reasksKnown(sentence, lead) {
  if (!isQuestion(sentence)) return false;
  if (lead.name && ASKS.name.test(sentence)) return true;
  if ((lead.phone || lead.email) && ASKS.contact.test(sentence) && !/\b(best time|good time|call you)\b/i.test(sentence)) return true;
  if (lead.city && ASKS.city.test(sentence)) return true;
  if (lead.budget_amount != null && ASKS.budget.test(sentence)) return true;
  if (lead.timeline_months != null && ASKS.timeline.test(sentence)) return true;
  if (lead.project_type && ASKS.project_type.test(sentence)) return true;
  return false;
}

// Claims a model likes to invent: money, counts of clients/years/awards. A sentence making one is
// only kept when the same number is written in the business facts or the customer's own details.
const NUM = '(\\d[\\d,.]*)';
const CLAIMS = [
  new RegExp(`(?:₹|rs\\.?\\s?|inr\\s?|\\$|usd\\s?)${NUM}`, 'i'),
  new RegExp(`${NUM}\\s?(?:lakhs?|crores?|cr|k)\\b`, 'i'),
  new RegExp(`${NUM}\\+?\\s+(?:years?|yrs|brands?|clients?|campaigns?|awards?|creators?|influencers?|projects?|cities|countries|team members|followers|customers)`, 'i'),
];
const WORD_CLAIM = /\b(hundreds?|thousands?|dozens?|millions?)\s+of\s+(?:brands|clients|campaigns|creators|influencers|projects|customers)\b/i;
const normNum = (d) => d.replace(/[,.]+$/, '').replace(/,/g, '');
function digitsOf(text) { return new Set((String(text).match(/\d[\d,.]*/g) || []).map(normNum)); }
function ungrounded(sentence, grounding) {
  if (grounding === undefined || grounding === null) return false;
  const known = digitsOf(grounding);
  for (const rx of CLAIMS) {
    const m = sentence.match(rx);
    if (m && !known.has(normNum(m[1]))) return true;
  }
  const w = sentence.match(WORD_CLAIM);
  return !!(w && !new RegExp(w[1], 'i').test(grounding));
}

// opts.maxQuestions: 1 for qualification turns, 0 for closings. opts.grounding: the text of facts a reply may rely on.

function sanitizeReply(text, lead, { maxQuestions = 1, maxChars = 650, grounding } = {}) {
  if (!text) return '';
  let t = String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/[​-‏⁠﻿]/g, '')
    .replace(/,?\s*(?:…|\.\.\.)\s*([)\]])/g, '$1')
    .replace(DASHES, ', ')
    .replace(/\*\*|__|`/g, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s*([)\].!?])/g, '$1')
    .replace(/\(\s*,\s*/g, '(')
    .replace(/[ \t]{2,}/g, ' ');
  if (LEAK.test(t)) return '';
  const kept = [];
  let questions = 0;
  for (const s of splitSentences(t)) {
    if (reasksKnown(s, lead)) continue;
    if (ungrounded(s, grounding)) continue;
    if (isQuestion(s)) {
      if (questions >= maxQuestions) continue;
      questions++;
    }
    kept.push(s);
  }
  let out = kept.join(' ').replace(/\s+\n/g, '\n').trim();
  if (out.length > maxChars) {
    const cut = out.slice(0, maxChars);
    const last = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    out = last > 120 ? cut.slice(0, last + 1) : cut;
  }
  return out.trim();
}

module.exports = { sanitizeReply, reasksKnown, ungrounded };
