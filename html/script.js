// ============================================================
// PREMIUM DANISH POLICE MDT — Frontend v2.0
// ============================================================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playUISound(type) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'error') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

let officerData = null;
let currentCitizenTab = 'records';
let currentCitizenData = null;

// ===== TAB NAVIGATION =====
function switchTab(tab) {
    playUISound('click');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn:not(.close-btn)').forEach(n => n.classList.remove('active'));
    const tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.classList.add('active');
    const navEl = document.querySelector(`[data-tab="${tab}"]`);
    if (navEl) navEl.classList.add('active');

    // Trigger data loads
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'warrants') loadWarrants();
    if (tab === 'bolo') loadBolos();
    if (tab === 'dispatch') loadDispatch();
    if (tab === 'reports') loadReports();
    if (tab === 'units') loadUnits();
}

// ===== NUI MESSAGE HANDLER =====
window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.type === 'open_mdt') {
        playUISound('open');
        document.body.style.display = 'flex';
        if (data.officer) {
            officerData = data.officer;
            document.getElementById('officer-name').textContent = data.officer.name || 'Ukendt';
            document.getElementById('officer-badge').textContent = data.officer.badge ? ('Badge: ' + data.officer.badge) : (data.officer.callsign || '—');
            if (data.officer.badge) document.getElementById('settings-badge').value = data.officer.badge;
            if (data.officer.callsign) document.getElementById('settings-callsign').value = data.officer.callsign;
        }
        loadDashboard();
    }

    if (data.type === 'close_mdt') {
        document.body.style.display = 'none';
    }

    // Stats
    if (data.type === 'receiveStats') {
        document.getElementById('stat-cops').textContent = data.stats.cops || 0;
        document.getElementById('stat-warrants').textContent = data.stats.warrants || 0;
        document.getElementById('stat-bolos').textContent = data.stats.bolos || 0;
        renderDashboardDispatch(data.stats.dispatch || []);
    }

    // Citizen result
    if (data.type === 'citizenResult') renderCitizenResult(data);
    // Vehicle result
    if (data.type === 'vehicleResult') renderVehicleResult(data);
    // Warrants list
    if (data.type === 'warrantsList') renderWarrants(data.list);
    // BOLOs list
    if (data.type === 'bolosList') renderBolos(data.list);
    // Dispatch list
    if (data.type === 'dispatchList') renderDispatch(data.list);
    // Reports list
    if (data.type === 'reportsList') renderReports(data.list);
    // Units list
    if (data.type === 'unitsList') renderUnits(data.list);

    // Action result (toast)
    if (data.type === 'actionResult') {
        if (data.success) {
            showToast(data.message, 'success');
            playUISound('click');
        } else {
            showToast(data.message || 'Fejl', 'error');
            playUISound('error');
        }
    }

    // Notification (BOLO, Warrant, 112)
    if (data.type === 'notification') {
        showToast(data.title + ': ' + data.message, data.ntype === 'dispatch' ? 'warning' : 'info');
        playUISound('open');
    }
});

// ===== CLOSE MDT =====
function closeMDT() {
    playUISound('click');
    fetch('https://vrp_policetablet/close', { method: 'POST', body: JSON.stringify({}) }).catch(()=>{});
    document.body.style.display = 'none';
}
document.addEventListener('keyup', e => { if (e.key === 'Escape') closeMDT(); });

// ===== TOAST NOTIFICATIONS =====
function showToast(msg, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ===== DASHBOARD =====
function loadDashboard() {
    fetch('https://vrp_policetablet/getDashboardStats', { method: 'POST', body: JSON.stringify({}) });
}

function renderDashboardDispatch(calls) {
    const el = document.getElementById('dashboard-dispatch');
    if (!calls.length) {
        el.innerHTML = '<div class="empty-state">Ingen aktive opkald.</div>';
        return;
    }
    el.innerHTML = calls.map(c => `
        <div class="dispatch-item">
            <div class="dispatch-icon">📞</div>
            <div class="dispatch-body">
                <div class="dispatch-caller">${esc(c.caller_name)}</div>
                <div class="dispatch-msg">${esc(c.message)}</div>
                <div class="dispatch-time">${formatDate(c.created_at)} — <span class="badge badge-${c.status === 'new' ? 'new' : 'claimed'}">${c.status === 'new' ? 'Ny' : 'Taget'}</span></div>
            </div>
        </div>
    `).join('');
}

// ===== CITIZEN SEARCH =====
function searchCitizen() {
    const query = document.getElementById('citizen-input').value.trim();
    if (!query) return showToast('Indtast CPR eller navn.', 'error');
    document.getElementById('citizen-results').innerHTML = '<div class="empty-state">Søger...</div>';
    fetch('https://vrp_policetablet/searchCitizen', { method: 'POST', body: JSON.stringify({ search: query }) });
}

function renderCitizenResult(data) {
    const el = document.getElementById('citizen-results');
    if (!data.found) {
        el.innerHTML = '<div class="empty-state" style="border-color:rgba(239,68,68,0.2);color:var(--danger);">Borger ikke fundet i registeret.</div>';
        return;
    }
    currentCitizenData = data;
    currentCitizenTab = 'records';

    el.innerHTML = `
        <div class="citizen-profile">
            <div class="citizen-header">
                <div class="citizen-avatar"></div>
                <div>
                    <div class="citizen-name">${esc(data.name)}</div>
                    <div class="citizen-id">CPR: ${data.user_id}</div>
                    <div class="citizen-details">
                        <span class="citizen-detail"><strong>Tlf:</strong> ${esc(data.phone)}</span>
                        <span class="citizen-detail"><strong>Køretøjer:</strong> ${data.vehicles.length}</span>
                        <span class="citizen-detail"><strong>Sigtelser:</strong> ${data.records.length}</span>
                        ${data.warrants.length > 0 ? '<span class="citizen-detail" style="color:var(--danger);font-weight:600;">⚠ AKTIV EFTERLYSNING</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="citizen-tabs">
                <button class="citizen-tab active" onclick="switchCitizenTab('records', this)">Straffeattest (${data.records.length})</button>
                <button class="citizen-tab" onclick="switchCitizenTab('vehicles', this)">Køretøjer (${data.vehicles.length})</button>
                <button class="citizen-tab" onclick="switchCitizenTab('warrants', this)">Efterlysninger (${data.warrants.length})</button>
                <button class="citizen-tab" onclick="switchCitizenTab('fines', this)">Bøder (${data.fines.length})</button>
                <button class="citizen-tab" onclick="switchCitizenTab('notes', this)">Notater (${data.notes.length})</button>
                <button class="citizen-tab" onclick="switchCitizenTab('actions', this)">Handlinger</button>
            </div>
            <div class="citizen-tab-content" id="citizen-tab-content"></div>
        </div>
    `;
    renderCitizenSubTab('records');
}

function switchCitizenTab(tab, btn) {
    document.querySelectorAll('.citizen-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    currentCitizenTab = tab;
    renderCitizenSubTab(tab);
}

function renderCitizenSubTab(tab) {
    const el = document.getElementById('citizen-tab-content');
    const d = currentCitizenData;
    if (!d) return;

    if (tab === 'records') {
        if (!d.records.length) { el.innerHTML = '<div class="empty-state">Ingen sigtelser registreret.</div>'; return; }
        el.innerHTML = `<table class="records-table"><thead><tr><th>Dato</th><th>Sigtelse</th><th>Bøde</th><th>Fængsel</th><th>Betjent</th></tr></thead><tbody>${
            d.records.map(r => `<tr><td>${formatDate(r.created_at)}</td><td>${esc(r.charge)}</td><td>${r.fine_amount} kr.</td><td>${r.jail_time} mdr.</td><td>${esc(r.officer_name)}</td></tr>`).join('')
        }</tbody></table>`;
    }

    if (tab === 'vehicles') {
        if (!d.vehicles.length) { el.innerHTML = '<div class="empty-state">Ingen køretøjer registreret.</div>'; return; }
        el.innerHTML = '<div class="data-list">' + d.vehicles.map(v => `<div class="data-item"><div class="data-item-body"><div class="data-item-title">🚗 ${esc(v.vehicle)}</div></div></div>`).join('') + '</div>';
    }

    if (tab === 'warrants') {
        if (!d.warrants.length) { el.innerHTML = '<div class="empty-state">Ingen aktive efterlysninger.</div>'; return; }
        el.innerHTML = '<div class="data-list">' + d.warrants.map(w => `
            <div class="data-item">
                <div class="data-item-body">
                    <div class="data-item-title">${esc(w.reason)}</div>
                    <div class="data-item-sub">Oprettet af ${esc(w.officer_name)} — ${formatDate(w.created_at)}</div>
                </div>
                <span class="badge badge-${w.priority}">${w.priority}</span>
            </div>
        `).join('') + '</div>';
    }

    if (tab === 'fines') {
        if (!d.fines.length) { el.innerHTML = '<div class="empty-state">Ingen bøder registreret.</div>'; return; }
        el.innerHTML = `<table class="records-table"><thead><tr><th>Dato</th><th>Type</th><th>Beløb</th><th>Betjent</th></tr></thead><tbody>${
            d.fines.map(f => `<tr><td>${formatDate(f.created_at)}</td><td>${esc(f.label)}</td><td>${f.amount} kr.</td><td>${esc(f.officer_name)}</td></tr>`).join('')
        }</tbody></table>`;
    }

    if (tab === 'notes') {
        el.innerHTML = `
            <div style="margin-bottom:16px;display:flex;gap:10px;">
                <input type="text" id="note-input" placeholder="Tilføj notat..." style="flex:1;padding:10px 14px;background:var(--bg-input);border:1px solid var(--border-light);border-radius:var(--radius-xs);color:var(--text);font-family:var(--font);font-size:13px;outline:none;">
                <button class="btn btn-primary btn-sm" onclick="addNote()">Tilføj</button>
            </div>
            <div class="data-list">
                ${d.notes.length ? d.notes.map(n => `
                    <div class="data-item">
                        <div class="data-item-body">
                            <div class="data-item-sub" style="color:var(--text)">${esc(n.note)}</div>
                            <div class="data-item-sub">${esc(n.officer_name)} — ${formatDate(n.created_at)}</div>
                        </div>
                    </div>
                `).join('') : '<div class="empty-state">Ingen notater.</div>'}
            </div>
        `;
    }

    if (tab === 'actions') {
        el.innerHTML = `
            <div class="form-panel" style="max-width:500px;">
                <h3>Tilføj Sigtelse</h3>
                <div class="form-grid">
                    <div class="form-group full"><label>Sigtelse</label><input type="text" id="action-charge" placeholder="F.eks. Vold mod tjenestemand"></div>
                    <div class="form-group"><label>Bøde (kr.)</label><input type="number" id="action-fine" placeholder="0" value="0"></div>
                    <div class="form-group"><label>Fængsel (måneder)</label><input type="number" id="action-jail" placeholder="0" value="0"></div>
                </div>
                <div class="form-actions"><button class="btn btn-primary" onclick="addCharge()">Registrer Sigtelse</button></div>
            </div>
            <div class="form-panel" style="max-width:500px;margin-top:16px;">
                <h3>Opret Efterlysning</h3>
                <div class="form-grid">
                    <div class="form-group full"><label>Begrundelse</label><textarea id="action-warrant-reason" rows="2" placeholder="Begrundelse for efterlysning..."></textarea></div>
                    <div class="form-group"><label>Prioritet</label><select id="action-warrant-priority"><option value="low">Lav</option><option value="medium" selected>Middel</option><option value="high">Høj</option></select></div>
                </div>
                <div class="form-actions"><button class="btn btn-danger" onclick="addWarrantFromProfile()">Opret Efterlysning</button></div>
            </div>
        `;
    }
}

function addCharge() {
    if (!currentCitizenData) return;
    const charge = document.getElementById('action-charge').value.trim();
    if (!charge) return showToast('Indtast en sigtelse.', 'error');
    fetch('https://vrp_policetablet/addCharge', { method: 'POST', body: JSON.stringify({
        citizen_id: currentCitizenData.user_id,
        citizen_name: currentCitizenData.name,
        charge: charge,
        fine_amount: parseInt(document.getElementById('action-fine').value) || 0,
        jail_time: parseInt(document.getElementById('action-jail').value) || 0
    }) });
    document.getElementById('action-charge').value = '';
}

function addWarrantFromProfile() {
    if (!currentCitizenData) return;
    const reason = document.getElementById('action-warrant-reason').value.trim();
    if (!reason) return showToast('Indtast begrundelse.', 'error');
    fetch('https://vrp_policetablet/createWarrant', { method: 'POST', body: JSON.stringify({
        citizen_id: currentCitizenData.user_id,
        citizen_name: currentCitizenData.name,
        reason: reason,
        priority: document.getElementById('action-warrant-priority').value
    }) });
}

function addNote() {
    if (!currentCitizenData) return;
    const note = document.getElementById('note-input').value.trim();
    if (!note) return;
    fetch('https://vrp_policetablet/addNote', { method: 'POST', body: JSON.stringify({ citizen_id: currentCitizenData.user_id, note: note }) });
    document.getElementById('note-input').value = '';
    showToast('Notat tilføjet.', 'success');
}

// ===== VEHICLE SEARCH =====
function searchVehicle() {
    const plate = document.getElementById('vehicle-input').value.trim();
    if (!plate) return showToast('Indtast nummerplade.', 'error');
    document.getElementById('vehicle-results').innerHTML = '<div class="empty-state">Søger...</div>';
    fetch('https://vrp_policetablet/searchVehicle', { method: 'POST', body: JSON.stringify({ plate: plate }) });
}

function renderVehicleResult(data) {
    const el = document.getElementById('vehicle-results');
    if (!data.found) {
        el.innerHTML = '<div class="empty-state" style="border-color:rgba(239,68,68,0.2);color:var(--danger);">Køretøj ikke fundet.</div>';
        return;
    }
    el.innerHTML = `
        <div class="data-item" style="flex-direction:column;align-items:stretch;">
            <div style="display:flex;align-items:center;gap:16px;">
                <div class="stat-icon teal" style="font-size:24px;">🚗</div>
                <div>
                    <div class="data-item-title">${esc(data.vehicle)}</div>
                    <div class="data-item-sub">Ejer: ${esc(data.owner_name)} (CPR: ${data.owner_id})</div>
                </div>
                ${data.bolo ? '<span class="badge badge-high" style="margin-left:auto;">⚠ AKTIV BOLO</span>' : '<span class="badge badge-low" style="margin-left:auto;">✓ Ingen BOLO</span>'}
            </div>
            ${data.bolo ? `<div style="margin-top:14px;padding:12px;background:var(--danger-dim);border:1px solid var(--danger);border-radius:var(--radius-xs);font-size:13px;">
                <strong>BOLO:</strong> ${esc(data.bolo.title)} — ${esc(data.bolo.description || '')}
            </div>` : ''}
        </div>
    `;
}

// ===== WARRANTS =====
function loadWarrants() { fetch('https://vrp_policetablet/getWarrants', { method: 'POST', body: JSON.stringify({}) }); }
function renderWarrants(list) {
    const el = document.getElementById('warrants-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state">Ingen aktive efterlysninger.</div>'; return; }
    el.innerHTML = list.map(w => `
        <div class="data-item">
            <div class="data-item-body">
                <div class="data-item-title">${esc(w.citizen_name)} <span style="color:var(--text-muted);font-weight:400;">(CPR: ${w.citizen_id})</span></div>
                <div class="data-item-sub">${esc(w.reason)}</div>
                <div class="data-item-sub">Oprettet af ${esc(w.officer_name)} — ${formatDate(w.created_at)}</div>
            </div>
            <span class="badge badge-${w.priority}">${w.priority}</span>
            <button class="btn btn-xs btn-primary" onclick="resolveWarrant(${w.id})">Luk</button>
        </div>
    `).join('');
}
function resolveWarrant(id) { fetch('https://vrp_policetablet/resolveWarrant', { method: 'POST', body: JSON.stringify({ id: id }) }); setTimeout(loadWarrants, 500); }
function showCreateWarrantForm() { document.getElementById('warrant-form').style.display = 'block'; }
function createWarrant() {
    const data = {
        citizen_id: parseInt(document.getElementById('warrant-citizen-id').value),
        citizen_name: document.getElementById('warrant-citizen-name').value.trim(),
        reason: document.getElementById('warrant-reason').value.trim(),
        priority: document.getElementById('warrant-priority').value
    };
    if (!data.citizen_id || !data.reason) return showToast('Udfyld alle felter.', 'error');
    fetch('https://vrp_policetablet/createWarrant', { method: 'POST', body: JSON.stringify(data) });
    hideForm('warrant-form');
    setTimeout(loadWarrants, 500);
}

// ===== BOLOs =====
function loadBolos() { fetch('https://vrp_policetablet/getBolos', { method: 'POST', body: JSON.stringify({}) }); }
function renderBolos(list) {
    const el = document.getElementById('bolos-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state">Ingen aktive BOLOs.</div>'; return; }
    el.innerHTML = list.map(b => `
        <div class="data-item">
            <div class="data-item-body">
                <div class="data-item-title">${esc(b.title)} ${b.plate ? '— <span style="color:var(--accent)">' + esc(b.plate) + '</span>' : ''}</div>
                <div class="data-item-sub">${esc(b.description || '')}</div>
                <div class="data-item-sub">${b.type === 'person' ? '👤 Person' : '🚗 Køretøj'} — ${esc(b.officer_name)} — ${formatDate(b.created_at)}</div>
            </div>
            <span class="badge badge-${b.priority}">${b.priority}</span>
            <button class="btn btn-xs btn-primary" onclick="resolveBolo(${b.id})">Luk</button>
        </div>
    `).join('');
}
function resolveBolo(id) { fetch('https://vrp_policetablet/resolveBolo', { method: 'POST', body: JSON.stringify({ id: id }) }); setTimeout(loadBolos, 500); }
function showCreateBoloForm() { document.getElementById('bolo-form').style.display = 'block'; }
function createBolo() {
    const data = {
        type: document.getElementById('bolo-type').value,
        title: document.getElementById('bolo-title').value.trim(),
        description: document.getElementById('bolo-desc').value.trim(),
        plate: document.getElementById('bolo-plate').value.trim(),
        last_seen: document.getElementById('bolo-lastseen').value.trim(),
        priority: document.getElementById('bolo-priority').value,
        photo_url: document.getElementById('bolo-photo').value.trim()
    };
    if (!data.title) return showToast('Titel er påkrævet.', 'error');
    fetch('https://vrp_policetablet/createBolo', { method: 'POST', body: JSON.stringify(data) });
    hideForm('bolo-form');
    setTimeout(loadBolos, 500);
}

// ===== DISPATCH =====
function loadDispatch() { fetch('https://vrp_policetablet/getDispatch', { method: 'POST', body: JSON.stringify({}) }); }
function renderDispatch(list) {
    const el = document.getElementById('dispatch-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state">Ingen aktive opkald.</div>'; return; }
    el.innerHTML = list.map(c => `
        <div class="data-item">
            <div class="dispatch-icon">📞</div>
            <div class="data-item-body">
                <div class="data-item-title">${esc(c.caller_name)}</div>
                <div class="data-item-sub">${esc(c.message)}</div>
                <div class="data-item-sub">${formatDate(c.created_at)}${c.claimed_by ? ' — Taget af ' + esc(c.claimed_by) : ''}</div>
            </div>
            <span class="badge badge-${c.status === 'new' ? 'new' : 'claimed'}">${c.status === 'new' ? 'Ny' : 'Taget'}</span>
            <div class="data-item-actions">
                ${c.status === 'new' ? `<button class="btn btn-xs btn-primary" onclick="claimDispatch(${c.id})">Tag</button>` : ''}
                <button class="btn btn-xs" onclick="gpsDispatch(${c.coords_x || 0}, ${c.coords_y || 0})">📍 GPS</button>
                <button class="btn btn-xs btn-ghost" onclick="resolveDispatch(${c.id})">Luk</button>
            </div>
        </div>
    `).join('');
}
function claimDispatch(id) { fetch('https://vrp_policetablet/claimDispatch', { method: 'POST', body: JSON.stringify({ id: id }) }); setTimeout(loadDispatch, 500); }
function resolveDispatch(id) { fetch('https://vrp_policetablet/resolveDispatch', { method: 'POST', body: JSON.stringify({ id: id }) }); setTimeout(loadDispatch, 500); }
function gpsDispatch(x, y) { fetch('https://vrp_policetablet/setGPS', { method: 'POST', body: JSON.stringify({ x: x, y: y }) }); showToast('GPS-rute sat.', 'success'); }

// ===== REPORTS =====
function loadReports() { fetch('https://vrp_policetablet/getReports', { method: 'POST', body: JSON.stringify({}) }); }
function renderReports(list) {
    const el = document.getElementById('reports-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state">Ingen rapporter endnu.</div>'; return; }
    el.innerHTML = list.map(r => `
        <div class="data-item">
            <div class="data-item-body">
                <div class="data-item-title">#${r.id} — ${esc(r.title)}</div>
                <div class="data-item-sub">${esc(r.category || 'Andet')} — ${esc(r.officer_name)} — ${formatDate(r.created_at)}</div>
                <div class="data-item-sub" style="color:var(--text-secondary);margin-top:4px;">${esc((r.description || '').substring(0, 120))}${(r.description || '').length > 120 ? '...' : ''}</div>
            </div>
        </div>
    `).join('');
}
function showCreateReportForm() { document.getElementById('report-form').style.display = 'block'; }
function createReport() {
    const data = {
        title: document.getElementById('report-title').value.trim(),
        description: document.getElementById('report-desc').value.trim(),
        category: document.getElementById('report-category').value,
        involved_citizens: document.getElementById('report-citizens').value.trim(),
        involved_vehicles: document.getElementById('report-vehicles').value.trim(),
        location: document.getElementById('report-location').value.trim()
    };
    if (!data.title || !data.description) return showToast('Titel og beskrivelse er påkrævet.', 'error');
    fetch('https://vrp_policetablet/createReport', { method: 'POST', body: JSON.stringify(data) });
    hideForm('report-form');
    setTimeout(loadReports, 500);
}

// ===== FINES =====
function updateFineAmount() {
    const sel = document.getElementById('fine-category');
    const opt = sel.options[sel.selectedIndex];
    const amount = opt ? opt.dataset.amount : 0;
    document.getElementById('fine-amount').value = amount || 0;
}

function issueFine() {
    const citizenId = parseInt(document.getElementById('fine-citizen-id').value);
    const citizenName = document.getElementById('fine-citizen-name').value.trim();
    const sel = document.getElementById('fine-category');
    const label = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
    const category = sel.value;
    const amount = parseInt(document.getElementById('fine-amount').value) || 0;
    if (!citizenId || !amount) return showToast('Udfyld CPR og beløb.', 'error');
    fetch('https://vrp_policetablet/issueFine', { method: 'POST', body: JSON.stringify({
        citizen_id: citizenId, citizen_name: citizenName, category: category, label: label, amount: amount
    })});
    showToast('Bøde på ' + amount + ' kr. udstedt.', 'success');
}

// ===== UNITS =====
function loadUnits() { fetch('https://vrp_policetablet/getUnits', { method: 'POST', body: JSON.stringify({}) }); }
function renderUnits(list) {
    const el = document.getElementById('units-list');
    if (!list.length) { el.innerHTML = '<div class="empty-state">Ingen betjente i tjeneste.</div>'; return; }
    el.innerHTML = list.map(u => `
        <div class="unit-card">
            <div class="unit-avatar"></div>
            <div class="unit-info">
                <div class="unit-name">${esc(u.name)}</div>
                <div class="unit-badge">${u.badge ? 'Badge: ' + esc(u.badge) : ''} ${u.callsign ? '— ' + esc(u.callsign) : ''}</div>
            </div>
            <div class="unit-status" style="background:${getStatusColor(u.status)}22;color:${getStatusColor(u.status)};border:1px solid ${getStatusColor(u.status)}44;">${esc(u.status)}</div>
        </div>
    `).join('');
}

function getStatusColor(code) {
    const map = { '10-8': '#20c997', '10-6': '#f59e0b', '10-7': '#64748b', '10-38': '#3b82f6', '10-80': '#ef4444', '10-99': '#dc2626', '10-15': '#8b5cf6' };
    return map[code] || '#64748b';
}

// ===== SETTINGS =====
function saveSettings() {
    const badge = document.getElementById('settings-badge').value.trim();
    const callsign = document.getElementById('settings-callsign').value.trim();
    fetch('https://vrp_policetablet/updateOfficerData', { method: 'POST', body: JSON.stringify({ badge: badge, callsign: callsign }) });
}

// ===== HELPERS =====
function hideForm(id) { document.getElementById(id).style.display = 'none'; }
function esc(s) { if (!s) return ''; return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function formatDate(d) { if (!d) return ''; try { return new Date(d).toLocaleString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e) { return d; } }
