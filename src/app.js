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
import { createElement, replaceChildren } from './core/dom.js';

/**
 * Executes a function within an error boundary.
 * @param {Function} fn - Function to execute
 */
function withErrorBoundary(fn) {
  try {
    fn();
  } catch (err) {

    renderFallbackUI(err.message || 'An unexpected error occurred');
  }
}

/**
 * Renders a fallback UI when an error occurs.
 * @param {string} message - Error message
 */
function renderFallbackUI(message) {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  
  const fallback = createElement('section', { class: 'glass-card text-center', style: 'max-width: 500px; margin: 5rem auto; padding: 3rem;', role: 'alert' }, [
    createElement('div', { style: 'font-size: 3rem; margin-bottom: 1rem;' }, ['⚠️']),
    createElement('h2', { style: 'margin-bottom: 0.5rem;' }, ['Something went wrong']),
    createElement('p', { style: 'margin-bottom: 1.5rem; color: var(--color-text-muted);' }, [message]),
    createElement('button', { class: 'btn btn--primary', type: 'button', onclick: () => window.location.reload() }, ['Reload Application'])
  ]);
  
  replaceChildren(appEl, [fallback]);
}

/**
 * Initializes the application shell.
 */
export function initApp() {
  withErrorBoundary(() => {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    replaceChildren(appEl, [renderAppShell()]);
    initHeader();
    initSidebar();
    initToastManager();
    router.init();
  });
}

/**
 * Renders the full app shell DOM element.
 * @returns {HTMLElement} App layout element
 */
function renderAppShell() {
  const role = store.getState('auth').role;

  return createElement('div', { class: 'app-layout' }, [
    renderHeader(role),
    renderSidebar(role),
    createElement('main', { class: 'app-main', id: 'main-content', role: 'main', aria: { label: 'Page content' } })
  ]);
}

/**
 * Renders the application header.
 * @param {string} role - Current user role
 * @returns {HTMLElement} Header element
 */
function renderHeader(role) {
  return createElement('header', { class: 'app-header', role: 'banner' }, [
    createElement('div', { class: 'flex items-center gap-4' }, [
      createElement('button', { 
        class: 'btn btn--ghost btn--icon', 
        id: 'sidebar-toggle', 
        type: 'button',
        aria: { label: 'Toggle sidebar navigation', expanded: 'false', controls: 'app-sidebar' }
      }, [
        createElement('svg', { width: '20', height: '20', viewBox: '0 0 20 20', fill: 'currentColor', aria: { hidden: 'true' } }, [
          createElement('rect', { y: '3', width: '20', height: '2', rx: '1' }),
          createElement('rect', { y: '9', width: '20', height: '2', rx: '1' }),
          createElement('rect', { y: '15', width: '20', height: '2', rx: '1' })
        ])
      ]),
      createElement('div', {}, [
        createElement('span', { style: 'font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--text-lg);' }, [
          createElement('span', { class: 'gradient-text' }, ['FIFA 2026'])
        ]),
        createElement('span', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-left: var(--space-2);' }, [t('app.subtitle')])
      ])
    ]),
    createElement('div', { class: 'flex items-center gap-4' }, [
      renderRoleSwitcher(role),
      renderLanguageSelector()
    ])
  ]);
}

/**
 * Renders the role switcher component.
 * @param {string} role - Current user role
 * @returns {HTMLElement} Role switcher element
 */
function renderRoleSwitcher(role) {
  return createElement('div', { class: 'role-switcher', role: 'tablist', aria: { label: 'Mode selection' } }, [
    createElement('button', { 
      class: `role-switcher__option ${role === 'fan' ? 'role-switcher__option--active' : ''}`,
      id: 'role-fan-btn',
      role: 'tab',
      aria: { selected: role === 'fan' ? 'true' : 'false', controls: 'main-content' },
      type: 'button'
    }, [`🎉 ${t('nav.switchToFan')}`]),
    createElement('button', { 
      class: `role-switcher__option ${role === 'organizer' ? 'role-switcher__option--active' : ''}`,
      id: 'role-org-btn',
      role: 'tab',
      aria: { selected: role === 'organizer' ? 'true' : 'false', controls: 'main-content' },
      type: 'button'
    }, [`⚙️ ${t('nav.switchToOrg')}`])
  ]);
}

/**
 * Renders the language selector dropdown.
 * @returns {HTMLElement} Language selector element
 */
function renderLanguageSelector() {
  const currentLocale = getLocale();
  const options = getSupportedLocales().map(l => 
    createElement('option', { value: l, selected: l === currentLocale }, [getLocaleName(l)])
  );
  
  return createElement('select', { 
    id: 'global-lang-select', 
    class: 'form-select', 
    style: 'width: auto; padding: var(--space-2); font-size: var(--text-xs); background: var(--color-bg-tertiary);',
    aria: { label: 'Select interface language' }
  }, options);
}

/**
 * Renders the application sidebar.
 * @param {string} role - Current user role
 * @returns {HTMLElement} Sidebar element
 */
function renderSidebar(role) {
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
  
  const navItems = items.map(item => 
    createElement('li', { role: 'listitem' }, [
      createElement('a', { 
        href: item.path, 
        class: `sidebar-nav__item ${currentRoute === item.path ? 'sidebar-nav__item--active' : ''}`,
        aria: { current: currentRoute === item.path ? 'page' : 'false' },
        dataset: { route: item.path }
      }, [
        createElement('span', { class: 'sidebar-nav__icon', aria: { hidden: 'true' } }, [item.icon]),
        createElement('span', {}, [item.label])
      ])
    ])
  );

  return createElement('aside', { class: 'app-sidebar', id: 'app-sidebar', role: 'navigation', aria: { label: 'Main navigation' } }, [
    createElement('div', { style: 'padding: 0 var(--space-4) var(--space-4);' }, [
      createElement('div', { style: 'font-family: var(--font-display); font-weight: var(--weight-bold); font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-4);' }, [
        role === 'fan' ? '🎉 Fan Experience' : '⚙️ Staff Operations'
      ])
    ]),
    createElement('nav', {}, [
      createElement('ul', { class: 'sidebar-nav', id: 'sidebar-nav', role: 'list' }, navItems)
    ])
  ]);
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

  // Announce state change to screen reader dynamically
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
  withErrorBoundary(() => {
    router.destroy();
    const appEl = document.getElementById('app');
    if (!appEl) return;
    
    replaceChildren(appEl, [renderAppShell()]);
    initHeader();
    initSidebar();
    initToastManager();
    router.init();
  });
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
        
        const dismissBtn = createElement('button', { 
          class: 'btn btn--ghost btn--sm', 
          dataset: { dismissToast: toast.id }, 
          type: 'button', 
          aria: { label: 'Dismiss notification' }, 
          style: 'padding: var(--space-1);' 
        }, ['✕']);
        
        dismissBtn.addEventListener('click', () => {
          store.dispatch('ui.removeToast', toast.id);
        });

        const toastEl = createElement('div', { class: `toast toast--${toast.type}`, id: toastId, role: 'alert' }, [
          createElement('span', { class: 'toast__icon' }, [typeIcons[toast.type] || 'ℹ️']),
          createElement('div', { class: 'toast__body' }, [
            createElement('div', { class: 'toast__title' }, [toast.title]),
            createElement('div', { class: 'toast__message' }, [toast.message])
          ]),
          dismissBtn
        ]);

        container.appendChild(toastEl);

        setTimeout(() => {
          store.dispatch('ui.removeToast', toast.id);
        }, toast.duration || 5000);
      }
    });
  });
}

export { switchRole, reinitializeApp };
