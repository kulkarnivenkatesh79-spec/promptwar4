/**
 * @fileoverview Fan Experience Dashboard — landing page for fan mode.
 * @module pages/FanHome
 */

import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function FanHome() {
  const cleanupFns = [];

  /**
   * Renders a nearby service card.
   * @param {string} icon - Emoji icon
   * @param {string} name - Service name
   * @param {string} location - Location text
   * @param {string} distance - Distance text
   * @returns {HTMLElement} Card element
   */
  function renderServiceCard(icon, name, location, distance) {
    return createElement('article', {
      class: 'glass-card',
      style: 'text-align: center; padding: var(--space-4);',
      role: 'article',
      aria: { label: `${name} at ${location}, ${distance}` }
    }, [
      createElement('div', { style: 'font-size: 1.75rem; margin-bottom: var(--space-2);' }, [icon]),
      createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm);' }, [name]),
      createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [location]),
      createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-accent-cyan); margin-top: var(--space-1);' }, [distance])
    ]);
  }

  /**
   * Renders a quick action card.
   * @param {string} icon - Emoji icon
   * @param {string} labelKey - i18n key for label
   * @param {string} description - Card description
   * @param {string} route - Hash route
   * @returns {HTMLElement} Card element
   */
  function renderQuickAction(icon, labelKey, description, route) {
    return createElement('article', {
      class: 'glass-card',
      role: 'button',
      tabindex: '0',
      dataset: { nav: route },
      aria: { label: `${t(labelKey)} — ${description}` },
      style: 'cursor: pointer; text-align: center;'
    }, [
      createElement('div', { style: 'font-size: 2.5rem; margin-bottom: var(--space-3);' }, [icon]),
      createElement('h3', { style: 'font-size: var(--text-lg); margin-bottom: var(--space-2);' }, [t(labelKey)]),
      createElement('p', { style: 'font-size: var(--text-sm);' }, [description])
    ]);
  }

  function render() {
    return createElement('div', {}, [
      // Page Header
      createElement('section', { class: 'page-header', aria: { labelledby: 'fan-home-heading' } }, [
        createElement('h1', { id: 'fan-home-heading', class: 'page-header__title' }, [`⚽ ${t('fan.welcome')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('fan.subtitle')])
      ]),

      // Quick Action Cards
      createElement('section', { aria: { label: t('fan.quickActions') } }, [
        createElement('h2', { style: 'margin-bottom: var(--space-4); font-size: var(--text-xl);' }, [`🚀 ${t('fan.quickActions')}`]),
        createElement('div', { class: 'dashboard-grid dashboard-grid--3' }, [
          renderQuickAction('🤖', 'fan.askAssistant', 'Get answers about schedules, venues, transit, and more in 12 languages', '#/fan/assistant'),
          renderQuickAction('🗺️', 'fan.findWay', 'Accessible routes, crowd-aware pathways, and real-time shuttle times', '#/fan/navigation'),
          renderQuickAction('🌱', 'fan.trackEco', 'Earn green points, track carbon savings, and unlock achievements', '#/fan/eco')
        ])
      ]),

      // Match Day Info
      createElement('section', { class: 'glass-card mt-8', style: 'margin-top: var(--space-8);', aria: { labelledby: 'match-day-heading' } }, [
        createElement('h2', { id: 'match-day-heading', style: 'margin-bottom: var(--space-4);' }, [`🏟️ ${t('fan.matchDay')}`]),
        createElement('div', { class: 'dashboard-grid dashboard-grid--2' }, [
          createElement('div', {}, [
            createElement('div', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em;' }, [t('fan.todayMatch')]),
            createElement('div', { style: 'font-size: var(--text-2xl); font-weight: var(--weight-bold); font-family: var(--font-display); margin: var(--space-2) 0;' }, ['🇧🇷 Brazil vs. 🇩🇪 Germany']),
            createElement('div', { class: 'flex gap-4', style: 'font-size: var(--text-sm); color: var(--color-text-secondary);' }, [
              createElement('span', {}, [`⏰ ${t('fan.kickoff')}: 18:00 ET`]),
              createElement('span', {}, [`🏟️ ${t('fan.venue')}: MetLife Stadium`])
            ]),
            createElement('div', { style: 'font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2);' }, [`🌤️ ${t('fan.weather')}: 26°C, Partly Cloudy`])
          ]),
          createElement('div', { style: 'display: flex; flex-direction: column; gap: var(--space-3);' }, [
            createElement('div', { class: 'flex justify-between', style: 'font-size: var(--text-sm);' }, [
              createElement('span', { style: 'color: var(--color-text-muted);' }, ['Group Stage — Group E, Matchday 2'])
            ]),
            createElement('div', { class: 'flex justify-between items-center', style: 'font-size: var(--text-sm);' }, [
              createElement('span', {}, ['Stadium Capacity']),
              createElement('span', { style: 'font-weight: var(--weight-bold);' }, ['82,500'])
            ]),
            createElement('div', { class: 'capacity-bar', role: 'progressbar', aria: { valuenow: '72', valuemin: '0', valuemax: '100', label: '72% stadium capacity filled' } }, [
              createElement('div', { class: 'capacity-bar__fill capacity-bar__fill--warning', style: 'width: 72%;' })
            ]),
            createElement('span', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); text-align: right;' }, ['72% filled — Gates open at 15:00'])
          ])
        ])
      ]),

      // Nearby Services
      createElement('section', { style: 'margin-top: var(--space-8);', aria: { labelledby: 'services-heading' } }, [
        createElement('h2', { id: 'services-heading', style: 'margin-bottom: var(--space-4);' }, [`📍 ${t('fan.nearbyServices')}`]),
        createElement('div', { class: 'dashboard-grid dashboard-grid--4' }, [
          renderServiceCard('🏥', 'First Aid', 'Section 101, Level 1', '2 min walk'),
          renderServiceCard('🚻', 'Restrooms', 'Concourse B', '1 min walk'),
          renderServiceCard('🍔', 'Food Court', 'Gate C Area', '3 min walk'),
          renderServiceCard('🛍️', 'Merchandise', 'Fan Zone East', '4 min walk'),
          renderServiceCard('💧', 'Water Station', 'All Concourses', 'Nearest: 30m'),
          renderServiceCard('🔋', 'Charging', 'Section 201', '2 min walk'),
          renderServiceCard('👶', 'Family Zone', 'Gate A Area', '5 min walk'),
          renderServiceCard('ℹ️', 'Info Desk', 'Main Entrance', '1 min walk')
        ])
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
