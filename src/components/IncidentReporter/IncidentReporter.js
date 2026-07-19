/**
 * @fileoverview GenAI-powered Incident Reporter with form submission, auto-categorization,
 * protocol generation, and real-time status tracking.
 * @module components/IncidentReporter/IncidentReporter
 */

import { sanitizeInput, validatePayload } from '../../core/security.js';
import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { sampleIncidents, generateProtocol, getIncidentStats } from '../../data/mockIncidents.js';
import { createElement, replaceChildren } from '../../core/dom.js';

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

    const statCards = [
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Active incidents: ${stats.active}` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('incidents.activeIncidents')]),
        createElement('span', { class: 'stat-card__value', style: stats.critical > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : '' }, [stats.active]),
        stats.critical > 0 
          ? createElement('span', { class: 'badge badge--danger' }, [`${stats.critical} ${t('incidents.severities.critical')}`]) 
          : createElement('span', { class: 'badge badge--success' }, ['Under control'])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Resolved: ${stats.resolved}` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('incidents.resolved')]),
        createElement('span', { class: 'stat-card__value' }, [stats.resolved])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Total today: ${stats.total}` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('incidents.totalToday')]),
        createElement('span', { class: 'stat-card__value' }, [stats.total])
      ]),
      createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Average response time: ${stats.avgResponseTime} minutes` } }, [
        createElement('span', { class: 'stat-card__label' }, [t('incidents.avgResponse')]),
        createElement('span', { class: 'stat-card__value' }, [
          stats.avgResponseTime,
          createElement('span', { style: 'font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);' }, ['min'])
        ])
      ])
    ];

    const form = createElement('form', { id: 'incident-form', novalidate: true, aria: { label: 'Incident report form' } }, [
      createElement('div', { class: 'dashboard-grid dashboard-grid--2', style: 'margin-bottom: var(--space-4);' }, [
        createElement('div', { class: 'form-group' }, [
          createElement('label', { for: 'incident-category', class: 'form-label' }, [`${t('incidents.category')} *`]),
          createElement('select', { id: 'incident-category', class: 'form-select', required: true, aria: { required: 'true' } }, [
            createElement('option', { value: '' }, ['Select category']),
            createElement('option', { value: 'medical' }, [t('incidents.categories.medical')]),
            createElement('option', { value: 'security' }, [t('incidents.categories.security')]),
            createElement('option', { value: 'infrastructure' }, [t('incidents.categories.infrastructure')]),
            createElement('option', { value: 'crowd' }, [t('incidents.categories.crowd')]),
            createElement('option', { value: 'weather' }, [t('incidents.categories.weather')]),
            createElement('option', { value: 'general' }, [t('incidents.categories.general')])
          ]),
          createElement('div', { id: 'incident-category-error', class: 'form-error', role: 'alert', aria: { live: 'polite' } })
        ]),
        createElement('div', { class: 'form-group' }, [
          createElement('label', { for: 'incident-severity', class: 'form-label' }, [`${t('incidents.severity')} *`]),
          createElement('select', { id: 'incident-severity', class: 'form-select', required: true, aria: { required: 'true' } }, [
            createElement('option', { value: '' }, ['Select severity']),
            createElement('option', { value: 'critical' }, [t('incidents.severities.critical')]),
            createElement('option', { value: 'high' }, [t('incidents.severities.high')]),
            createElement('option', { value: 'medium' }, [t('incidents.severities.medium')]),
            createElement('option', { value: 'low' }, [t('incidents.severities.low')])
          ]),
          createElement('div', { id: 'incident-severity-error', class: 'form-error', role: 'alert', aria: { live: 'polite' } })
        ])
      ]),
      createElement('div', { class: 'form-group', style: 'margin-bottom: var(--space-4);' }, [
        createElement('label', { for: 'incident-location', class: 'form-label' }, [`${t('incidents.location')} *`]),
        createElement('input', { type: 'text', id: 'incident-location', class: 'form-input', placeholder: 'e.g., Section 202, Restroom Block C', required: true, aria: { required: 'true' }, maxlength: '200' }),
        createElement('div', { id: 'incident-location-error', class: 'form-error', role: 'alert', aria: { live: 'polite' } })
      ]),
      createElement('div', { class: 'form-group', style: 'margin-bottom: var(--space-4);' }, [
        createElement('label', { for: 'incident-description', class: 'form-label' }, [`${t('incidents.description')} *`]),
        createElement('textarea', { id: 'incident-description', class: 'form-textarea', placeholder: 'Describe the incident in detail...', required: true, aria: { required: 'true' }, maxlength: '2000' }),
        createElement('div', { id: 'incident-description-error', class: 'form-error', role: 'alert', aria: { live: 'polite' } })
      ]),
      createElement('button', { type: 'submit', class: 'btn btn--primary btn--lg', id: 'incident-submit-btn' }, [`🚨 ${t('incidents.submit')}`])
    ]);

    const reportSection = createElement('section', { class: 'glass-card', aria: { labelledby: 'incident-form-heading' } }, [
      createElement('h3', { id: 'incident-form-heading', style: 'margin-bottom: var(--space-4);' }, [`🚨 ${t('incidents.reportNew')}`]),
      form
    ]);

    const logSection = createElement('section', { aria: { labelledby: 'incident-log-heading' } }, [
      createElement('div', { class: 'flex justify-between items-center mb-4' }, [
        createElement('h3', { id: 'incident-log-heading' }, [`📋 ${t('incidents.activeIncidents')}`]),
        createElement('div', { class: 'flex gap-2' }, [
          createElement('select', { id: 'incident-filter-severity', class: 'form-select', style: 'width: auto; font-size: var(--text-xs);', aria: { label: 'Filter by severity' } }, [
            createElement('option', { value: 'all' }, ['All Severities']),
            createElement('option', { value: 'critical' }, ['Critical']),
            createElement('option', { value: 'high' }, ['High']),
            createElement('option', { value: 'medium' }, ['Medium']),
            createElement('option', { value: 'low' }, ['Low'])
          ]),
          createElement('select', { id: 'incident-filter-status', class: 'form-select', style: 'width: auto; font-size: var(--text-xs);', aria: { label: 'Filter by status' } }, [
            createElement('option', { value: 'all' }, ['All Statuses']),
            createElement('option', { value: 'reported' }, ['Reported']),
            createElement('option', { value: 'acknowledged' }, ['Acknowledged']),
            createElement('option', { value: 'inProgress' }, ['In Progress']),
            createElement('option', { value: 'resolved' }, ['Resolved'])
          ])
        ])
      ]),
      createElement('div', { class: 'flex flex-col gap-3', id: 'incident-log', role: 'list', aria: { label: 'Incident log' } }, 
        incidents.map((inc) => renderIncidentCard(inc))
      )
    ]);

    return createElement('div', { class: 'flex flex-col gap-6' }, [
      createElement('div', { class: 'dashboard-grid dashboard-grid--4' }, statCards),
      reportSection,
      logSection
    ]);
  }

  function renderIncidentCard(incident) {
    const timeAgo = getTimeAgo(incident.reportedAt);
    const severityBadge = { critical: 'badge--danger', high: 'badge--warning', medium: 'badge--gold', low: 'badge--success' };
    const statusBadge = { reported: 'badge--info', acknowledged: 'badge--warning', inProgress: 'badge--gold', resolved: 'badge--success' };
    const categoryIcons = { medical: '🏥', security: '🛡️', infrastructure: '🔧', crowd: '👥', weather: '⛈️', general: '📝' };

    const actionButtons = [];
    if (incident.status !== 'resolved') {
      if (incident.status === 'reported') {
        actionButtons.push(createElement('button', { class: 'btn btn--secondary btn--sm', dataset: { action: 'acknowledge', id: incident.id }, type: 'button' }, ['✓ Acknowledge']));
      } else if (incident.status === 'acknowledged') {
        actionButtons.push(createElement('button', { class: 'btn btn--primary btn--sm', dataset: { action: 'inProgress', id: incident.id }, type: 'button' }, ['▶ Start Response']));
      } else if (incident.status === 'inProgress') {
        actionButtons.push(createElement('button', { class: 'btn btn--sm', style: 'background: var(--color-accent-green); color: var(--color-text-inverse);', dataset: { action: 'resolved', id: incident.id }, type: 'button' }, ['✓ Resolve']));
      }
    }

    const actionContainer = actionButtons.length > 0 
      ? createElement('div', { class: 'flex gap-2 mt-2' }, actionButtons) 
      : null;

    return createElement('article', { 
      class: 'incident-card', 
      role: 'listitem', 
      dataset: { incidentId: incident.id },
      aria: { label: `${incident.category} incident at ${incident.location}, severity ${incident.severity}, status ${incident.status}` }
    }, [
      createElement('div', { class: `incident-card__severity incident-card__severity--${incident.severity}`, aria: { hidden: 'true' } }),
      createElement('div', { style: 'flex: 1;' }, [
        createElement('div', { class: 'flex justify-between items-center mb-2' }, [
          createElement('div', { class: 'flex items-center gap-2' }, [
            createElement('span', {}, [categoryIcons[incident.category] || '📝']),
            createElement('span', { style: 'font-weight: var(--weight-semibold);' }, [t(`incidents.categories.${incident.category}`)])
          ]),
          createElement('div', { class: 'flex gap-2' }, [
            createElement('span', { class: `badge ${severityBadge[incident.severity]}` }, [t(`incidents.severities.${incident.severity}`)]),
            createElement('span', { class: `badge ${statusBadge[incident.status]}` }, [t(`incidents.statuses.${incident.status}`)])
          ])
        ]),
        createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-2);' }, [`📍 ${incident.location} · ⏱️ ${timeAgo}`]),
        createElement('p', { style: 'font-size: var(--text-sm); margin-bottom: var(--space-3);' }, [incident.description]),
        incident.protocol ? renderProtocol(incident.protocol) : null,
        actionContainer
      ])
    ]);
  }

  function renderProtocol(protocol) {
    const steps = protocol.steps.map(step => 
      createElement('li', { style: 'margin-bottom: var(--space-1);' }, [step])
    );

    return createElement('div', { class: 'glass-card', style: 'padding: var(--space-3); margin-top: var(--space-2); background: rgba(0, 229, 255, 0.05); border-color: rgba(0, 229, 255, 0.15);' }, [
      createElement('div', { class: 'flex justify-between items-center mb-2' }, [
        createElement('span', { style: 'font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-accent-cyan);' }, [`🤖 ${t('incidents.protocolTitle')}`]),
        createElement('span', { class: 'badge badge--info' }, [protocol.priority])
      ]),
      createElement('ol', { style: 'font-size: var(--text-xs); color: var(--color-text-secondary); padding-left: var(--space-4); margin-bottom: var(--space-2);' }, steps),
      createElement('div', { class: 'flex gap-4', style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [
        createElement('span', {}, [`⏱️ ${t('incidents.estimatedResponse')}: ${protocol.estimatedResponse}`]),
        createElement('span', {}, [`👤 ${t('incidents.personnelNeeded')}: ${protocol.personnelNeeded}`])
      ])
    ]);
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
      const newCard = renderIncidentCard(newIncident);
      if (logEl.firstChild) {
        logEl.insertBefore(newCard, logEl.firstChild);
      } else {
        logEl.appendChild(newCard);
      }
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
      replaceChildren(logEl, incidents.map((inc) => renderIncidentCard(inc)));
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
      if (filtered.length > 0) {
        replaceChildren(logEl, filtered.map((inc) => renderIncidentCard(inc)));
      } else {
        replaceChildren(logEl, [
          createElement('div', { class: 'text-center', style: 'padding: var(--space-8); color: var(--color-text-muted);' }, ['No incidents match the selected filters'])
        ]);
      }
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
