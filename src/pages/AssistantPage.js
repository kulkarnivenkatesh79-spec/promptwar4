/**
 * @fileoverview Full-screen AI Assistant page wrapper.
 * @module pages/AssistantPage
 */
import ChatWindow from '../components/Chat/ChatWindow.js';
import { escapeHTML } from '../core/security.js';
import { t } from '../core/i18n.js';

export default function AssistantPage() {
  let chatInstance = null;
  function render() {
    chatInstance = ChatWindow();
    return `
      <section class="page-header" aria-labelledby="assistant-heading">
        <h1 id="assistant-heading" class="page-header__title">🤖 ${escapeHTML(t('chat.title'))}</h1>
        <p class="page-header__subtitle">${escapeHTML(t('chat.subtitle'))}</p>
      </section>
      <div style="max-width: 900px; margin: 0 auto; height: calc(100vh - var(--header-height) - 200px);">
        ${chatInstance.render()}
      </div>
    `;
  }
  function mount() { if (chatInstance) chatInstance.mount(); }
  function unmount() { if (chatInstance) { chatInstance.unmount(); chatInstance = null; } }
  return { render, mount, unmount };
}
