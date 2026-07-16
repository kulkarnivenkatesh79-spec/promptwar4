/**
 * @fileoverview Fan Experience Dashboard — landing page for fan mode.
 * @module pages/FanHome
 */

import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';
import store from '../core/store.js';

export default function FanHome() {
  const cleanupFns = [];

  function render() {
    return `
      <section class="page-header" aria-labelledby="fan-home-heading">
        <h1 id="fan-home-heading" class="page-header__title">
          ⚽ ${escapeHTML(t('fan.welcome'))}
        </h1>
        <p class="page-header__subtitle">${escapeHTML(t('fan.subtitle'))}</p>
      </section>

      <!-- Quick Action Cards -->
      <section aria-label="${escapeHTML(t('fan.quickActions'))}">
        <h2 style="margin-bottom: var(--space-4); font-size: var(--text-xl);">🚀 ${escapeHTML(t('fan.quickActions'))}</h2>
        <div class="dashboard-grid dashboard-grid--3">
          <article class="glass-card" role="button" tabindex="0" data-nav="#/fan/assistant"
            aria-label="${escapeHTML(t('fan.askAssistant'))} — Get answers from our AI about schedules, venues, transit, and more"
            style="cursor: pointer; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: var(--space-3);">🤖</div>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${escapeHTML(t('fan.askAssistant'))}</h3>
            <p style="font-size: var(--text-sm);">Get answers about schedules, venues, transit, and more in 12 languages</p>
          </article>
          <article class="glass-card" role="button" tabindex="0" data-nav="#/fan/navigation"
            aria-label="${escapeHTML(t('fan.findWay'))} — Smart navigation with accessible routes and live crowd data"
            style="cursor: pointer; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: var(--space-3);">🗺️</div>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${escapeHTML(t('fan.findWay'))}</h3>
            <p style="font-size: var(--text-sm);">Accessible routes, crowd-aware pathways, and real-time shuttle times</p>
          </article>
          <article class="glass-card" role="button" tabindex="0" data-nav="#/fan/eco"
            aria-label="${escapeHTML(t('fan.trackEco'))} — Track your sustainability impact and earn green points"
            style="cursor: pointer; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: var(--space-3);">🌱</div>
            <h3 style="font-size: var(--text-lg); margin-bottom: var(--space-2);">${escapeHTML(t('fan.trackEco'))}</h3>
            <p style="font-size: var(--text-sm);">Earn green points, track carbon savings, and unlock achievements</p>
          </article>
        </div>
      </section>

      <!-- Match Day Info -->
      <section class="glass-card mt-8" aria-labelledby="match-day-heading" style="margin-top: var(--space-8);">
        <h2 id="match-day-heading" style="margin-bottom: var(--space-4);">🏟️ ${escapeHTML(t('fan.matchDay'))}</h2>
        <div class="dashboard-grid dashboard-grid--2">
          <div>
            <div style="font-size: var(--text-xs); color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.08em;">${escapeHTML(t('fan.todayMatch'))}</div>
            <div style="font-size: var(--text-2xl); font-weight: var(--weight-bold); font-family: var(--font-display); margin: var(--space-2) 0;">
              🇧🇷 Brazil vs. 🇩🇪 Germany
            </div>
            <div class="flex gap-4" style="font-size: var(--text-sm); color: var(--color-text-secondary);">
              <span>⏰ ${escapeHTML(t('fan.kickoff'))}: 18:00 ET</span>
              <span>🏟️ ${escapeHTML(t('fan.venue'))}: MetLife Stadium</span>
            </div>
            <div style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: var(--space-2);">
              🌤️ ${escapeHTML(t('fan.weather'))}: 26°C, Partly Cloudy
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-3);">
            <div class="flex justify-between" style="font-size: var(--text-sm);">
              <span style="color: var(--color-text-muted);">Group Stage — Group E, Matchday 2</span>
            </div>
            <div class="flex justify-between items-center" style="font-size: var(--text-sm);">
              <span>Stadium Capacity</span>
              <span style="font-weight: var(--weight-bold);">82,500</span>
            </div>
            <div class="capacity-bar" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100" aria-label="72% stadium capacity filled">
              <div class="capacity-bar__fill capacity-bar__fill--warning" style="width: 72%;"></div>
            </div>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); text-align: right;">72% filled — Gates open at 15:00</span>
          </div>
        </div>
      </section>

      <!-- Nearby Services -->
      <section style="margin-top: var(--space-8);" aria-labelledby="services-heading">
        <h2 id="services-heading" style="margin-bottom: var(--space-4);">📍 ${escapeHTML(t('fan.nearbyServices'))}</h2>
        <div class="dashboard-grid dashboard-grid--4">
          ${renderServiceCard('🏥', 'First Aid', 'Section 101, Level 1', '2 min walk')}
          ${renderServiceCard('🚻', 'Restrooms', 'Concourse B', '1 min walk')}
          ${renderServiceCard('🍔', 'Food Court', 'Gate C Area', '3 min walk')}
          ${renderServiceCard('🛍️', 'Merchandise', 'Fan Zone East', '4 min walk')}
          ${renderServiceCard('💧', 'Water Station', 'All Concourses', 'Nearest: 30m')}
          ${renderServiceCard('🔋', 'Charging', 'Section 201', '2 min walk')}
          ${renderServiceCard('👶', 'Family Zone', 'Gate A Area', '5 min walk')}
          ${renderServiceCard('ℹ️', 'Info Desk', 'Main Entrance', '1 min walk')}
        </div>
      </section>
    `;
  }

  function renderServiceCard(icon, name, location, distance) {
    return `
      <article class="glass-card" style="text-align: center; padding: var(--space-4);"
        role="article" aria-label="${name} at ${location}, ${distance}">
        <div style="font-size: 1.75rem; margin-bottom: var(--space-2);">${icon}</div>
        <div style="font-weight: var(--weight-semibold); font-size: var(--text-sm);">${escapeHTML(name)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHTML(location)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-accent-cyan); margin-top: var(--space-1);">${escapeHTML(distance)}</div>
      </article>
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
