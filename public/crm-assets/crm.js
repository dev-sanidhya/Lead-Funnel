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
  var lastSig = '';
  var selected = new Set();
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
        if (m.removed) {
          body = '<span class="t-gone">Photo removed</span>' + (m.content ? '<span class="t-cap">' + escapeHtml(String(m.content).replace(/^\[Photo\]\s*/, '')) + '</span>' : '');
        } else if (m.image) {
          // a picture the customer sent: show it exactly as sent, with what the assistant understood from it
          var caption = String(m.content || '').replace(/^\[Photo\]\s*/, '');
          body = '<img class="t-img" data-full="' + m.image + '" src="' + m.image + '" alt="Photo sent by the customer" loading="lazy" title="Click to enlarge" />' +
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
          '<div class="lead-field"><label>Name</label><span class="pick"><input type="checkbox" data-sel="' + l.id + '"' + (selected.has(l.id) ? ' checked' : '') + ' aria-label="Select this lead" />' + (escapeHtml(l.name) || 'N/A') + '</span></div>' +
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
          '<button class="action-btn danger" data-del="' + l.id + '">Delete lead</button>' +
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

    listEl.querySelectorAll('[data-sel]').forEach(function (box) {
      box.addEventListener('click', function (e) { e.stopPropagation(); });
      box.addEventListener('change', function () {
        var id = Number(box.dataset.sel);
        if (box.checked) selected.add(id); else selected.delete(id);
        updateBulk();
      });
    });
    listEl.querySelectorAll('[data-del]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = Number(btn.dataset.del);
        if (confirm('Delete this lead and its photos for good? This cannot be undone.')) removeLeads([id], 'leads');
      });
    });
    updateBulk();

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

  function showToast(msg) {
    if (msg) toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); toastEl.textContent = 'New lead received'; }, 3500);
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
        // redraw only when something changed, so a lead you are reading keeps its place
        var sig = JSON.stringify(fresh.map(function (l) { return [l.id, l.status, l.summary, l.phone, l.name, l.transcript.length]; }));
        var changed = sig !== lastSig;
        lastSig = sig;
        leads = fresh;
        if (changed) render();
        if (added) showToast();
      })
      .catch(function () { /* signed out or offline: try again on the next tick */ });
  }

  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('loginErr');
    err.textContent = '';
    fetch('/api/crm-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.getElementById('pw').value }) })
      .then(function (r) { if (!r.ok) throw new Error('Wrong password'); return load(); })
      .catch(function (x) { err.textContent = x.message; });
  });

  // Photos open full screen. Back (the button, the browser's Back, or Esc) returns to the chat exactly where it was.
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbDownload = document.getElementById('lbDownload');
  var lbMedia = null;
  function hideLightbox() { lightbox.classList.remove('show'); lbImg.removeAttribute('src'); lbMedia = null; }
  function closeLightbox() {
    if (!lightbox.classList.contains('show')) return;
    hideLightbox();
    if (history.state && history.state.lightbox) history.back(); // drop the entry we added when it opened
  }
  listEl.addEventListener('click', function (e) {
    var img = e.target.closest && e.target.closest('.t-img');
    if (!img) return;
    e.stopPropagation();
    var src = img.getAttribute('data-full');
    lbMedia = src.split('/').pop();
    lbImg.src = src;
    lbDownload.href = src;
    lbDownload.setAttribute('download', 'photo-' + lbMedia);
    lightbox.classList.add('show');
    history.pushState({ lightbox: 1 }, '');
  });
  window.addEventListener('popstate', function () { if (lightbox.classList.contains('show')) hideLightbox(); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target === lbImg) closeLightbox(); });
  document.getElementById('lbBack').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  document.getElementById('lbDelete').addEventListener('click', function () {
    if (!lbMedia || !confirm('Delete this photo for good? The chat will keep a note that it was removed.')) return;
    var id = lbMedia;
    fetch('/api/media/' + id, { method: 'DELETE' }).then(function (r) {
      if (!r.ok) throw new Error('Could not delete the photo. Please try again.');
      closeLightbox();
      lastSig = '';
      return load();
    }).catch(function (err) { alert(err.message); });
  });

  var exportBtn = document.getElementById('exportCsv');
  var signOut = document.getElementById('signOut');
  if (signOut) signOut.addEventListener('click', function () { fetch('/api/logout', { method: 'POST' }).then(function () { location.reload(); }); });
  if (exportBtn) exportBtn.addEventListener('click', exportCsv);

  document.querySelectorAll('.filter-btn[data-filter]').forEach(function (btn) { // only the real filters; Select all has its own handler
    btn.addEventListener('click', function () {
      filter = btn.dataset.filter;
      render();
    });
  });


  // ---- storage meter ----
  function fmtBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(n < 10485760 ? 1 : 0) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }
  function setMeter(bar, txt, used, limit, extra) {
    var pct = limit ? Math.min(100, (used / limit) * 100) : 0;
    bar.style.width = Math.max(pct, used > 0 ? 1 : 0) + '%';
    bar.className = pct >= 95 ? 'full' : pct >= 80 ? 'warn' : '';
    txt.textContent = fmtBytes(used) + ' of ' + fmtBytes(limit) + ' used' + (extra || '');
  }
  function loadUsage() {
    return fetch('/api/crm/usage').then(function (r) { return r.ok ? r.json() : null; }).then(function (u) {
      if (!u) return;
      setMeter(document.getElementById('barPhotos'), document.getElementById('txtPhotos'), u.photos.used, u.photos.limit, ' (' + u.photos.count + ' photos)');
      setMeter(document.getElementById('barDb'), document.getElementById('txtDb'), u.database.used, u.database.limit);
      document.getElementById('retention').value = String(u.photo_days);
    }).catch(function () {});
  }

  // ---- deleting what you ticked ----
  function updateBulk() {
    var visibleIds = new Set(leads.map(function (l) { return l.id; }));
    selected.forEach(function (id) { if (!visibleIds.has(id)) selected.delete(id); });
    document.getElementById('bulkbar').classList.toggle('show', selected.size > 0);
    document.getElementById('bulkCount').textContent = selected.size + ' selected';
    var all = document.getElementById('selectAll');
    var shown = visibleLeads();
    all.textContent = shown.length && shown.every(function (l) { return selected.has(l.id); }) ? 'Unselect all' : 'Select all';
  }
  function removeLeads(ids, scope) {
    return fetch('/api/crm/leads/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ids, scope: scope }) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Could not delete'); return j; }); })
      .then(function (j) {
        ids.forEach(function (id) { selected.delete(id); });
        lastSig = '';
        showToast(scope === 'leads' ? 'Deleted ' + j.leads + ' lead' + (j.leads === 1 ? '' : 's') + ', freed ' + fmtBytes(j.bytes) : 'Removed ' + j.photos + ' photo' + (j.photos === 1 ? '' : 's') + ', freed ' + fmtBytes(j.bytes));
        return load().then(loadUsage);
      })
      .catch(function (err) { alert(err.message); });
  }
  document.getElementById('selectAll').addEventListener('click', function () {
    var shown = visibleLeads();
    var every = shown.length && shown.every(function (l) { return selected.has(l.id); });
    shown.forEach(function (l) { if (every) selected.delete(l.id); else selected.add(l.id); });
    render();
  });
  document.getElementById('bulkClear').addEventListener('click', function () { selected.clear(); render(); });
  document.getElementById('bulkLeads').addEventListener('click', function () {
    var n = selected.size;
    if (confirm('Delete ' + n + ' lead' + (n === 1 ? '' : 's') + ' and their photos for good? This cannot be undone.')) removeLeads(Array.from(selected), 'leads');
  });
  document.getElementById('bulkPhotos').addEventListener('click', function () {
    var n = selected.size;
    if (confirm('Delete the photos of ' + n + ' lead' + (n === 1 ? '' : 's') + '? The chats and details stay.')) removeLeads(Array.from(selected), 'photos');
  });

  // ---- clean-up panel ----
  var cleanup = document.getElementById('cleanup');
  var cl = { scope: 'photos', days: '90', status: 'closed' };
  var previewTimer = null;
  var cleanable = 0;
  function segment(id, key) {
    document.getElementById(id).addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      cl[key] = b.dataset.v;
      Array.prototype.forEach.call(this.children, function (c) { c.classList.toggle('on', c === b); });
      refreshPreview();
    });
  }
  segment('optScope', 'scope'); segment('optDays', 'days'); segment('optStatus', 'status');
  function refreshPreview() {
    var box = document.getElementById('cleanupPreview');
    var go = document.getElementById('cleanupGo');
    box.classList.remove('warn');
    box.textContent = 'Checking...';
    go.disabled = true;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      fetch('/api/crm/cleanup/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: Number(cl.days), status: cl.status, scope: cl.scope }) })
        .then(function (r) { return r.json(); })
        .then(function (p) {
          var olderThan = document.querySelector('#optDays .on').textContent.toLowerCase();
          if (cl.scope === 'photos') {
            cleanable = p.photos;
            box.textContent = p.photos ? p.photos + ' photo' + (p.photos === 1 ? '' : 's') + ' from ' + p.photo_leads + ' lead' + (p.photo_leads === 1 ? '' : 's') + ' (' + fmtBytes(p.bytes) + ') older than ' + olderThan + ' will be removed. The leads and their chats stay.' : 'No photos match right now.';
          } else {
            cleanable = p.leads;
            box.classList.toggle('warn', p.leads > 0);
            box.textContent = p.leads ? p.leads + ' lead' + (p.leads === 1 ? '' : 's') + ' and ' + p.photos + ' photo' + (p.photos === 1 ? '' : 's') + ' (' + fmtBytes(p.bytes) + ') older than ' + olderThan + ' will be removed for good.' : 'No leads match right now.';
          }
          go.disabled = !cleanable;
        })
        .catch(function () { box.textContent = 'Could not check just now.'; });
    }, 250);
  }
  document.getElementById('openCleanup').addEventListener('click', function () { cleanup.classList.add('show'); refreshPreview(); });
  function closeCleanup() { cleanup.classList.remove('show'); }
  document.getElementById('cleanupCancel').addEventListener('click', closeCleanup);
  cleanup.addEventListener('click', function (e) { if (e.target === cleanup) closeCleanup(); });
  document.getElementById('cleanupCsv').addEventListener('click', exportCsv);
  document.getElementById('cleanupGo').addEventListener('click', function () {
    var go = this;
    go.disabled = true;
    var totals = { leads: 0, photos: 0, bytes: 0 };
    function step() {
      return fetch('/api/crm/cleanup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: Number(cl.days), status: cl.status, scope: cl.scope }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Clean-up failed'); return j; }); })
        .then(function (j) {
          totals.leads += j.leads; totals.photos += j.photos; totals.bytes += j.bytes;
          return j.remaining > 0 ? step() : totals;
        });
    }
    step().then(function (t) {
      closeCleanup();
      selected.clear();
      lastSig = '';
      showToast(cl.scope === 'leads' ? 'Removed ' + t.leads + ' lead' + (t.leads === 1 ? '' : 's') + ' and ' + t.photos + ' photo' + (t.photos === 1 ? '' : 's') + ', freed ' + fmtBytes(t.bytes) : 'Removed ' + t.photos + ' photo' + (t.photos === 1 ? '' : 's') + ', freed ' + fmtBytes(t.bytes));
      return load().then(loadUsage);
    }).catch(function (err) { alert(err.message); refreshPreview(); });
  });
  document.getElementById('retention').addEventListener('change', function () {
    fetch('/api/crm/retention', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo_days: Number(this.value) }) })
      .then(function (r) { if (!r.ok) throw new Error('not saved'); showToast(Number(document.getElementById('retention').value) ? 'Photos will be deleted automatically after that time' : 'Photos will be kept'); })
      .catch(function () { alert('Could not save that setting. Please try again.'); loadUsage(); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCleanup(); });

  render();
  load();
  loadUsage();
  setInterval(function () { if (!document.hidden) loadUsage(); }, 60000);
  setInterval(function () { if (!document.hidden) load(); }, 6000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
})();
