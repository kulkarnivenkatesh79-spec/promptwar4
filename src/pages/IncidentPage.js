/**
 * @fileoverview Incident Management full page wrapper.
 * @module pages/IncidentPage
 */
import IncidentReporter from '../components/IncidentReporter/IncidentReporter.js';
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function IncidentPage() {
  let incidentInstance = null;
  function render() {
    incidentInstance = IncidentReporter();
    return createElement('div', {}, [
      createElement('section', { class: 'page-header', aria: { labelledby: 'incident-heading' } }, [
        createElement('h1', { id: 'incident-heading', class: 'page-header__title' }, [`🚨 ${t('incidents.title')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('incidents.subtitle')])
      ]),
      incidentInstance.render()
    ]);
  }
  function mount() { if (incidentInstance) incidentInstance.mount(); }
  function unmount() { if (incidentInstance) { incidentInstance.unmount(); incidentInstance = null; } }
  return { render, mount, unmount };
}
