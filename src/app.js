/**
 * @fileoverview App shell: Header, Sidebar, role switcher, toast manager, and layout.
 * @module app
 */

import store from './core/store.js';
import router from './core/router.js';
import { t, getSupportedLocales, getLocaleName, setLocale, getLocale } from './core/i18n.js';
import { escapeHTML } from './core/security.js';
import { announceToScreenReader } from './core/accessibility.js';
import eventBus from './core/eventBus.js';

/**
 * Initializes the application shell.
 */
export function initApp() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  appEl.innerHTML = renderAppShell();
  initHeader();
  initSidebar();
  initToastManager();
  router.init();
}

/**
 * Renders the full app shell HTML.
 * @returns {string} HTML string
 */
function renderAppShell() {
  const role = store.getState('auth').role;

  return `
    <div class="app-layout">
      <header class="app-header" role="banner">
        <div class="flex items-center gap-4">
          <button class="btn btn--ghost btn--icon" id="sidebar-toggle" type="button"
            aria-label="Toggle sidebar navigation" aria-expanded="false" aria-controls="app-sidebar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <rect y="3" width="20" height="2" rx="1"/>
              <rect y="9" width="20" height="2" rx="1"/>
              <rect y="15" width="20" height="2" rx="1"/>
            </svg>
          </button>
          <div>
            <span style="font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--text-lg);">
              <span class="gradient-text">FIFA 2026</span>
            </span>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); margin-left: var(--space-2);">${escapeHTML(t('app.subtitle'))}</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <!-- Role Switcher -->
          <div class="role-switcher" role="tablist" aria-label="Mode selection">
            <button class="role-switcher__option ${role === 'fan' ? 'role-switcher__option--active' : ''}"
              id="role-fan-btn" role="tab" aria-selected="${role === 'fan'}" aria-controls="main-content"
              type="button">
              🎉 ${escapeHTML(t('nav.switchToFan'))}
            </button>
            <button class="role-switcher__option ${role === 'organizer' ? 'role-switcher__option--active' : ''}"
              id="role-org-btn" role="tab" aria-selected="${role === 'organizer'}" aria-controls="main-content"
              type="button">
              ⚙️ ${escapeHTML(t('nav.switchToOrg'))}
            </button>
          </div>

          <!-- Language Selector -->
          <select id="global-lang-select" class="form-select" style="width: auto; padding: var(--space-2); font-size: var(--text-xs); background: var(--color-bg-tertiary);"
            aria-label="Select interface language">
            ${getSupportedLocales().map((l) => `<option value="${l}" ${l === getLocale() ? 'selected' : ''}>${getLocaleName(l)}</option>`).join('')}
          </select>
        </div>
      </header>

      <aside class="app-sidebar" id="app-sidebar" role="navigation" aria-label="Main navigation">
        <div style="padding: 0 var(--space-4) var(--space-4);">
          <div style="font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-4);">
            ${role === 'fan' ? '🎉 Fan Experience' : '⚙️ Staff Operations'}
          </div>
        </div>
        <nav>
          <ul class="sidebar-nav" id="sidebar-nav" role="list">
            ${renderSidebarItems(role)}
          </ul>
        </nav>
      </aside>

      <main class="app-main" id="main-content" role="main" aria-label="Page content">
        <!-- Pages render here via router -->
      </main>
    </div>
  `;
}

/**
 * Renders sidebar navigation items based on role.
 * @param {string} role - Current user role
 * @returns {string} HTML string
 */
function renderSidebarItems(role) {
  const currentRoute = window.location.hash || (role === 'fan' ? '#/fan' : '#/org');

  const fanItems = [
    { path: '#/fan', icon: '🏠', label: t('nav.fanHome') },
    { path: '#/fan/assistant', icon: '🤖', label: t('nav.assistant') },
    { path: '#/fan/navigation', icon: '🗺️', label: t('nav.navigation') },
    { path: '#/fan/eco', icon: '🌱', label: t('nav.eco') }
  ];

  const orgItems = [
    { path: '#/org', icon: '🎯', label: t('nav.orgHome') },
    { path: '#/org/crowd', icon: '📊', label: t('nav.crowd') },
    { path: '#/org/incidents', icon: '🚨', label: t('nav.incidents') }
  ];

  const items = role === 'fan' ? fanItems : orgItems;

  return items.map((item) => `
    <li role="listitem">
      <a href="${item.path}" class="sidebar-nav__item ${currentRoute === item.path ? 'sidebar-nav__item--active' : ''}"
        aria-current="${currentRoute === item.path ? 'page' : 'false'}"
        data-route="${item.path}">
        <span class="sidebar-nav__icon" aria-hidden="true">${item.icon}</span>
        <span>${escapeHTML(item.label)}</span>
      </a>
    </li>
  `).join('');
}

/**
 * Initializes header interactions (role switching, language selection).
 */
function initHeader() {
  const fanBtn = document.getElementById('role-fan-btn');
  const orgBtn = document.getElementById('role-org-btn');
  const langSelect = document.getElementById('global-lang-select');

  if (fanBtn) {
    fanBtn.addEventListener('click', () => switchRole('fan'));
  }

  if (orgBtn) {
    orgBtn.addEventListener('click', () => switchRole('organizer'));
  }

  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLocale(e.target.value);
      announceToScreenReader(`Language changed to ${getLocaleName(e.target.value)}`);
      reinitializeApp();
    });
  }
}

/**
 * Switches the user role and re-renders the app.
 * @param {'fan'|'organizer'} newRole - Target role
 */
function switchRole(newRole) {
  const currentRole = store.getState('auth').role;
  if (currentRole === newRole) return;

  store.dispatch('auth.setRole', newRole);

  announceToScreenReader(`Switched to ${newRole === 'fan' ? 'Fan Experience' : 'Staff Operations'} mode`);

  store.dispatch('ui.addToast', {
    type: 'info',
    title: 'Mode Switched',
    message: `Now viewing ${newRole === 'fan' ? '🎉 Fan Experience' : '⚙️ Staff Operations'} mode`
  });

  reinitializeApp();

  const defaultRoute = newRole === 'fan' ? '#/fan' : '#/org';
  window.location.hash = defaultRoute;
}

/**
 * Reinitializes the app shell (used after role or language change).
 */
function reinitializeApp() {
  router.destroy();
  const appEl = document.getElementById('app');
  if (!appEl) return;
  appEl.innerHTML = renderAppShell();
  initHeader();
  initSidebar();
  initToastManager();
  router.init();
}

/**
 * Initializes sidebar toggle behavior and route highlighting.
 */
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('app-sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('app-sidebar--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      store.dispatch('ui.setSidebarOpen', isOpen);
    });
  }

  store.subscribe('ui', (ui) => {
    const navEl = document.getElementById('sidebar-nav');
    if (navEl) {
      const items = navEl.querySelectorAll('[data-route]');
      items.forEach((item) => {
        const isActive = item.getAttribute('data-route') === ui.currentRoute;
        item.classList.toggle('sidebar-nav__item--active', isActive);
        item.setAttribute('aria-current', isActive ? 'page' : 'false');
      });
    }
  });
}

/**
 * Initializes the toast notification manager.
 */
function initToastManager() {
  store.subscribe('ui', (ui) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const existingIds = new Set(Array.from(container.children).map((c) => c.id));
    const stateIds = new Set(ui.toasts.map((t) => `toast-${t.id}`));

    existingIds.forEach((id) => {
      if (!stateIds.has(id)) {
        const el = document.getElementById(id);
        if (el) {
          el.classList.add('toast--exiting');
          setTimeout(() => el.remove(), 300);
        }
      }
    });

    ui.toasts.forEach((toast) => {
      const toastId = `toast-${toast.id}`;
      if (!document.getElementById(toastId)) {
        const typeIcons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
        const toastHTML = `
          <div class="toast toast--${toast.type}" id="${toastId}" role="alert">
            <span class="toast__icon">${typeIcons[toast.type] || 'ℹ️'}</span>
            <div class="toast__body">
              <div class="toast__title">${escapeHTML(toast.title)}</div>
              <div class="toast__message">${escapeHTML(toast.message)}</div>
            </div>
            <button class="btn btn--ghost btn--sm" data-dismiss-toast="${toast.id}" type="button" aria-label="Dismiss notification" style="padding: var(--space-1);">✕</button>
          </div>
        `;
        container.insertAdjacentHTML('beforeend', toastHTML);

        const dismissBtn = container.querySelector(`[data-dismiss-toast="${toast.id}"]`);
        if (dismissBtn) {
          dismissBtn.addEventListener('click', () => {
            store.dispatch('ui.removeToast', toast.id);
          });
        }

        setTimeout(() => {
          store.dispatch('ui.removeToast', toast.id);
        }, toast.duration || 5000);
      }
    });
  });
}

export { switchRole, reinitializeApp };
