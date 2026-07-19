/**
 * @fileoverview Sustainability full page wrapper.
 * @module pages/EcoPage
 */
import EcoTracker from '../components/EcoTracker/EcoTracker.js';
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function EcoPage() {
  let ecoInstance = null;
  function render() {
    ecoInstance = EcoTracker();
    return createElement('div', {}, [
      createElement('section', { class: 'page-header', aria: { labelledby: 'eco-heading' } }, [
        createElement('h1', { id: 'eco-heading', class: 'page-header__title' }, [`🌱 ${t('eco.title')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('eco.subtitle')])
      ]),
      ecoInstance.render()
    ]);
  }
  function mount() { if (ecoInstance) ecoInstance.mount(); }
  function unmount() { if (ecoInstance) { ecoInstance.unmount(); ecoInstance = null; } }
  return { render, mount, unmount };
}
