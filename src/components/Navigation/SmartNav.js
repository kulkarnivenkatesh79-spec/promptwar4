/**
 * @fileoverview Smart Navigation component with accessible routing, crowd density,
 * and shuttle/transit waiting times.
 * @module components/Navigation/SmartNav
 */

import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { createElement, replaceChildren } from '../../core/dom.js';

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

  // Realistic transit schedules (Metro, Bus, Shuttle)
  const shuttles = [
    { id: 's1', name: 'Metro Line A → Central Station', nextArrival: 3, frequency: 8, capacity: 'Available', type: 'metro' },
    { id: 's2', name: 'Shuttle Bus B → Airport Hub', nextArrival: 7, frequency: 12, capacity: 'Crowded', type: 'shuttle' },
    { id: 's3', name: 'Express Bus C → Downtown Plaza', nextArrival: 2, frequency: 15, capacity: 'Available', type: 'express' },
    { id: 's4', name: 'Fan Zone Circular Shuttle', nextArrival: 11, frequency: 10, capacity: 'Available', type: 'shuttle' },
    { id: 's5', name: 'Parking Shuttle D (Lot 1-4)', nextArrival: 5, frequency: 6, capacity: 'Almost Full', type: 'shuttle' },
    { id: 's6', name: 'Metro Line B → North Suburbs', nextArrival: 1, frequency: 10, capacity: 'Available', type: 'metro' },
    { id: 's7', name: 'Intercity Rail (High Speed)', nextArrival: 24, frequency: 60, capacity: 'Available', type: 'express' }
  ];

  function render() {
    const routeSection = createElement('section', { aria: { labelledby: 'nav-routes-heading' } }, [
      createElement('h3', { id: 'nav-routes-heading', style: 'margin-bottom: var(--space-4);' }, [`♿ ${t('navigation.accessibleRoutes')}`]),
      createElement('div', { class: 'dashboard-grid dashboard-grid--auto', id: 'routes-grid' }, 
        routes.map((route) => renderRouteCard(route))
      )
    ]);

    const shuttleSection = createElement('section', { aria: { labelledby: 'nav-shuttle-heading' } }, [
      createElement('h3', { id: 'nav-shuttle-heading', style: 'margin-bottom: var(--space-4);' }, [`🚌 ${t('navigation.shuttleTimes')}`]),
      createElement('div', { class: 'flex flex-col gap-3', id: 'shuttle-list' }, 
        shuttles.map((shuttle) => renderShuttleCard(shuttle))
      )
    ]);

    const densitySection = createElement('section', { aria: { labelledby: 'nav-density-heading' } }, [
      createElement('h3', { id: 'nav-density-heading', style: 'margin-bottom: var(--space-4);' }, [`📊 ${t('navigation.crowdDensity')}`]),
      createElement('div', { class: 'dashboard-grid dashboard-grid--3' }, [
        renderDensityCard('Gate A Area', 'low', 35),
        renderDensityCard('Main Concourse', 'medium', 62),
        renderDensityCard('Gate D Corridor', 'high', 88)
      ])
    ]);

    return createElement('div', { class: 'flex flex-col gap-6' }, [
      routeSection,
      shuttleSection,
      densitySection
    ]);
  }

  function renderRouteCard(route) {
    const crowdColorMap = { low: 'var(--color-accent-green)', medium: 'var(--color-accent-orange)', high: 'var(--color-accent-red)' };
    const crowdColor = crowdColorMap[route.crowdLevel] || 'var(--color-text-muted)';

    const accessibleBadge = route.accessible 
      ? createElement('span', { class: 'badge badge--gold' }, ['♿ Accessible']) 
      : createElement('span', { class: 'badge badge--warning' }, ['⚠ Not Accessible']);

    const featureBadges = route.features.map(f => 
      createElement('span', { class: 'badge badge--info', style: 'font-size: 0.65rem;' }, [`${getFeatureIcon(f)} ${t(`navigation.${f}`)}`])
    );

    return createElement('article', { 
      class: 'glass-card', 
      role: 'article',
      aria: { label: `Route from ${route.from} to ${route.to}, ${route.walkingTime} minutes walking, crowd level ${route.crowdLevel}${route.accessible ? ', wheelchair accessible' : ''}` }
    }, [
      createElement('div', { class: 'flex justify-between items-center mb-2' }, [
        createElement('span', { class: 'badge badge--info' }, [route.distance]),
        accessibleBadge
      ]),
      createElement('div', { style: 'margin-bottom: var(--space-2);' }, [
        createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [t('navigation.from')]),
        createElement('div', { style: 'font-weight: var(--weight-semibold);' }, [route.from])
      ]),
      createElement('div', { style: 'margin-bottom: var(--space-3);' }, [
        createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [t('navigation.to')]),
        createElement('div', { style: 'font-weight: var(--weight-semibold);' }, [route.to])
      ]),
      createElement('div', { class: 'flex justify-between items-center', style: 'font-size: var(--text-xs);' }, [
        createElement('span', {}, [`🚶 ${route.walkingTime} min`]),
        createElement('span', { style: `color: ${crowdColor};` }, [`● ${t(`navigation.${route.crowdLevel}`)}`])
      ]),
      createElement('div', { class: 'flex gap-2 mt-2' }, featureBadges),
      createElement('p', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-top: var(--space-2);' }, [route.description])
    ]);
  }

  function renderShuttleCard(shuttle) {
    const typeIcons = { metro: '🚇', shuttle: '🚌', express: '🚀' };
    const capacityColors = { 'Available': 'var(--color-accent-green)', 'Crowded': 'var(--color-accent-orange)', 'Almost Full': 'var(--color-accent-red)' };

    const typeIcon = typeIcons[shuttle.type] || '🚌';
    const capacityColor = capacityColors[shuttle.capacity] || 'var(--color-text-muted)';

    return createElement('div', { 
      class: 'glass-card flex items-center justify-between', 
      role: 'article',
      aria: { label: `${shuttle.name}, next arrival in ${shuttle.nextArrival} minutes, ${shuttle.capacity}` }
    }, [
      createElement('div', { class: 'flex items-center gap-3' }, [
        createElement('span', { style: 'font-size: var(--text-2xl);' }, [typeIcon]),
        createElement('div', {}, [
          createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm);' }, [shuttle.name]),
          createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [`Every ${shuttle.frequency} min`])
        ])
      ]),
      createElement('div', { class: 'flex items-center gap-4' }, [
        createElement('span', { class: 'badge', style: `color: ${capacityColor}; background: transparent; border-color: ${capacityColor};` }, [shuttle.capacity]),
        createElement('div', { style: 'text-align: center;' }, [
          createElement('div', { class: 'stat-card__value', style: 'font-size: var(--text-2xl);', id: `shuttle-countdown-${shuttle.id}` }, [shuttle.nextArrival]),
          createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, ['min'])
        ])
      ])
    ]);
  }

  function renderDensityCard(area, level, percentage) {
    const barClass = percentage >= 85 ? 'capacity-bar__fill--critical' : percentage >= 60 ? 'capacity-bar__fill--warning' : 'capacity-bar__fill--ok';

    return createElement('article', { class: 'glass-card', role: 'article', aria: { label: `${area}, crowd density ${percentage}%, level ${level}` } }, [
      createElement('div', { style: 'font-weight: var(--weight-semibold); margin-bottom: var(--space-2);' }, [area]),
      createElement('div', { class: 'capacity-bar', role: 'progressbar', aria: { valuenow: String(percentage), valuemin: '0', valuemax: '100', label: `${percentage}% crowd density` } }, [
        createElement('div', { class: `capacity-bar__fill ${barClass}`, style: `width: ${percentage}%;` })
      ]),
      createElement('div', { class: 'flex justify-between mt-2', style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [
        createElement('span', {}, [t(`navigation.${level}`)]),
        createElement('span', {}, [`${percentage}%`])
      ])
    ]);
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
