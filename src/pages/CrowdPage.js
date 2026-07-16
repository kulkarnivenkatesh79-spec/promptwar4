/**
 * @fileoverview Crowd Intelligence full page wrapper.
 * @module pages/CrowdPage
 */
import CrowdDashboard from '../components/CrowdDashboard/CrowdDashboard.js';
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';

export default function CrowdPage() {
  let crowdInstance = null;
  function render() {
    crowdInstance = CrowdDashboard();
    return `
      <section class="page-header" aria-labelledby="crowd-heading">
        <h1 id="crowd-heading" class="page-header__title">📊 ${escapeHTML(t('crowd.title'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('crowd.subtitle'))}</p>
      </section>
      ${crowdInstance.render()}
    `;
  }
  function mount() { if (crowdInstance) crowdInstance.mount(); }
  function unmount() { if (crowdInstance) { crowdInstance.unmount(); crowdInstance = null; } }
  return { render, mount, unmount };
}
