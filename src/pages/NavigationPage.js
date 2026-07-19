/**
 * @fileoverview Smart Navigation full page with stadium map and routing.
 * @module pages/NavigationPage
 */
import DynamicTransitRouter from '../components/Navigation/SmartNav.js';
import StadiumMap from '../components/StadiumMap/StadiumMap.js';
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function NavigationPage() {
  let navInstance = null;
  let mapInstance = null;
  function render() {
    navInstance = DynamicTransitRouter();
    mapInstance = StadiumMap();
    return createElement('div', {}, [
      createElement('section', { class: 'page-header', aria: { labelledby: 'nav-heading' } }, [
        createElement('h1', { id: 'nav-heading', class: 'page-header__title' }, [`🗺️ ${t('navigation.title')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('navigation.subtitle')])
      ]),
      createElement('div', { class: 'dashboard-grid dashboard-grid--2', style: 'grid-template-columns: 1fr 1fr;' }, [
        createElement('div', {}, [mapInstance.render()]),
        createElement('div', {}, [navInstance.render()])
      ])
    ]);
  }
  function mount() { if (navInstance) navInstance.mount(); if (mapInstance) mapInstance.mount(); }
  function unmount() { if (navInstance) { navInstance.unmount(); navInstance = null; } if (mapInstance) { mapInstance.unmount(); mapInstance = null; } }
  return { render, mount, unmount };
}
