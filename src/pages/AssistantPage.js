/**
 * @fileoverview Full-screen AI Assistant page wrapper.
 * @module pages/AssistantPage
 */
import ChatWindow from '../components/Chat/ChatWindow.js';
import { t } from '../core/i18n.js';
import { createElement } from '../core/dom.js';

export default function AssistantPage() {
  let chatInstance = null;
  function render() {
    chatInstance = ChatWindow();
    
    return createElement('div', {}, [
      createElement('section', { class: 'page-header', aria: { labelledby: 'assistant-heading' } }, [
        createElement('h1', { id: 'assistant-heading', class: 'page-header__title' }, [`🤖 ${t('chat.title')}`]),
        createElement('p', { class: 'page-header__subtitle' }, [t('chat.subtitle')])
      ]),
      createElement('div', { style: 'max-width: 900px; margin: 0 auto; height: calc(100vh - var(--header-height) - 200px);' }, [
        chatInstance.render()
      ])
    ]);
  }
  function mount() { if (chatInstance) chatInstance.mount(); }
  function unmount() { if (chatInstance) { chatInstance.unmount(); chatInstance = null; } }
  return { render, mount, unmount };
}
