/**
 * @fileoverview Operational Intelligence dashboard with real-time crowd management,
 * gate capacities, choke-point detection, and AI redistribution suggestions.
 * @module components/CrowdDashboard/CrowdDashboard
 */

import { escapeHTML } from '../../core/security.js';
import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { generateCrowdData, generateVenueSummaries } from '../../data/mockCrowdData.js';
import { venues } from '../../data/venues.js';

/**
 * Creates the Crowd Dashboard component.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function CrowdDashboard() {
  const cleanupFns = [];
  let refreshInterval = null;
  let crowdData = generateCrowdData('metlife');

  function render() {
    const venueSummaries = generateVenueSummaries();

    return `
      <div class="flex flex-col gap-6">
        <!-- Venue Selector -->
        <div class="flex items-center justify-between">
          <div class="form-group" style="min-width: 250px;">
            <label for="venue-select" class="form-label">${escapeHTML(t('common.selectVenue'))}</label>
            <select id="venue-select" class="form-select" aria-label="Select venue for crowd monitoring">
              ${venues.map((v) => `<option value="${v.id}" ${v.id === 'metlife' ? 'selected' : ''}>${escapeHTML(v.name)} — ${escapeHTML(v.city)}</option>`).join('')}
            </select>
          </div>
          <div class="flex items-center gap-3">
            <span id="crowd-last-updated" style="font-size: var(--text-xs); color: var(--color-text-muted);">Updated just now</span>
            <button class="btn btn--secondary btn--sm" id="crowd-refresh-btn" type="button" aria-label="${escapeHTML(t('crowd.refreshData'))}">
              🔄 ${escapeHTML(t('crowd.refreshData'))}
            </button>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="dashboard-grid dashboard-grid--4" id="crowd-metrics">
          ${renderMetrics(crowdData)}
        </div>

        <!-- Gate Status Grid -->
        <section aria-labelledby="gate-status-heading">
          <h3 id="gate-status-heading" style="margin-bottom: var(--space-4);">
            🚪 ${escapeHTML(t('crowd.gateStatus'))}
          </h3>
          <div class="dashboard-grid dashboard-grid--3" id="gate-status-grid">
            ${Object.entries(crowdData.gates).map(([key, gate]) => renderGateCard(key, gate)).join('')}
          </div>
        </section>

        <!-- AI Suggestions -->
        <section aria-labelledby="ai-suggestions-heading">
          <h3 id="ai-suggestions-heading" style="margin-bottom: var(--space-4);">
            🤖 ${escapeHTML(t('crowd.redistribution'))} — ${escapeHTML(t('crowd.suggestion'))}
          </h3>
          <div class="flex flex-col gap-3" id="ai-suggestions">
            ${crowdData.aiSuggestions.map((s) => renderSuggestion(s)).join('')}
          </div>
        </section>

        <!-- All Venues Overview -->
        <section aria-labelledby="venues-overview-heading">
          <h3 id="venues-overview-heading" style="margin-bottom: var(--space-4);">
            🏟️ All Venues Overview
          </h3>
          <div class="dashboard-grid dashboard-grid--auto" id="venues-overview">
            ${venueSummaries.map((v) => renderVenueSummaryCard(v)).join('')}
          </div>
        </section>
      </div>
    `;
  }

  function renderMetrics(data) {
    const occupancyPct = data.occupancyPercentage;
    const statusBadge = occupancyPct >= 95 ? 'badge--danger' : occupancyPct >= 80 ? 'badge--warning' : 'badge--success';
    const statusText = occupancyPct >= 95 ? t('crowd.critical') : occupancyPct >= 80 ? t('crowd.warning') : t('crowd.normal');
    const chokeCount = data.chokePoints.length;
    const avgWait = Object.values(data.gates).reduce((sum, g) => sum + g.waitTime, 0) / Object.values(data.gates).length;

    return `
      <article class="glass-card stat-card" role="article" aria-label="Total capacity: ${data.totalCapacity.toLocaleString()}">
        <span class="stat-card__label">${escapeHTML(t('crowd.totalCapacity'))}</span>
        <span class="stat-card__value">${(data.totalCapacity / 1000).toFixed(0)}K</span>
      </article>
      <article class="glass-card stat-card" role="article" aria-label="Current occupancy: ${data.currentOccupancy.toLocaleString()}, ${occupancyPct}%">
        <span class="stat-card__label">${escapeHTML(t('crowd.currentOccupancy'))}</span>
        <span class="stat-card__value">${(data.currentOccupancy / 1000).toFixed(1)}K</span>
        <span class="badge ${statusBadge}" style="width: fit-content;">${occupancyPct}% — ${escapeHTML(statusText)}</span>
      </article>
      <article class="glass-card stat-card" role="article" aria-label="Choke points detected: ${chokeCount}">
        <span class="stat-card__label">${escapeHTML(t('crowd.chokePoints'))}</span>
        <span class="stat-card__value" style="${chokeCount > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : ''}">${chokeCount}</span>
        <span class="stat-card__delta ${chokeCount > 0 ? 'stat-card__delta--down' : 'stat-card__delta--up'}">${chokeCount > 0 ? '⚠ Attention needed' : '✓ All clear'}</span>
      </article>
      <article class="glass-card stat-card" role="article" aria-label="Average gate wait time: ${Math.round(avgWait)} minutes">
        <span class="stat-card__label">Avg Wait Time</span>
        <span class="stat-card__value">${Math.round(avgWait)}<span style="font-size: var(--text-sm); -webkit-text-fill-color: var(--color-text-muted);">min</span></span>
      </article>
    `;
  }

  function renderGateCard(key, gate) {
    const barClass = gate.percentage >= 95 ? 'capacity-bar__fill--critical' : gate.percentage >= 80 ? 'capacity-bar__fill--warning' : 'capacity-bar__fill--ok';
    const statusBadge = gate.status === 'critical' ? 'badge--danger' : gate.status === 'warning' ? 'badge--warning' : 'badge--success';

    return `
      <article class="glass-card" role="article" aria-label="${gate.name}: ${gate.percentage}% capacity, throughput ${gate.throughput} per hour, wait time ${gate.waitTime} minutes">
        <div class="flex justify-between items-center mb-2">
          <h4 style="font-size: var(--text-lg);">${escapeHTML(gate.name)}</h4>
          <span class="badge ${statusBadge}">${escapeHTML(t(`crowd.${gate.status}`))}</span>
        </div>
        <div class="capacity-bar mb-2" role="progressbar" aria-valuenow="${gate.percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${gate.percentage}% capacity">
          <div class="capacity-bar__fill ${barClass}" style="width: ${gate.percentage}%;"></div>
        </div>
        <div style="font-size: var(--text-xs); color: var(--color-text-muted); display: flex; justify-content: space-between;">
          <span>${gate.current.toLocaleString()} / ${gate.capacity.toLocaleString()}</span>
          <span>${gate.percentage}%</span>
        </div>
        <div class="flex justify-between mt-4" style="font-size: var(--text-xs);">
          <div>
            <div style="color: var(--color-text-muted);">${escapeHTML(t('crowd.throughput'))}</div>
            <div style="font-weight: var(--weight-semibold);">${gate.throughput}/hr</div>
          </div>
          <div>
            <div style="color: var(--color-text-muted);">${escapeHTML(t('crowd.waitTime'))}</div>
            <div style="font-weight: var(--weight-semibold);">${gate.waitTime} min</div>
          </div>
          <div>
            <div style="color: var(--color-text-muted);">Trend</div>
            <div style="font-weight: var(--weight-semibold); color: ${gate.trend === 'up' ? 'var(--color-accent-red)' : 'var(--color-accent-green)'};">${gate.trend === 'up' ? '↑ Rising' : '↓ Falling'}</div>
          </div>
        </div>
      </article>
    `;
  }

  function renderSuggestion(suggestion) {
    const priorityColors = { critical: 'var(--color-accent-red)', high: 'var(--color-accent-orange)', medium: 'var(--color-accent-gold)', low: 'var(--color-accent-green)' };
    const priorityBadge = { critical: 'badge--danger', high: 'badge--warning', medium: 'badge--gold', low: 'badge--success' };

    return `
      <article class="glass-card" style="border-left: 3px solid ${priorityColors[suggestion.priority]};"
        role="article" aria-label="AI Suggestion: ${escapeHTML(suggestion.title)}. Priority: ${suggestion.priority}. ${escapeHTML(suggestion.message)}">
        <div class="flex justify-between items-center mb-2">
          <h4 style="font-size: var(--text-base);">${escapeHTML(suggestion.title)}</h4>
          <span class="badge ${priorityBadge[suggestion.priority]}">${suggestion.priority.toUpperCase()}</span>
        </div>
        <p style="font-size: var(--text-sm); margin-bottom: var(--space-3);">${escapeHTML(suggestion.message)}</p>
        <div class="flex justify-between items-center" style="font-size: var(--text-xs);">
          <span style="color: var(--color-accent-cyan);">💡 Action: ${escapeHTML(suggestion.action)}</span>
          <span style="color: var(--color-text-muted);">Impact: ${escapeHTML(suggestion.estimatedImpact)}</span>
        </div>
      </article>
    `;
  }

  function renderVenueSummaryCard(venue) {
    const barClass = venue.percentage >= 95 ? 'capacity-bar__fill--critical' : venue.percentage >= 80 ? 'capacity-bar__fill--warning' : 'capacity-bar__fill--ok';

    return `
      <article class="glass-card" style="padding: var(--space-4);" role="article"
        aria-label="${escapeHTML(venue.name)}, ${venue.city}: ${venue.percentage}% occupied">
        <div class="flex justify-between items-center mb-2">
          <div>
            <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm);">${escapeHTML(venue.name)}</div>
            <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHTML(venue.city)}, ${escapeHTML(venue.country)}</div>
          </div>
          ${venue.hasMatch ? '<span class="badge badge--success">LIVE</span>' : '<span class="badge badge--info">Upcoming</span>'}
        </div>
        <div class="capacity-bar" role="progressbar" aria-valuenow="${venue.percentage}" aria-valuemin="0" aria-valuemax="100">
          <div class="capacity-bar__fill ${barClass}" style="width: ${venue.percentage}%;"></div>
        </div>
        <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-1); text-align: right;">${venue.percentage}%</div>
      </article>
    `;
  }

  function refreshData(venueId) {
    crowdData = generateCrowdData(venueId || 'metlife');

    const metricsEl = document.getElementById('crowd-metrics');
    if (metricsEl) metricsEl.innerHTML = renderMetrics(crowdData);

    const gateGrid = document.getElementById('gate-status-grid');
    if (gateGrid) gateGrid.innerHTML = Object.entries(crowdData.gates).map(([key, gate]) => renderGateCard(key, gate)).join('');

    const suggestionsEl = document.getElementById('ai-suggestions');
    if (suggestionsEl) suggestionsEl.innerHTML = crowdData.aiSuggestions.map((s) => renderSuggestion(s)).join('');

    const updatedEl = document.getElementById('crowd-last-updated');
    if (updatedEl) updatedEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;

    announceToScreenReader(`Crowd data refreshed. Stadium at ${crowdData.occupancyPercentage}% capacity. ${crowdData.chokePoints.length} choke points.`);
  }

  function mount() {
    const refreshBtn = document.getElementById('crowd-refresh-btn');
    if (refreshBtn) {
      const handleRefresh = () => {
        const select = document.getElementById('venue-select');
        refreshData(select?.value || 'metlife');
      };
      refreshBtn.addEventListener('click', handleRefresh);
      cleanupFns.push(() => refreshBtn.removeEventListener('click', handleRefresh));
    }

    const venueSelect = document.getElementById('venue-select');
    if (venueSelect) {
      const handleVenueChange = (e) => {
        refreshData(e.target.value);
      };
      venueSelect.addEventListener('change', handleVenueChange);
      cleanupFns.push(() => venueSelect.removeEventListener('change', handleVenueChange));
    }

    refreshInterval = setInterval(() => {
      const select = document.getElementById('venue-select');
      refreshData(select?.value || 'metlife');
    }, 10000);

    cleanupFns.push(() => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    });
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns.length = 0;
  }

  return { render, mount, unmount };
}
