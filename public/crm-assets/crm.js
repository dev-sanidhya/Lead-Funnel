(function () {
  // Interio Arty Lead Inbox. Same page and behaviour as the website CRM, but the leads now live in the
  // studio's database (Instagram, website chatbot and enquiry form all land here) instead of one browser.
  var WHATSAPP_NUMBER = '917838653501';
  var listEl = document.getElementById('leadList');
  var toastEl = document.getElementById('toast');
  var statTotal = document.getElementById('statTotal');
  var statToday = document.getElementById('statToday');
  var statPending = document.getElementById('statPending');
  var loginEl = document.getElementById('login');
  var filter = 'all';
  var openIds = new Set();
  var leads = [];
  var seen = null; // ids already shown, so only genuinely new leads trigger the toast

  function timeAgo(iso) {
    var diff = Date.now() - new Date(iso).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.innerText = str || '';
    return d.innerHTML;
  }

  function visibleLeads() {
    if (filter === 'all') return leads;
    return leads.filter(function (l) { return (l.status || 'new') === filter; });
  }

  function specRow(lead) {
    var parts = [];
    if (lead.projectType) parts.push(lead.projectType);
    if (lead.bhk) parts.push(lead.bhk);
    if (lead.location) parts.push(lead.location);
    if (lead.budget) parts.push(lead.budget);
    if (lead.timeline) parts.push(lead.timeline);
    if (lead.call) parts.push('Call: ' + lead.call);
    if (lead.stage) parts.push(lead.stage);
    if (!parts.length) return '';
    return '<div class="detail-specs">' + parts.map(function (p) { return '<span class="dim">' + escapeHtml(p) + '</span>'; }).join('') + '</div>';
  }

  function transcriptHtml(lead) {
    return (lead.transcript || [])
      .map(function (m) {
        var body;
        if (m.image) {
          // a picture the customer sent: show it exactly as sent, with what the assistant understood from it
          var caption = String(m.content || '').replace(/^\[Photo\]\s*/, '');
          body = '<a href="' + m.image + '" target="_blank" rel="noopener"><img class="t-img" src="' + m.image + '" alt="Photo sent by the customer" loading="lazy" /></a>' +
            (caption ? '<span class="t-cap">' + escapeHtml(caption) + '</span>' : '');
        } else {
          body = escapeHtml(m.content);
        }
        return (
          '<div class="t-msg ' + (m.role === 'user' ? 'user' : 'bot') + '">' +
          '<span class="t-role">' + (m.role === 'user' ? 'Visitor' : 'Assistant') + '</span>' +
          body +
          '</div>'
        );
      })
      .join('');
  }

  function statusLabel(status) {
    return { new: 'New', contacted: 'Contacted', closed: 'Closed' }[status || 'new'] || 'New';
  }

  function render() {
    var shown = visibleLeads();
    statTotal.textContent = leads.length;
    statToday.textContent = leads.filter(function (l) { return new Date(l.time).toDateString() === new Date().toDateString(); }).length;
    statPending.textContent = leads.filter(function (l) { return (l.status || 'new') === 'new'; }).length;

    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    if (!shown.length) {
      listEl.innerHTML =
        '<div class="empty-state"><b>' + (leads.length ? 'Nothing here yet' : 'No leads yet') + '</b>' +
        (leads.length
          ? 'No leads in this filter. Leads open as "New" until marked contacted.'
          : 'Instagram and website conversations appear here as soon as someone shares their details.') +
        '</div>';
      return;
    }

    listEl.innerHTML = shown
      .map(function (l) {
        var isOpen = openIds.has(l.id);
        var status = l.status || 'new';
        return (
          '<div class="lead-card ' + (isOpen ? 'open' : '') + '" data-id="' + l.id + '">' +
          '<div class="lead-row" data-toggle="' + l.id + '">' +
          '<div class="lead-field"><label>Name</label><span>' + (escapeHtml(l.name) || 'N/A') + '</span></div>' +
          '<div class="lead-field"><label>Contact</label><span>' + (escapeHtml(l.contact) || 'N/A') + '</span></div>' +
          '<div class="lead-field"><label>Project</label><span>' + (escapeHtml(l.projectType) || 'N/A') + '</span></div>' +
          '<div class="lead-field"><label>Captured</label><span>' + timeAgo(l.time) + '</span></div>' +
          '<div class="lead-badge channel">' + escapeHtml(l.source) + '</div>' +
          '<div class="lead-chevron">→</div>' +
          '</div>' +
          '<div class="lead-detail">' +
          '<div class="lead-detail-inner">' +
          '<div class="detail-block">' +
          '<label>AI Summary</label>' +
          '<p class="summary-text">' + (escapeHtml(l.summary) || 'No summary available.') + '</p>' +
          specRow(l) +
          '</div>' +
          '<div class="detail-block">' +
          '<label>Transcript</label>' +
          '<div class="transcript">' + transcriptHtml(l) + '</div>' +
          '</div>' +
          '</div>' +
          '<div class="lead-actions">' +
          '<span class="status-pill status-' + status + '">' + statusLabel(status) + '</span>' +
          '<button class="action-btn" data-status="' + l.id + '">Mark ' + (status === 'new' ? 'Contacted' : status === 'contacted' ? 'Closed' : 'Open') + '</button>' +
          (l.phone || l.email
            ? '<a class="action-btn" target="_blank" rel="noopener" href="' + whatsappUrl(l) + '">WhatsApp</a>'
            : '') +
          '</div>' +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    listEl.querySelectorAll('[data-toggle]').forEach(function (row) {
      row.addEventListener('click', function () {
        var id = Number(row.dataset.toggle);
        if (openIds.has(id)) openIds.delete(id);
        else openIds.add(id);
        render();
      });
    });

    listEl.querySelectorAll('[data-status]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        cycleStatus(Number(btn.dataset.status));
      });
    });
  }

  function whatsappUrl(lead) {
    var msg = 'Hi Interio Arty! Lead from ' + (lead.source || 'your chatbot');
    if (lead.name) msg += ': ' + lead.name;
    if (lead.projectType || lead.bhk || lead.location) msg += ' (' + [lead.projectType, lead.bhk, lead.location].filter(Boolean).join(', ') + ')';
    if (lead.summary) msg += '. Summary: ' + lead.summary;
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function cycleStatus(id) {
    var rec = leads.find(function (l) { return l.id === id; });
    if (!rec) return;
    var order = { new: 'contacted', contacted: 'closed', closed: 'new' };
    var previous = rec.status || 'new';
    rec.status = order[previous];
    render();
    fetch('/api/crm/leads/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: rec.status }),
    }).then(function (r) {
      if (!r.ok) throw new Error('save failed');
    }).catch(function () {
      rec.status = previous; // the server did not accept it: show the truth
      render();
    });
  }

  function exportCsv() {
    if (!leads.length) return;
    var cols = ['Name', 'Phone', 'Email', 'Source', 'Project', 'Property', 'Location', 'Budget', 'Timeline', 'Status', 'Captured', 'Summary'];
    var rows = leads.map(function (l) {
      return [l.name, l.phone, l.email, l.source, l.projectType, l.bhk, l.location, l.budget, l.timeline, statusLabel(l.status), l.time, l.summary];
    });
    var csv = cols.map(csvCell).join(',') + '\n' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'interioarty-leads-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function csvCell(v) {
    var s = v == null ? '' : String(v);
    return '"' + s.replace(/"/g, '""') + '"';
  }

  function showToast() {
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
  }

  // ---- data ----
  function load() {
    return fetch('/api/crm/leads', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (r.status === 401) { loginEl.style.display = 'flex'; throw new Error('signed out'); }
        loginEl.style.display = 'none';
        return r.json();
      })
      .then(function (data) {
        var fresh = data.leads || [];
        var ids = new Set(fresh.map(function (l) { return l.id; }));
        var added = seen ? fresh.some(function (l) { return !seen.has(l.id); }) : false;
        seen = ids;
        leads = fresh;
        render();
        if (added) showToast();
      })
      .catch(function () { /* signed out or offline: try again on the next tick */ });
  }

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('loginErr');
    err.textContent = '';
    fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('pw').value }) })
      .then(function (r) { if (!r.ok) throw new Error('Wrong password'); return load(); })
      .catch(function (x) { err.textContent = x.message; });
  });

  var exportBtn = document.getElementById('exportCsv');
  if (exportBtn) exportBtn.addEventListener('click', exportCsv);

  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter = btn.dataset.filter;
      render();
    });
  });

  render();
  load();
  setInterval(function () { if (!document.hidden) load(); }, 6000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
})();
