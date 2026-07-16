/**
 * @fileoverview Sustainability full page wrapper.
 * @module pages/EcoPage
 */
import EcoTracker from '../components/EcoTracker/EcoTracker.js';
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';

export default function EcoPage() {
  let ecoInstance = null;
  function render() {
    ecoInstance = EcoTracker();
    return `
      <section class="page-header" aria-labelledby="eco-heading">
        <h1 id="eco-heading" class="page-header__title">🌱 ${escapeHTML(t('eco.title'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('eco.subtitle'))}</p>
      </section>
      ${ecoInstance.render()}
    `;
  }
  function mount() { if (ecoInstance) ecoInstance.mount(); }
  function unmount() { if (ecoInstance) { ecoInstance.unmount(); ecoInstance = null; } }
  return { render, mount, unmount };
}
