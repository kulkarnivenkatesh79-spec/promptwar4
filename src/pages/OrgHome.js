/**
 * @fileoverview Organizer Command Center — landing page for staff mode.
 * @module pages/OrgHome
 */
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';
import { generateCrowdData, generateVenueSummaries } from '../data/mockCrowdData.js';
import { getIncidentStats, sampleIncidents } from '../data/mockIncidents.js';

export default function OrgHome() {
  const cleanupFns = [];

  function render() {
    const crowd = generateCrowdData('metlife');
    const stats = getIncidentStats(sampleIncidents);
    const venueSummaries = generateVenueSummaries();
    const criticalVenues = venueSummaries.filter((v) => v.percentage >= 80).length;

    return `
      <section class="page-header" aria-labelledby="org-home-heading">
        <h1 id="org-home-heading" class="page-header__title">🎯 ${escapeHTML(t('nav.orgHome'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('crowd.subtitle'))}</p>
      </section>

      <!-- Quick Stats -->
      <div class="dashboard-grid dashboard-grid--4">
        <article class="glass-card stat-card" role="article" aria-label="Total venues active: ${venueSummaries.filter(v => v.hasMatch).length}">
          <span class="stat-card__label">Active Venues</span>
          <span class="stat-card__value">${venueSummaries.filter((v) => v.hasMatch).length}</span>
          <span class="stat-card__delta stat-card__delta--up">of 16 total</span>
        </article>
        <article class="glass-card stat-card" role="article" aria-label="Total fans across venues: ${venueSummaries.reduce((s,v)=>s+v.current,0).toLocaleString()}">
          <span class="stat-card__label">Total Fans</span>
          <span class="stat-card__value">${(venueSummaries.reduce((s,v) => s + v.current, 0) / 1000).toFixed(0)}K</span>
        </article>
        <article class="glass-card stat-card" role="article" aria-label="Active incidents: ${stats.active}">
          <span class="stat-card__label">${escapeHTML(t('incidents.activeIncidents'))}</span>
          <span class="stat-card__value" style="${stats.critical > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : ''}">${stats.active}</span>
          ${stats.critical > 0 ? `<span class="badge badge--danger">${stats.critical} critical</span>` : '<span class="badge badge--success">All stable</span>'}
        </article>
        <article class="glass-card stat-card" role="article" aria-label="Venues at high capacity: ${criticalVenues}">
          <span class="stat-card__label">High Capacity Venues</span>
          <span class="stat-card__value" style="${criticalVenues > 0 ? '-webkit-text-fill-color: var(--color-accent-orange);' : ''}">${criticalVenues}</span>
        </article>
      </div>

      <!-- Quick Links -->
      <div class="dashboard-grid dashboard-grid--2" style="margin-top: var(--space-6);">
        <article class="glass-card" role="button" tabindex="0" data-nav="#/org/crowd"
          style="cursor: pointer;" aria-label="Open Crowd Intelligence Dashboard">
          <div style="font-size: 2rem; margin-bottom: var(--space-2);">📊</div>
          <h3 style="font-size: var(--text-lg);">${escapeHTML(t('nav.crowd'))}</h3>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Real-time gate monitoring, crowd heatmaps, and AI redistribution</p>
          <div class="flex gap-2 mt-4">
            ${Object.values(crowd.gates).slice(0, 3).map((g) => `
              <span class="badge ${g.percentage >= 95 ? 'badge--danger' : g.percentage >= 80 ? 'badge--warning' : 'badge--success'}">${g.name}: ${g.percentage}%</span>
            `).join('')}
          </div>
        </article>
        <article class="glass-card" role="button" tabindex="0" data-nav="#/org/incidents"
          style="cursor: pointer;" aria-label="Open Incident Management">
          <div style="font-size: 2rem; margin-bottom: var(--space-2);">🚨</div>
          <h3 style="font-size: var(--text-lg);">${escapeHTML(t('nav.incidents'))}</h3>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted);">Report, track, and resolve incidents with AI-generated protocols</p>
          <div class="flex gap-2 mt-4">
            <span class="badge badge--danger">${stats.bySeverity.critical} Critical</span>
            <span class="badge badge--warning">${stats.bySeverity.high} High</span>
            <span class="badge badge--info">${stats.bySeverity.medium + stats.bySeverity.low} Other</span>
          </div>
        </article>
      </div>

      <!-- Recent Incidents Preview -->
      <section style="margin-top: var(--space-6);" aria-labelledby="recent-incidents-heading">
        <h2 id="recent-incidents-heading" style="margin-bottom: var(--space-4);">⚡ Recent Incidents</h2>
        <div class="flex flex-col gap-2">
          ${sampleIncidents.slice(0, 4).map((inc) => {
            const categoryIcons = { medical: '🏥', security: '🛡️', infrastructure: '🔧', crowd: '👥', weather: '⛈️', general: '📝' };
            const severityBadge = { critical: 'badge--danger', high: 'badge--warning', medium: 'badge--gold', low: 'badge--success' };
            return `
              <div class="glass-card flex items-center justify-between" style="padding: var(--space-3) var(--space-4);">
                <div class="flex items-center gap-3">
                  <span>${categoryIcons[inc.category] || '📝'}</span>
                  <div>
                    <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm);">${escapeHTML(t(`incidents.categories.${inc.category}`))}</div>
                    <div style="font-size: var(--text-xs); color: var(--color-text-muted);">📍 ${escapeHTML(inc.location)}</div>
                  </div>
                </div>
                <span class="badge ${severityBadge[inc.severity]}">${escapeHTML(t(`incidents.severities.${inc.severity}`))}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  function mount() {
    const cards = document.querySelectorAll('[data-nav]');
    cards.forEach((card) => {
      const handler = () => { window.location.hash = card.getAttribute('data-nav'); };
      const keyHandler = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } };
      card.addEventListener('click', handler);
      card.addEventListener('keydown', keyHandler);
      cleanupFns.push(() => { card.removeEventListener('click', handler); card.removeEventListener('keydown', keyHandler); });
    });
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) {} });
    cleanupFns.length = 0;
  }

  return { render, mount, unmount };
}
