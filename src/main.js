/**
 * @fileoverview Application entry point. Bootstraps the app shell and error boundary.
 * @module main
 */

import { initApp } from './app.js';

/**
 * Global error boundary: catches unhandled errors and renders a recovery UI.
 */
window.addEventListener('error', (event) => {
  console.error('[App] Unhandled error:', event.error);
  renderErrorBoundary(event.error?.message || 'An unexpected error occurred');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[App] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

/**
 * Renders a graceful error recovery UI.
 * @param {string} message - Error message
 */
function renderErrorBoundary(message) {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const mainContent = document.getElementById('main-content');
  const target = mainContent || appEl;

  const reloadBtn = document.createElement('button');
  reloadBtn.className = 'btn btn--primary';
  reloadBtn.type = 'button';
  reloadBtn.textContent = 'Reload Application';
  reloadBtn.addEventListener('click', () => window.location.reload());

  const section = document.createElement('section');
  section.className = 'glass-card text-center';
  section.style.cssText = 'max-width: 500px; margin: 5rem auto; padding: 3rem;';
  section.setAttribute('role', 'alert');

  const icon = document.createElement('div');
  icon.style.cssText = 'font-size: 3rem; margin-bottom: 1rem;';
  icon.textContent = '⚠️';

  const heading = document.createElement('h2');
  heading.style.marginBottom = '0.5rem';
  heading.textContent = 'Something went wrong';

  const msg = document.createElement('p');
  msg.style.cssText = 'margin-bottom: 1.5rem; color: var(--color-text-muted);';
  msg.textContent = message;

  section.appendChild(icon);
  section.appendChild(heading);
  section.appendChild(msg);
  section.appendChild(reloadBtn);

  target.textContent = '';
  target.appendChild(section);
}

/**
 * Boot the application when the DOM is ready.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
