/**
 * @fileoverview Smart Navigation full page with stadium map and routing.
 * @module pages/NavigationPage
 */
import SmartNav from '../components/Navigation/SmartNav.js';
import StadiumMap from '../components/StadiumMap/StadiumMap.js';
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';

export default function NavigationPage() {
  let navInstance = null;
  let mapInstance = null;
  function render() {
    navInstance = SmartNav();
    mapInstance = StadiumMap();
    return `
      <section class="page-header" aria-labelledby="nav-heading">
        <h1 id="nav-heading" class="page-header__title">🗺️ ${escapeHTML(t('navigation.title'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('navigation.subtitle'))}</p>
      </section>
      <div class="dashboard-grid dashboard-grid--2" style="grid-template-columns: 1fr 1fr;">
        <div>${mapInstance.render()}</div>
        <div>${navInstance.render()}</div>
      </div>
    `;
  }
  function mount() { if (navInstance) navInstance.mount(); if (mapInstance) mapInstance.mount(); }
  function unmount() { if (navInstance) { navInstance.unmount(); navInstance = null; } if (mapInstance) { mapInstance.unmount(); mapInstance = null; } }
  return { render, mount, unmount };
}
