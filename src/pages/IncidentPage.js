/**
 * @fileoverview Incident Management full page wrapper.
 * @module pages/IncidentPage
 */
import IncidentReporter from '../components/IncidentReporter/IncidentReporter.js';
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';

export default function IncidentPage() {
  let incidentInstance = null;
  function render() {
    incidentInstance = IncidentReporter();
    return `
      <section class="page-header" aria-labelledby="incident-heading">
        <h1 id="incident-heading" class="page-header__title">🚨 ${escapeHTML(t('incidents.title'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('incidents.subtitle'))}</p>
      </section>
      ${incidentInstance.render()}
    `;
  }
  function mount() { if (incidentInstance) incidentInstance.mount(); }
  function unmount() { if (incidentInstance) { incidentInstance.unmount(); incidentInstance = null; } }
  return { render, mount, unmount };
}
