/**
 * @fileoverview Chat window UI component with full ARIA support, message list,
 * input area, language selector, and voice input.
 * @module components/Chat/ChatWindow
 */

import { sanitizeInput, escapeHTML } from '../../core/security.js';
import { t, getSupportedLocales, getLocaleName, getLocale } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import { processMessage } from './ChatEngine.js';
import store from '../../core/store.js';

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
   * @returns {string} HTML string
   */
  function render() {
    const welcomeMessage = t('chat.welcome');
    const locales = getSupportedLocales();

    return `
      <section class="chat-container glass-card glass-card--no-hover" aria-label="${escapeHTML(t('chat.title'))}">
        <header class="flex items-center justify-between" style="padding: var(--space-4); border-bottom: 1px solid var(--glass-border);">
          <div>
            <h2 style="font-size: var(--text-xl); margin-bottom: var(--space-1);">🤖 ${escapeHTML(t('chat.title'))}</h2>
            <p style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHTML(t('chat.subtitle'))}</p>
          </div>
          <div class="flex items-center gap-2">
            <select id="chat-lang-select" class="form-select" style="width: auto; padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3); font-size: var(--text-xs);"
              aria-label="Select chat language">
              ${locales.map((l) => `<option value="${l}" ${l === getLocale() ? 'selected' : ''}>${getLocaleName(l)}</option>`).join('')}
            </select>
            <button class="btn btn--ghost btn--sm" id="chat-clear-btn" type="button" aria-label="${escapeHTML(t('chat.clearChat'))}">
              🗑️
            </button>
          </div>
        </header>

        <div class="chat-messages" id="chat-messages" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions">
          <div class="chat-message chat-message--ai" role="article" aria-label="AI message">
            <div class="chat-message__avatar" aria-hidden="true">AI</div>
            <div>
              <div class="chat-message__bubble">${escapeHTML(welcomeMessage)}</div>
              <div class="chat-message__time" aria-label="Sent just now">Just now</div>
            </div>
          </div>
        </div>

        <div id="chat-typing-indicator" class="chat-typing" style="padding: 0 var(--space-4); display: none;" aria-live="polite" role="status">
          <div class="chat-typing__dot" aria-hidden="true"></div>
          <div class="chat-typing__dot" aria-hidden="true"></div>
          <div class="chat-typing__dot" aria-hidden="true"></div>
          <span class="sr-only">${escapeHTML(t('chat.thinking'))}</span>
        </div>

        <div class="chat-input-area" role="form" aria-label="Chat message input">
          <button class="btn btn--ghost btn--icon" id="chat-voice-btn" type="button"
            aria-label="${escapeHTML(t('chat.voice'))}" title="${escapeHTML(t('chat.voice'))}">
            🎤
          </button>
          <textarea
            id="chat-input"
            class="chat-input-area__field"
            placeholder="${escapeHTML(t('chat.placeholder'))}"
            rows="1"
            maxlength="2000"
            aria-label="${escapeHTML(t('chat.placeholder'))}"
          ></textarea>
          <button class="btn btn--primary btn--icon" id="chat-send-btn" type="button"
            aria-label="${escapeHTML(t('chat.send'))}" title="${escapeHTML(t('chat.send'))}">
            ➤
          </button>
        </div>
      </section>
    `;
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
          messagesEl.innerHTML = '';
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

      announceToScreenReader('AI response received');
    } catch (err) {
      if (err.name !== 'AbortError') {
        updateMessageContent(aiMessageId, t('chat.errorResponse'));
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
    const escapedContent = escapeHTML(content);

    const messageHTML = `
      <div class="chat-message chat-message--${role}" id="${messageId}" role="article"
        aria-label="${role === 'user' ? 'Your message' : 'AI response'}">
        <div class="chat-message__avatar" aria-hidden="true">${avatarText}</div>
        <div>
          <div class="chat-message__bubble" id="${messageId}-content">${escapedContent}${isStreaming ? '<span class="typing-cursor" aria-hidden="true">▌</span>' : ''}</div>
          <div class="chat-message__time">${escapeHTML(time)}</div>
        </div>
      </div>
    `;

    messagesEl.insertAdjacentHTML('beforeend', messageHTML);
    scrollToBottom();

    return messageId;
  }

  /**
   * Updates a streaming message's content.
   * @param {string} messageId - Message element ID
   * @param {string} content - Updated content
   */
  function updateMessageContent(messageId, content) {
    const contentEl = document.getElementById(`${messageId}-content`);
    if (contentEl) {
      contentEl.innerHTML = escapeHTML(content) + '<span class="typing-cursor" aria-hidden="true">▌</span>';
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
      console.error('[Voice] Recognition error:', event.error);
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
