/**
 * @fileoverview Organizer Command Center — landing page for staff mode.
 * @module pages/OrgHome
 */
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';
import { generateCrowdData, generateVenueSummaries } from '../data/mockCrowdData.js';
import { getIncidentStats, sampleIncidents } from '../data/mockIncidents.js';

export default function OrgHome() {
  const cleanupFns = [];

  function render() {
    const crowd = generateCrowdData('metlife');
    const stats = getIncidentStats(sampleIncidents);
    const venueSummaries = generateVenueSummaries();
    const criticalVenues = venueSummaries.filter((v) => v.percentage >= 80).length;
    const activeVenues = venueSummaries.filter((v) => v.hasMatch).length;
    const totalFans = venueSummaries.reduce((s, v) => s + v.current, 0);

    const gateBadges = Object.values(crowd.gates).slice(0, 3).map((g) => {
      const badgeClass = g.percentage >= 95 ? 'badge--danger' : g.percentage >= 80 ? 'badge--warning' : 'badge--success';
      return createElement('span', { class: `badge ${badgeClass}` }, [`${g.name}: ${g.percentage}%`]);
    });

    const categoryIcons = { medical: '🏥', security: '🛡️', infrastructure: '🔧', crowd: '👥', weather: '⛈️', general: '📝' };
    const severityBadge = { critical: 'badge--danger', high: 'badge--warning', medium: 'badge--gold', low: 'badge--success' };

    const incidentItems = sampleIncidents.slice(0, 4).map((inc) =>
      createElement('div', { class: 'glass-card flex items-center justify-between', style: 'padding: var(--space-3) var(--space-4);' }, [
        createElement('div', { class: 'flex items-center gap-3' }, [
          createElement('span', {}, [categoryIcons[inc.category] || '📝']),
          createElement('div', {}, [
            createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm);' }, [t(`incidents.categories.${inc.category}`)]),
            createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [`📍 ${inc.location}`])
          ])
        ]),
        createElement('span', { class: `badge ${severityBadge[inc.severity]}` }, [t(`incidents.severities.${inc.severity}`)])
      ])
    );

    return createElement('div', {}, [
      // Page Header
      createElement('section', { class: 'page-header', aria: { labelledby: 'org-home-heading' } }, [
        createElement('h1', { id: 'org-home-heading', class: 'page-header__title' }, [`🎯 ${t('nav.orgHome')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('crowd.subtitle')])
      ]),

      // Quick Stats
      createElement('div', { class: 'dashboard-grid dashboard-grid--4' }, [
        createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Total venues active: ${activeVenues}` } }, [
          createElement('span', { class: 'stat-card__label' }, ['Active Venues']),
          createElement('span', { class: 'stat-card__value' }, [String(activeVenues)]),
          createElement('span', { class: 'stat-card__delta stat-card__delta--up' }, ['of 16 total'])
        ]),
        createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Total fans across venues: ${totalFans.toLocaleString()}` } }, [
          createElement('span', { class: 'stat-card__label' }, ['Total Fans']),
          createElement('span', { class: 'stat-card__value' }, [`${(totalFans / 1000).toFixed(0)}K`])
        ]),
        createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Active incidents: ${stats.active}` } }, [
          createElement('span', { class: 'stat-card__label' }, [t('incidents.activeIncidents')]),
          createElement('span', { class: 'stat-card__value', style: stats.critical > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : '' }, [String(stats.active)]),
          stats.critical > 0
            ? createElement('span', { class: 'badge badge--danger' }, [`${stats.critical} critical`])
            : createElement('span', { class: 'badge badge--success' }, ['All stable'])
        ]),
        createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Venues at high capacity: ${criticalVenues}` } }, [
          createElement('span', { class: 'stat-card__label' }, ['High Capacity Venues']),
          createElement('span', { class: 'stat-card__value', style: criticalVenues > 0 ? '-webkit-text-fill-color: var(--color-accent-orange);' : '' }, [String(criticalVenues)])
        ])
      ]),

      // Quick Links
      createElement('div', { class: 'dashboard-grid dashboard-grid--2', style: 'margin-top: var(--space-6);' }, [
        createElement('article', { class: 'glass-card', role: 'button', tabindex: '0', dataset: { nav: '#/org/crowd' }, style: 'cursor: pointer;', aria: { label: 'Open Crowd Intelligence Dashboard' } }, [
          createElement('div', { style: 'font-size: 2rem; margin-bottom: var(--space-2);' }, ['📊']),
          createElement('h3', { style: 'font-size: var(--text-lg);' }, [t('nav.crowd')]),
          createElement('p', { style: 'font-size: var(--text-sm); color: var(--color-text-muted);' }, ['Real-time gate monitoring, crowd heatmaps, and AI redistribution']),
          createElement('div', { class: 'flex gap-2 mt-4' }, gateBadges)
        ]),
        createElement('article', { class: 'glass-card', role: 'button', tabindex: '0', dataset: { nav: '#/org/incidents' }, style: 'cursor: pointer;', aria: { label: 'Open Incident Management' } }, [
          createElement('div', { style: 'font-size: 2rem; margin-bottom: var(--space-2);' }, ['🚨']),
          createElement('h3', { style: 'font-size: var(--text-lg);' }, [t('nav.incidents')]),
          createElement('p', { style: 'font-size: var(--text-sm); color: var(--color-text-muted);' }, ['Report, track, and resolve incidents with AI-generated protocols']),
          createElement('div', { class: 'flex gap-2 mt-4' }, [
            createElement('span', { class: 'badge badge--danger' }, [`${stats.bySeverity.critical} Critical`]),
            createElement('span', { class: 'badge badge--warning' }, [`${stats.bySeverity.high} High`]),
            createElement('span', { class: 'badge badge--info' }, [`${stats.bySeverity.medium + stats.bySeverity.low} Other`])
          ])
        ])
      ]),

      // Recent Incidents Preview
      createElement('section', { style: 'margin-top: var(--space-6);', aria: { labelledby: 'recent-incidents-heading' } }, [
        createElement('h2', { id: 'recent-incidents-heading', style: 'margin-bottom: var(--space-4);' }, ['⚡ Recent Incidents']),
        createElement('div', { class: 'flex flex-col gap-2' }, incidentItems)
      ])
    ]);
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
