/**
 * @fileoverview Crowd Intelligence full page wrapper.
 * @module pages/CrowdPage
 */
import CrowdDashboard from '../components/CrowdDashboard/CrowdDashboard.js';
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function CrowdPage() {
  let crowdInstance = null;
  function render() {
    crowdInstance = CrowdDashboard();
    return createElement('div', {}, [
      createElement('section', { class: 'page-header', aria: { labelledby: 'crowd-heading' } }, [
        createElement('h1', { id: 'crowd-heading', class: 'page-header__title' }, [`📊 ${t('crowd.title')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('crowd.subtitle')])
      ]),
      crowdInstance.render()
    ]);
  }
  function mount() { if (crowdInstance) crowdInstance.mount(); }
  function unmount() { if (crowdInstance) { crowdInstance.unmount(); crowdInstance = null; } }
  return { render, mount, unmount };
}
