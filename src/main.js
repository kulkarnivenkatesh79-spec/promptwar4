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

  target.innerHTML = `
    <section class="glass-card text-center" style="max-width: 500px; margin: 5rem auto; padding: 3rem;" role="alert">
      <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
      <h2 style="margin-bottom: 0.5rem;">Something went wrong</h2>
      <p style="margin-bottom: 1.5rem; color: var(--color-text-muted);">
        ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </p>
      <button class="btn btn--primary" onclick="window.location.reload()" type="button">
        Reload Application
      </button>
    </section>
  `;
}

/**
 * Boot the application when the DOM is ready.
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
