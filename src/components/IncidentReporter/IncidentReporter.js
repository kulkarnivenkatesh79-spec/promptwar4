/**
 * @fileoverview GenAI-powered Incident Reporter with form submission, auto-categorization,
 * protocol generation, and real-time status tracking.
 * @module components/IncidentReporter/IncidentReporter
 */

import { sanitizeInput, escapeHTML, validatePayload } from '../../core/security.js';
import { t } from '../../core/i18n.js';
import { announceToScreenReader, trapFocusInElement, releaseFocusTrap } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { sampleIncidents, generateProtocol, getIncidentStats } from '../../data/mockIncidents.js';

/**
 * Creates the Incident Reporter component.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function IncidentReporter() {
  const cleanupFns = [];
  let incidents = [...sampleIncidents];

  const incidentSchema = {
    category: { type: 'string', required: true, enum: ['medical', 'security', 'infrastructure', 'crowd', 'weather', 'general'] },
    location: { type: 'string', required: true, minLength: 3, maxLength: 200 },
    severity: { type: 'string', required: true, enum: ['critical', 'high', 'medium', 'low'] },
    description: { type: 'string', required: true, minLength: 10, maxLength: 2000 }
  };

  function render() {
    const stats = getIncidentStats(incidents);

    return `
      <div class="flex flex-col gap-6">
        <!-- Stats Bar -->
        <div class="dashboard-grid dashboard-grid--4">
          <article class="glass-card stat-card" role="article" aria-label="Active incidents: ${stats.active}">
            <span class="stat-card__label">${escapeHTML(t('incidents.activeIncidents'))}</span>
            <span class="stat-card__value" style="${stats.critical > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : ''}">${stats.active}</span>
            ${stats.critical > 0 ? `<span class="badge badge--danger">${stats.critical} ${escapeHTML(t('incidents.severities.critical'))}</span>` : '<span class="badge badge--success">Under control</span>'}
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Resolved: ${stats.resolved}">
            <span class="stat-card__label">${escapeHTML(t('incidents.resolved'))}</span>
            <span class="stat-card__value">${stats.resolved}</span>
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Total today: ${stats.total}">
            <span class="stat-card__label">${escapeHTML(t('incidents.totalToday'))}</span>
            <span class="stat-card__value">${stats.total}</span>
          </article>
          <article class="glass-card stat-card" role="article" aria-label="Average response time: ${stats.avgResponseTime} minutes">
            <span class="stat-card__label">${escapeHTML(t('incidents.avgResponse'))}</span>
            <span class="stat-card__value">${stats.avgResponseTime}<span style="font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);">min</span></span>
          </article>
        </div>

        <!-- Report Form -->
        <section class="glass-card" aria-labelledby="incident-form-heading">
          <h3 id="incident-form-heading" style="margin-bottom: var(--space-4);">
            🚨 ${escapeHTML(t('incidents.reportNew'))}
          </h3>
          <form id="incident-form" novalidate aria-label="Incident report form">
            <div class="dashboard-grid dashboard-grid--2" style="margin-bottom: var(--space-4);">
              <div class="form-group">
                <label for="incident-category" class="form-label">${escapeHTML(t('incidents.category'))} *</label>
                <select id="incident-category" class="form-select" required aria-required="true">
                  <option value="">Select category</option>
                  <option value="medical">${escapeHTML(t('incidents.categories.medical'))}</option>
                  <option value="security">${escapeHTML(t('incidents.categories.security'))}</option>
                  <option value="infrastructure">${escapeHTML(t('incidents.categories.infrastructure'))}</option>
                  <option value="crowd">${escapeHTML(t('incidents.categories.crowd'))}</option>
                  <option value="weather">${escapeHTML(t('incidents.categories.weather'))}</option>
                  <option value="general">${escapeHTML(t('incidents.categories.general'))}</option>
                </select>
                <div id="incident-category-error" class="form-error" role="alert" aria-live="polite"></div>
              </div>
              <div class="form-group">
                <label for="incident-severity" class="form-label">${escapeHTML(t('incidents.severity'))} *</label>
                <select id="incident-severity" class="form-select" required aria-required="true">
                  <option value="">Select severity</option>
                  <option value="critical">${escapeHTML(t('incidents.severities.critical'))}</option>
                  <option value="high">${escapeHTML(t('incidents.severities.high'))}</option>
                  <option value="medium">${escapeHTML(t('incidents.severities.medium'))}</option>
                  <option value="low">${escapeHTML(t('incidents.severities.low'))}</option>
                </select>
                <div id="incident-severity-error" class="form-error" role="alert" aria-live="polite"></div>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label for="incident-location" class="form-label">${escapeHTML(t('incidents.location'))} *</label>
              <input type="text" id="incident-location" class="form-input" placeholder="e.g., Section 202, Restroom Block C" required aria-required="true" maxlength="200" />
              <div id="incident-location-error" class="form-error" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label for="incident-description" class="form-label">${escapeHTML(t('incidents.description'))} *</label>
              <textarea id="incident-description" class="form-textarea" placeholder="Describe the incident in detail..." required aria-required="true" maxlength="2000"></textarea>
              <div id="incident-description-error" class="form-error" role="alert" aria-live="polite"></div>
            </div>
            <button type="submit" class="btn btn--primary btn--lg" id="incident-submit-btn">
              🚨 ${escapeHTML(t('incidents.submit'))}
            </button>
          </form>
        </section>

        <!-- Active Incident Log -->
        <section aria-labelledby="incident-log-heading">
          <div class="flex justify-between items-center mb-4">
            <h3 id="incident-log-heading">📋 ${escapeHTML(t('incidents.activeIncidents'))}</h3>
            <div class="flex gap-2">
              <select id="incident-filter-severity" class="form-select" style="width: auto; font-size: var(--text-xs);" aria-label="Filter by severity">
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select id="incident-filter-status" class="form-select" style="width: auto; font-size: var(--text-xs);" aria-label="Filter by status">
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="inProgress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
          <div class="flex flex-col gap-3" id="incident-log" role="list" aria-label="Incident log">
            ${incidents.map((inc) => renderIncidentCard(inc)).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderIncidentCard(incident) {
    const timeAgo = getTimeAgo(incident.reportedAt);
    const severityBadge = { critical: 'badge--danger', high: 'badge--warning', medium: 'badge--gold', low: 'badge--success' };
    const statusBadge = { reported: 'badge--info', acknowledged: 'badge--warning', inProgress: 'badge--gold', resolved: 'badge--success' };
    const categoryIcons = { medical: '🏥', security: '🛡️', infrastructure: '🔧', crowd: '👥', weather: '⛈️', general: '📝' };

    return `
      <article class="incident-card" role="listitem" data-incident-id="${escapeHTML(incident.id)}"
        aria-label="${escapeHTML(incident.category)} incident at ${escapeHTML(incident.location)}, severity ${incident.severity}, status ${incident.status}">
        <div class="incident-card__severity incident-card__severity--${incident.severity}" aria-hidden="true"></div>
        <div style="flex: 1;">
          <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-2">
              <span>${categoryIcons[incident.category] || '📝'}</span>
              <span style="font-weight: var(--weight-semibold);">${escapeHTML(t(`incidents.categories.${incident.category}`))}</span>
            </div>
            <div class="flex gap-2">
              <span class="badge ${severityBadge[incident.severity]}">${escapeHTML(t(`incidents.severities.${incident.severity}`))}</span>
              <span class="badge ${statusBadge[incident.status]}">${escapeHTML(t(`incidents.statuses.${incident.status}`))}</span>
            </div>
          </div>
          <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);">
            📍 ${escapeHTML(incident.location)} · ⏱️ ${escapeHTML(timeAgo)}
          </div>
          <p style="font-size: var(--text-sm); margin-bottom: var(--space-3);">${escapeHTML(incident.description)}</p>

          ${incident.protocol ? renderProtocol(incident.protocol) : ''}

          ${incident.status !== 'resolved' ? `
            <div class="flex gap-2 mt-2">
              ${incident.status === 'reported' ? `<button class="btn btn--secondary btn--sm" data-action="acknowledge" data-id="${escapeHTML(incident.id)}" type="button">✓ Acknowledge</button>` : ''}
              ${incident.status === 'acknowledged' ? `<button class="btn btn--primary btn--sm" data-action="inProgress" data-id="${escapeHTML(incident.id)}" type="button">▶ Start Response</button>` : ''}
              ${incident.status === 'inProgress' ? `<button class="btn btn--sm" style="background: var(--color-accent-green); color: var(--color-text-inverse);" data-action="resolved" data-id="${escapeHTML(incident.id)}" type="button">✓ Resolve</button>` : ''}
            </div>
          ` : ''}
        </div>
      </article>
    `;
  }

  function renderProtocol(protocol) {
    return `
      <div class="glass-card" style="padding: var(--space-3); margin-top: var(--space-2); background: rgba(0, 229, 255, 0.05); border-color: rgba(0, 229, 255, 0.15);">
        <div class="flex justify-between items-center mb-2">
          <span style="font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-accent-cyan);">
            🤖 ${escapeHTML(t('incidents.protocolTitle'))}
          </span>
          <span class="badge badge--info">${protocol.priority}</span>
        </div>
        <ol style="font-size: var(--text-xs); color: var(--color-text-secondary); padding-left: var(--space-4); margin-bottom: var(--space-2);">
          ${protocol.steps.map((step) => `<li style="margin-bottom: var(--space-1);">${escapeHTML(step)}</li>`).join('')}
        </ol>
        <div class="flex gap-4" style="font-size: var(--text-xs); color: var(--color-text-muted);">
          <span>⏱️ ${escapeHTML(t('incidents.estimatedResponse'))}: ${escapeHTML(protocol.estimatedResponse)}</span>
          <span>👤 ${escapeHTML(t('incidents.personnelNeeded'))}: ${protocol.personnelNeeded}</span>
        </div>
      </div>
    `;
  }

  function getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  }

  function mount() {
    const form = document.getElementById('incident-form');
    if (form) {
      const handleSubmit = (e) => {
        e.preventDefault();
        submitIncident();
      };
      form.addEventListener('submit', handleSubmit);
      cleanupFns.push(() => form.removeEventListener('submit', handleSubmit));
    }

    const log = document.getElementById('incident-log');
    if (log) {
      const handleStatusAction = (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        updateIncidentStatus(id, action);
      };
      log.addEventListener('click', handleStatusAction);
      cleanupFns.push(() => log.removeEventListener('click', handleStatusAction));
    }

    const severityFilter = document.getElementById('incident-filter-severity');
    const statusFilter = document.getElementById('incident-filter-status');

    const applyFilters = () => {
      const severity = severityFilter?.value || 'all';
      const status = statusFilter?.value || 'all';
      filterIncidents(severity, status);
    };

    if (severityFilter) {
      severityFilter.addEventListener('change', applyFilters);
      cleanupFns.push(() => severityFilter.removeEventListener('change', applyFilters));
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', applyFilters);
      cleanupFns.push(() => statusFilter.removeEventListener('change', applyFilters));
    }
  }

  function submitIncident() {
    const category = document.getElementById('incident-category')?.value;
    const severity = document.getElementById('incident-severity')?.value;
    const locationRaw = document.getElementById('incident-location')?.value || '';
    const descriptionRaw = document.getElementById('incident-description')?.value || '';

    const location = sanitizeInput(locationRaw, { maxLength: 200, allowNewlines: false });
    const description = sanitizeInput(descriptionRaw, { maxLength: 2000 });

    clearFormErrors();

    const validation = validatePayload(incidentSchema, { category, location, severity, description });

    if (!validation.valid) {
      validation.errors.forEach((err) => {
        const field = err.match(/"(\w+)"/)?.[1];
        if (field) {
          const errorEl = document.getElementById(`incident-${field}-error`);
          const inputEl = document.getElementById(`incident-${field}`);
          if (errorEl) errorEl.textContent = err;
          if (inputEl) inputEl.classList.add('form-input--error');
        }
      });
      announceToScreenReader(`Form has ${validation.errors.length} errors. ${validation.errors[0]}`);
      return;
    }

    const newIncident = {
      id: 'inc-' + Date.now().toString(36),
      category,
      location,
      severity,
      description,
      status: 'reported',
      reportedAt: Date.now(),
      venue: 'MetLife Stadium'
    };

    const protocol = generateProtocol(newIncident);
    newIncident.protocol = protocol;

    incidents.unshift(newIncident);
    store.dispatch('incidents.addItem', newIncident);
    store.dispatch('incidents.setProtocol', { id: newIncident.id, protocol });

    const logEl = document.getElementById('incident-log');
    if (logEl) {
      logEl.insertAdjacentHTML('afterbegin', renderIncidentCard(newIncident));
    }

    const form = document.getElementById('incident-form');
    if (form) form.reset();

    store.dispatch('ui.addToast', {
      type: 'success',
      title: '🚨 Incident Reported',
      message: `${t(`incidents.categories.${category}`)} at ${location} — AI protocol generated.`
    });

    announceToScreenReader(`Incident reported successfully. AI response protocol generated with ${protocol.steps.length} steps. Estimated response time: ${protocol.estimatedResponse}.`);
  }

  function updateIncidentStatus(id, newStatus) {
    const incident = incidents.find((i) => i.id === id);
    if (!incident) return;

    incident.status = newStatus;
    if (newStatus === 'resolved') {
      incident.resolvedAt = Date.now();
    }

    store.dispatch('incidents.updateStatus', { id, status: newStatus });

    const logEl = document.getElementById('incident-log');
    if (logEl) {
      logEl.innerHTML = incidents.map((inc) => renderIncidentCard(inc)).join('');
    }

    store.dispatch('ui.addToast', {
      type: 'info',
      title: 'Status Updated',
      message: `Incident ${id} → ${t(`incidents.statuses.${newStatus}`)}`
    });

    announceToScreenReader(`Incident status updated to ${t(`incidents.statuses.${newStatus}`)}`);
  }

  function filterIncidents(severity, status) {
    let filtered = [...incidents];

    if (severity !== 'all') {
      filtered = filtered.filter((i) => i.severity === severity);
    }
    if (status !== 'all') {
      filtered = filtered.filter((i) => i.status === status);
    }

    const logEl = document.getElementById('incident-log');
    if (logEl) {
      logEl.innerHTML = filtered.length > 0
        ? filtered.map((inc) => renderIncidentCard(inc)).join('')
        : '<div class="text-center" style="padding: var(--space-8); color: var(--color-text-muted);">No incidents match the selected filters</div>';
    }

    announceToScreenReader(`Showing ${filtered.length} incidents`);
  }

  function clearFormErrors() {
    document.querySelectorAll('.form-error').forEach((el) => { el.textContent = ''; });
    document.querySelectorAll('.form-input--error').forEach((el) => { el.classList.remove('form-input--error'); });
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns.length = 0;
  }

  return { render, mount, unmount };
}
