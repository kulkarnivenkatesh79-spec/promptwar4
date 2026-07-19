/**
 * @fileoverview Hash-based SPA router with role-based guards, lazy-loading, and 404 fallback.
 * @module core/router
 */

import store from './store.js';
import { announceToScreenReader, manageFocusOnRouteChange } from './accessibility.js';
import { createElement, replaceChildren } from './dom.js';

/**
 * @typedef {Object} RouteConfig
 * @property {string} path - Hash path pattern
 * @property {Function} loader - Dynamic import function returning the page module
 * @property {string} title - Page title for document.title and screen readers
 * @property {string} requiredRole - Required role ('fan', 'organizer', or 'any')
 */

/** @type {RouteConfig[]} */
const routes = [
  {
    path: '#/fan',
    loader: () => import('../pages/FanHome.js'),
    title: 'Fan Experience Dashboard',
    requiredRole: 'fan'
  },
  {
    path: '#/fan/assistant',
    loader: () => import('../pages/AssistantPage.js'),
    title: 'AI Assistant',
    requiredRole: 'fan'
  },
  {
    path: '#/fan/navigation',
    loader: () => import('../pages/NavigationPage.js'),
    title: 'Smart Navigation',
    requiredRole: 'fan'
  },
  {
    path: '#/fan/eco',
    loader: () => import('../pages/EcoPage.js'),
    title: 'Sustainability Tracker',
    requiredRole: 'fan'
  },
  {
    path: '#/org',
    loader: () => import('../pages/OrgHome.js'),
    title: 'Operations Command Center',
    requiredRole: 'organizer'
  },
  {
    path: '#/org/crowd',
    loader: () => import('../pages/CrowdPage.js'),
    title: 'Crowd Intelligence',
    requiredRole: 'organizer'
  },
  {
    path: '#/org/incidents',
    loader: () => import('../pages/IncidentPage.js'),
    title: 'Incident Management',
    requiredRole: 'organizer'
  }
];

/** @type {Function[]} */
const beforeNavigateHooks = [];

/** @type {Object|null} Current page module instance */
let currentPageInstance = null;

/** @type {Map<string, Object>} Cache for loaded page modules */
const moduleCache = new Map();

/**
 * Matches a hash path to a route configuration.
 * @param {string} hash - Current hash value
 * @returns {RouteConfig|null} Matched route or null
 */
function matchRoute(hash) {
  const normalizedHash = hash || '#/fan';
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].path === normalizedHash) {
      return routes[i];
    }
  }
  return null;
}

/**
 * Gets the default route for the current role.
 * @returns {string} Default hash path
 */
function getDefaultRouteForRole() {
  const role = store.getState('auth').role;
  return role === 'organizer' ? '#/org' : '#/fan';
}

/**
 * Checks if the current role is authorized for a route.
 * @param {RouteConfig} route - Route to check
 * @returns {boolean} True if authorized
 */
function isAuthorized(route) {
  if (route.requiredRole === 'any') return true;
  const currentRole = store.getState('auth').role;
  return route.requiredRole === currentRole;
}

/**
 * Runs all registered beforeNavigate hooks.
 * @param {string} from - Current path
 * @param {string} to - Target path
 * @returns {Promise<boolean>} True if navigation should proceed
 */
async function runBeforeHooks(from, to) {
  for (const hook of beforeNavigateHooks) {
    try {
      const result = await hook(from, to);
      if (result === false) return false;
    } catch (err) {
      console.error('[Router] beforeNavigate hook error:', err);
      return false;
    }
  }
  return true;
}

/**
 * Navigates to a route, loading the page module and rendering it.
 * @param {string} hash - Target hash path
 * @param {Object} [options] - Navigation options
 * @param {boolean} [options.replace=false] - Use replaceState instead of pushState
 * @param {boolean} [options.skipHooks=false] - Skip beforeNavigate hooks
 */
async function navigateTo(hash, options = {}) {
  const { replace = false, skipHooks = false } = options;
  const currentHash = window.location.hash || '#/fan';

  if (!skipHooks) {
    const canProceed = await runBeforeHooks(currentHash, hash);
    if (!canProceed) return;
  }

  const route = matchRoute(hash);

  if (!route) {
    renderNotFound();
    return;
  }

  if (!isAuthorized(route)) {
    const defaultRoute = getDefaultRouteForRole();
    window.location.hash = defaultRoute;
    return;
  }

  if (currentPageInstance && typeof currentPageInstance.unmount === 'function') {
    try {
      currentPageInstance.unmount();
    } catch (err) {
      console.error('[Router] Error unmounting page:', err);
    }
    currentPageInstance = null;
  }

  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;

  replaceChildren(mainEl, [
    createElement('div', { class: 'flex justify-center items-center', style: 'min-height: 300px;', role: 'status', aria: { label: 'Loading page' } }, [
      createElement('div', { class: 'btn-spinner', style: 'width: 32px; height: 32px; border-width: 3px;' }),
      createElement('span', { class: 'sr-only' }, ['Loading page content'])
    ])
  ]);

  try {
    let pageModule;
    if (moduleCache.has(route.path)) {
      pageModule = moduleCache.get(route.path);
    } else {
      pageModule = await route.loader();
      moduleCache.set(route.path, pageModule);
    }

    const page = pageModule.default || pageModule;
    const instance = typeof page === 'function' ? page() : page;

    if (typeof instance.render === 'function') {
      const content = instance.render();
      if (content instanceof Node) {
        replaceChildren(mainEl, [content]);
      } else if (typeof content === 'string') {
        mainEl.innerHTML = content;
      }
    }

    if (typeof instance.mount === 'function') {
      instance.mount(mainEl);
    }

    currentPageInstance = instance;

    document.title = `${route.title} — FIFA 2026 Smart Stadium`;
    store.dispatch('ui.setRoute', hash);

    if (!replace) {
      window.location.hash = hash;
    }

    manageFocusOnRouteChange();
    announceToScreenReader(`Navigated to ${route.title}`);

  } catch (err) {
    console.error('[Router] Failed to load page:', err);
    const retryButton = createElement('button', { class: 'btn btn--primary', id: 'retry-page-btn', type: 'button' }, ['Retry']);
    retryButton.addEventListener('click', () => {
      moduleCache.delete(hash);
      navigateTo(hash, { skipHooks: true });
    });
    replaceChildren(mainEl, [
      createElement('section', { class: 'glass-card text-center', style: 'max-width: 500px; margin: var(--space-16) auto;', role: 'alert' }, [
        createElement('h2', { style: 'color: var(--color-accent-red); margin-bottom: var(--space-4);' }, ['⚠️ Page Load Error']),
        createElement('p', { style: 'margin-bottom: var(--space-6);' }, ["We couldn't load this page. Please try again."]),
        retryButton
      ])
    ]);
    // retry listener already attached above
    announceToScreenReader('Page failed to load. Retry button available.');
  }
}

/**
 * Renders a 404 not-found page.
 */
function renderNotFound() {
  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;

  if (currentPageInstance && typeof currentPageInstance.unmount === 'function') {
    currentPageInstance.unmount();
    currentPageInstance = null;
  }

  const homeBtn = createElement('button', { class: 'btn btn--primary', id: 'go-home-btn', type: 'button' }, ['Go to Dashboard']);
  homeBtn.addEventListener('click', () => {
    const defaultRoute = getDefaultRouteForRole();
    window.location.hash = defaultRoute;
  });

  replaceChildren(mainEl, [
    createElement('section', { class: 'glass-card text-center', style: 'max-width: 500px; margin: var(--space-16) auto;', role: 'alert' }, [
      createElement('h1', { style: 'font-size: var(--text-4xl); margin-bottom: var(--space-2);' }, ['🏟️']),
      createElement('h2', { style: 'margin-bottom: var(--space-4);' }, ['Page Not Found']),
      createElement('p', { style: 'margin-bottom: var(--space-6);' }, ["The page you're looking for doesn't exist or has been moved."]),
      homeBtn
    ])
  ]);

  document.title = '404 — FIFA 2026 Smart Stadium';

  announceToScreenReader('Page not found. Navigation button available.');
}

/**
 * Registers a beforeNavigate hook.
 * @param {Function} hook - Hook function (from, to) => boolean|Promise<boolean>
 * @returns {Function} Unregister function
 */
function beforeNavigate(hook) {
  beforeNavigateHooks.push(hook);
  return () => {
    const idx = beforeNavigateHooks.indexOf(hook);
    if (idx >= 0) beforeNavigateHooks.splice(idx, 1);
  };
}

/**
 * Programmatic navigation.
 * @param {string} path - Hash path
 */
function push(path) {
  window.location.hash = path;
}

/**
 * Replace current route without history entry.
 * @param {string} path - Hash path
 */
function replace(path) {
  navigateTo(path, { replace: true });
}

/**
 * Returns the current active route path.
 * @returns {string}
 */
function getCurrentRoute() {
  return window.location.hash || '#/fan';
}

/**
 * Handles hashchange events.
 */
function onHashChange() {
  const hash = window.location.hash || getDefaultRouteForRole();
  navigateTo(hash);
}

/**
 * Initializes the router and starts listening for hash changes.
 */
function init() {
  window.addEventListener('hashchange', onHashChange);

  const hash = window.location.hash || getDefaultRouteForRole();
  if (!window.location.hash) {
    window.location.hash = hash;
  } else {
    navigateTo(hash, { skipHooks: true });
  }
}

/**
 * Destroys the router, removing event listeners.
 */
function destroy() {
  window.removeEventListener('hashchange', onHashChange);
  if (currentPageInstance && typeof currentPageInstance.unmount === 'function') {
    currentPageInstance.unmount();
    currentPageInstance = null;
  }
  moduleCache.clear();
  beforeNavigateHooks.length = 0;
}

const router = {
  init,
  destroy,
  push,
  replace,
  beforeNavigate,
  getCurrentRoute,
  navigateTo,
  matchRoute,
  getDefaultRouteForRole,
  isAuthorized,
  routes
};

export default router;
export { routes };
