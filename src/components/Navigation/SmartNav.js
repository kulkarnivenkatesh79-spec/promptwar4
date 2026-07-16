/**
 * @fileoverview Smart Navigation component with accessible routing, crowd density,
 * and shuttle/transit waiting times.
 * @module components/Navigation/SmartNav
 */

import { escapeHTML } from '../../core/security.js';
import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';

/**
 * Creates the Smart Navigation component.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function SmartNav() {
  const cleanupFns = [];
  let countdownInterval = null;

  const routes = [
    { id: 'r1', from: 'Main Entrance', to: 'Section 101', distance: '250m', walkingTime: 4, crowdLevel: 'low', accessible: true, features: ['elevator', 'ramp'], description: 'Widest corridor, fully accessible' },
    { id: 'r2', from: 'Gate B', to: 'Section 205', distance: '180m', walkingTime: 3, crowdLevel: 'medium', accessible: true, features: ['ramp'], description: 'Slight incline, ramp available' },
    { id: 'r3', from: 'Parking Lot C', to: 'Gate D', distance: '400m', walkingTime: 6, crowdLevel: 'high', accessible: false, features: ['stairs'], description: 'Outdoor path, stairs at entry' },
    { id: 'r4', from: 'Gate A', to: 'VIP Lounge', distance: '120m', walkingTime: 2, crowdLevel: 'low', accessible: true, features: ['elevator'], description: 'Express elevator to Level 3' },
    { id: 'r5', from: 'Fan Zone East', to: 'Section 303', distance: '350m', walkingTime: 5, crowdLevel: 'medium', accessible: true, features: ['ramp', 'elevator'], description: 'Through concourse, well-signed' },
    { id: 'r6', from: 'Transit Hub', to: 'Gate C', distance: '500m', walkingTime: 7, crowdLevel: 'low', accessible: true, features: ['ramp'], description: 'Covered walkway, flat surface' }
  ];

  const shuttles = [
    { id: 's1', name: 'Metro Line A → Gate A', nextArrival: 3, frequency: 8, capacity: 'Available', type: 'metro' },
    { id: 's2', name: 'Shuttle Bus B → Gate B', nextArrival: 7, frequency: 12, capacity: 'Crowded', type: 'shuttle' },
    { id: 's3', name: 'Express Bus C → Gate C', nextArrival: 2, frequency: 15, capacity: 'Available', type: 'express' },
    { id: 's4', name: 'Fan Zone Shuttle', nextArrival: 11, frequency: 10, capacity: 'Available', type: 'shuttle' },
    { id: 's5', name: 'Parking Shuttle D', nextArrival: 5, frequency: 6, capacity: 'Almost Full', type: 'shuttle' }
  ];

  function render() {
    return `
      <div class="flex flex-col gap-6">
        <!-- Accessible Routes -->
        <section aria-labelledby="nav-routes-heading">
          <h3 id="nav-routes-heading" style="margin-bottom: var(--space-4);">
            ♿ ${escapeHTML(t('navigation.accessibleRoutes'))}
          </h3>
          <div class="dashboard-grid dashboard-grid--auto" id="routes-grid">
            ${routes.map((route) => renderRouteCard(route)).join('')}
          </div>
        </section>

        <!-- Shuttle & Transit Times -->
        <section aria-labelledby="nav-shuttle-heading">
          <h3 id="nav-shuttle-heading" style="margin-bottom: var(--space-4);">
            🚌 ${escapeHTML(t('navigation.shuttleTimes'))}
          </h3>
          <div class="flex flex-col gap-3" id="shuttle-list">
            ${shuttles.map((shuttle) => renderShuttleCard(shuttle)).join('')}
          </div>
        </section>

        <!-- Crowd Density Summary -->
        <section aria-labelledby="nav-density-heading">
          <h3 id="nav-density-heading" style="margin-bottom: var(--space-4);">
            📊 ${escapeHTML(t('navigation.crowdDensity'))}
          </h3>
          <div class="dashboard-grid dashboard-grid--3">
            ${renderDensityCard('Gate A Area', 'low', 35)}
            ${renderDensityCard('Main Concourse', 'medium', 62)}
            ${renderDensityCard('Gate D Corridor', 'high', 88)}
          </div>
        </section>
      </div>
    `;
  }

  function renderRouteCard(route) {
    const crowdColorMap = { low: 'var(--color-accent-green)', medium: 'var(--color-accent-orange)', high: 'var(--color-accent-red)' };
    const crowdColor = crowdColorMap[route.crowdLevel] || 'var(--color-text-muted)';

    return `
      <article class="glass-card" role="article"
        aria-label="Route from ${escapeHTML(route.from)} to ${escapeHTML(route.to)}, ${route.walkingTime} minutes walking, crowd level ${route.crowdLevel}${route.accessible ? ', wheelchair accessible' : ''}">
        <div class="flex justify-between items-center mb-2">
          <span class="badge badge--info">${escapeHTML(route.distance)}</span>
          ${route.accessible ? '<span class="badge badge--gold">♿ Accessible</span>' : '<span class="badge badge--warning">⚠ Not Accessible</span>'}
        </div>
        <div style="margin-bottom: var(--space-2);">
          <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHTML(t('navigation.from'))}</div>
          <div style="font-weight: var(--weight-semibold);">${escapeHTML(route.from)}</div>
        </div>
        <div style="margin-bottom: var(--space-3);">
          <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHTML(t('navigation.to'))}</div>
          <div style="font-weight: var(--weight-semibold);">${escapeHTML(route.to)}</div>
        </div>
        <div class="flex justify-between items-center" style="font-size: var(--text-xs);">
          <span>🚶 ${route.walkingTime} min</span>
          <span style="color: ${crowdColor};">● ${escapeHTML(t(`navigation.${route.crowdLevel}`))}</span>
        </div>
        <div class="flex gap-2 mt-2">
          ${route.features.map((f) => `<span class="badge badge--info" style="font-size: 0.65rem;">${getFeatureIcon(f)} ${escapeHTML(t(`navigation.${f}`))}</span>`).join('')}
        </div>
        <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-2);">${escapeHTML(route.description)}</p>
      </article>
    `;
  }

  function renderShuttleCard(shuttle) {
    const typeIcons = { metro: '🚇', shuttle: '🚌', express: '🚀' };
    const capacityColors = { 'Available': 'var(--color-accent-green)', 'Crowded': 'var(--color-accent-orange)', 'Almost Full': 'var(--color-accent-red)' };

    return `
      <div class="glass-card flex items-center justify-between" role="article"
        aria-label="${escapeHTML(shuttle.name)}, next arrival in ${shuttle.nextArrival} minutes, ${shuttle.capacity}">
        <div class="flex items-center gap-3">
          <span style="font-size: var(--text-2xl);">${typeIcons[shuttle.type] || '🚌'}</span>
          <div>
            <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm);">${escapeHTML(shuttle.name)}</div>
            <div style="font-size: var(--text-xs); color: var(--color-text-muted);">Every ${shuttle.frequency} min</div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="badge" style="color: ${capacityColors[shuttle.capacity] || 'var(--color-text-muted)'}; background: transparent; border-color: ${capacityColors[shuttle.capacity]};">${escapeHTML(shuttle.capacity)}</span>
          <div style="text-align: center;">
            <div class="stat-card__value" style="font-size: var(--text-2xl);" id="shuttle-countdown-${shuttle.id}">${shuttle.nextArrival}</div>
            <div style="font-size: var(--text-xs); color: var(--color-text-muted);">min</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDensityCard(area, level, percentage) {
    const barClass = percentage >= 85 ? 'capacity-bar__fill--critical' : percentage >= 60 ? 'capacity-bar__fill--warning' : 'capacity-bar__fill--ok';

    return `
      <article class="glass-card" role="article" aria-label="${escapeHTML(area)}, crowd density ${percentage}%, level ${level}">
        <div style="font-weight: var(--weight-semibold); margin-bottom: var(--space-2);">${escapeHTML(area)}</div>
        <div class="capacity-bar" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100" aria-label="${percentage}% crowd density">
          <div class="capacity-bar__fill ${barClass}" style="width: ${percentage}%;"></div>
        </div>
        <div class="flex justify-between mt-2" style="font-size: var(--text-xs); color: var(--color-text-muted);">
          <span>${escapeHTML(t(`navigation.${level}`))}</span>
          <span>${percentage}%</span>
        </div>
      </article>
    `;
  }

  function getFeatureIcon(feature) {
    const icons = { elevator: '🛗', ramp: '♿', stairs: '🪜' };
    return icons[feature] || '📍';
  }

  function mount() {
    let countdownState = {};
    shuttles.forEach((s) => { countdownState[s.id] = s.nextArrival; });

    countdownInterval = setInterval(() => {
      shuttles.forEach((shuttle) => {
        countdownState[shuttle.id]--;
        if (countdownState[shuttle.id] <= 0) {
          countdownState[shuttle.id] = shuttle.frequency;
        }
        const el = document.getElementById(`shuttle-countdown-${shuttle.id}`);
        if (el) {
          el.textContent = countdownState[shuttle.id];
        }
      });
    }, 60000);

    cleanupFns.push(() => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    });

    announceToScreenReader('Smart Navigation loaded. Showing accessible routes and transit times.');
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns.length = 0;
  }

  return { render, mount, unmount };
}
