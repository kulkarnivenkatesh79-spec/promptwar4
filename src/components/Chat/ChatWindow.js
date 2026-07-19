/**
 * @fileoverview Chat window UI component with full ARIA support, message list,
 * input area, language selector, and voice input.
 * @module components/Chat/ChatWindow
 */

import { sanitizeInput } from '../../core/security.js';
import { t, getSupportedLocales, getLocaleName, getLocale } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import { processMessage } from './ChatEngine.js';
import store from '../../core/store.js';
import { createElement, replaceChildren } from '../../core/dom.js';

/**
 * Creates the Chat Window component.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function ChatWindow() {
  /** @type {AbortController|null} */
  let streamAbortController = null;
  /** @type {Function[]} */
  const cleanupFns = [];
  /** @type {boolean} */
  let isProcessing = false;

  /**
   * Renders the chat window HTML.
   * @returns {HTMLElement} HTML element
   */
  function render() {
    const welcomeMessage = t('chat.welcome');
    const locales = getSupportedLocales();
    const currentLocale = getLocale();

    const langOptions = locales.map((l) => 
      createElement('option', { value: l, selected: l === currentLocale }, [getLocaleName(l)])
    );

    return createElement('section', { class: 'chat-container glass-card glass-card--no-hover', aria: { label: t('chat.title') } }, [
      createElement('header', { class: 'flex items-center justify-between', style: 'padding: var(--space-4); border-bottom: 1px solid var(--glass-border);' }, [
        createElement('div', {}, [
          createElement('h2', { style: 'font-size: var(--text-xl); margin-bottom: var(--space-1);' }, ['🤖 ', t('chat.title')]),
          createElement('p', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [t('chat.subtitle')])
        ]),
        createElement('div', { class: 'flex items-center gap-2' }, [
          createElement('select', { 
            id: 'chat-lang-select', 
            class: 'form-select', 
            style: 'width: auto; padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3); font-size: var(--text-xs);',
            aria: { label: 'Select chat language' }
          }, langOptions),
          createElement('button', { class: 'btn btn--ghost btn--sm', id: 'chat-clear-btn', type: 'button', aria: { label: t('chat.clearChat') } }, ['🗑️'])
        ])
      ]),
      createElement('div', { class: 'chat-messages', id: 'chat-messages', role: 'log', aria: { label: 'Chat messages', live: 'polite', relevant: 'additions' } }, [
        createElement('div', { class: 'chat-message chat-message--ai', role: 'article', aria: { label: 'AI message' } }, [
          createElement('div', { class: 'chat-message__avatar', aria: { hidden: 'true' } }, ['AI']),
          createElement('div', {}, [
            createElement('div', { class: 'chat-message__bubble' }, [welcomeMessage]),
            createElement('div', { class: 'chat-message__time', aria: { label: 'Sent just now' } }, ['Just now'])
          ])
        ])
      ]),
      createElement('div', { id: 'chat-typing-indicator', class: 'chat-typing', style: 'padding: 0 var(--space-4); display: none;', aria: { live: 'polite' }, role: 'status' }, [
        createElement('div', { class: 'chat-typing__dot', aria: { hidden: 'true' } }),
        createElement('div', { class: 'chat-typing__dot', aria: { hidden: 'true' } }),
        createElement('div', { class: 'chat-typing__dot', aria: { hidden: 'true' } }),
        createElement('span', { class: 'sr-only' }, [t('chat.thinking')])
      ]),
      createElement('div', { class: 'chat-input-area', role: 'form', aria: { label: 'Chat message input' } }, [
        createElement('button', { class: 'btn btn--ghost btn--icon', id: 'chat-voice-btn', type: 'button', aria: { label: t('chat.voice') }, title: t('chat.voice') }, ['🎤']),
        createElement('textarea', { id: 'chat-input', class: 'chat-input-area__field', placeholder: t('chat.placeholder'), rows: '1', maxlength: '2000', aria: { label: t('chat.placeholder') } }),
        createElement('button', { class: 'btn btn--primary btn--icon', id: 'chat-send-btn', type: 'button', aria: { label: t('chat.send') }, title: t('chat.send') }, ['➤'])
      ])
    ]);
  }

  /**
   * Mounts event listeners and initializes chat functionality.
   */
  function mount() {
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');
    const clearBtn = document.getElementById('chat-clear-btn');
    const voiceBtn = document.getElementById('chat-voice-btn');
    const langSelect = document.getElementById('chat-lang-select');

    if (sendBtn) {
      const handleSend = () => sendMessage();
      sendBtn.addEventListener('click', handleSend);
      cleanupFns.push(() => sendBtn.removeEventListener('click', handleSend));
    }

    if (input) {
      const handleKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      };

      const handleInput = () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      };

      input.addEventListener('keydown', handleKeydown);
      input.addEventListener('input', handleInput);
      cleanupFns.push(() => {
        input.removeEventListener('keydown', handleKeydown);
        input.removeEventListener('input', handleInput);
      });
    }

    if (clearBtn) {
      const handleClear = () => {
        store.dispatch('chat.clearMessages', null);
        const messagesEl = document.getElementById('chat-messages');
        if (messagesEl) {
          replaceChildren(messagesEl, []);
          announceToScreenReader('Chat cleared');
        }
      };
      clearBtn.addEventListener('click', handleClear);
      cleanupFns.push(() => clearBtn.removeEventListener('click', handleClear));
    }

    if (voiceBtn) {
      const handleVoice = () => startVoiceInput();
      voiceBtn.addEventListener('click', handleVoice);
      cleanupFns.push(() => voiceBtn.removeEventListener('click', handleVoice));
    }

    if (langSelect) {
      const handleLangChange = (e) => {
        store.dispatch('chat.setLanguage', e.target.value);
        announceToScreenReader(`Chat language changed to ${getLocaleName(e.target.value)}`);
      };
      langSelect.addEventListener('change', handleLangChange);
      cleanupFns.push(() => langSelect.removeEventListener('change', handleLangChange));
    }
  }

  /**
   * Sends a user message and triggers AI response.
   */
  async function sendMessage() {
    if (isProcessing) return;

    const input = document.getElementById('chat-input');
    if (!input) return;

    const rawText = input.value;
    const sanitized = sanitizeInput(rawText, { maxLength: 2000 });

    if (sanitized.trim().length === 0) return;

    input.value = '';
    input.style.height = 'auto';
    isProcessing = true;

    appendMessage('user', sanitized);

    store.dispatch('chat.addMessage', { role: 'user', content: sanitized });

    showTypingIndicator(true);

    if (streamAbortController) {
      streamAbortController.abort();
    }
    streamAbortController = new AbortController();

    const aiMessageId = appendMessage('ai', '', true);

    try {
      const result = await processMessage(sanitized, (chunk) => {
        updateMessageContent(aiMessageId, chunk);
      }, { signal: streamAbortController.signal });

      store.dispatch('chat.addMessage', {
        role: 'assistant',
        content: result.response,
        language: result.detectedLang
      });

      updateMessageContent(aiMessageId, result.response, false);
      announceToScreenReader('AI response received');
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateMessageContent(aiMessageId, t('chat.errorResponse'), false);
        announceToScreenReader('AI encountered an error');
      }
    } finally {
      showTypingIndicator(false);
      isProcessing = false;
      streamAbortController = null;
    }
  }

  /**
   * Appends a message to the chat UI.
   * @param {'user'|'ai'} role - Message role
   * @param {string} content - Message content
   * @param {boolean} [isStreaming=false] - Whether this is a streaming message
   * @returns {string} Message element ID
   */
  function appendMessage(role, content, isStreaming = false) {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return '';

    const messageId = 'msg-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarText = role === 'user' ? 'You' : 'AI';

    const cursorEl = isStreaming ? createElement('span', { class: 'typing-cursor', aria: { hidden: 'true' } }, ['▌']) : null;

    const messageEl = createElement('div', { 
      class: `chat-message chat-message--${role}`, 
      id: messageId, 
      role: 'article', 
      aria: { label: role === 'user' ? 'Your message' : 'AI response' } 
    }, [
      createElement('div', { class: 'chat-message__avatar', aria: { hidden: 'true' } }, [avatarText]),
      createElement('div', {}, [
        createElement('div', { class: 'chat-message__bubble', id: `${messageId}-content` }, [content, cursorEl]),
        createElement('div', { class: 'chat-message__time' }, [time])
      ])
    ]);

    messagesEl.appendChild(messageEl);
    scrollToBottom();

    return messageId;
  }

  /**
   * Updates a streaming message's content.
   * @param {string} messageId - Message element ID
   * @param {string} content - Updated content
   * @param {boolean} [isStreaming=true] - Whether the cursor should be shown
   */
  function updateMessageContent(messageId, content, isStreaming = true) {
    const contentEl = document.getElementById(`${messageId}-content`);
    if (contentEl) {
      const children = [content];
      if (isStreaming) {
        children.push(createElement('span', { class: 'typing-cursor', aria: { hidden: 'true' } }, ['▌']));
      }
      replaceChildren(contentEl, children);
      scrollToBottom();
    }
  }

  /**
   * Scrolls the message container to the bottom.
   */
  function scrollToBottom() {
    const messagesEl = document.getElementById('chat-messages');
    if (messagesEl) {
      requestAnimationFrame(() => {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }
  }

  /**
   * Shows or hides the typing indicator.
   * @param {boolean} show - Whether to show the indicator
   */
  function showTypingIndicator(show) {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) {
      indicator.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Initiates voice input using the Web Speech API.
   */
  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      announceToScreenReader('Voice input is not supported in this browser');
      store.dispatch('ui.addToast', {
        type: 'warning',
        title: 'Voice Not Supported',
        message: 'Your browser does not support voice input. Please type your message instead.'
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = store.getState('chat').selectedLanguage || 'en-US';

    const voiceBtn = document.getElementById('chat-voice-btn');
    if (voiceBtn) {
      voiceBtn.style.color = 'var(--color-accent-red)';
      voiceBtn.setAttribute('aria-label', 'Listening... Click to stop');
    }

    announceToScreenReader('Listening for voice input');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = transcript;
        input.dispatchEvent(new Event('input'));
      }
      announceToScreenReader(`Voice input received: ${transcript}`);
    };

    recognition.onerror = (event) => {

      announceToScreenReader('Voice input error. Please try again.');
    };

    recognition.onend = () => {
      if (voiceBtn) {
        voiceBtn.style.color = '';
        voiceBtn.setAttribute('aria-label', t('chat.voice'));
      }
    };

    recognition.start();

    cleanupFns.push(() => {
      try { recognition.abort(); } catch (e) { /* already stopped */ }
    });
  }

  /**
   * Unmounts the component and cleans up resources.
   */
  function unmount() {
    if (streamAbortController) {
      streamAbortController.abort();
      streamAbortController = null;
    }

    cleanupFns.forEach((fn) => {
      try { fn(); } catch (e) { /* ignore */ }
    });
    cleanupFns.length = 0;
    isProcessing = false;
  }

  return { render, mount, unmount };
}
