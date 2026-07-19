/**
 * @fileoverview Multilingual i18n engine supporting 12 languages with interpolation,
 * pluralization, RTL detection, and fallback chains.
 * @module core/i18n
 */

import store from './store.js';
import { translations } from '../data/translations.js';

/** @type {string[]} Supported locale codes */
const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'pt', 'ar', 'de',
  'ja', 'ko', 'zh', 'hi', 'it', 'nl'
];

/** @type {Object<string, string>} Locale display names */
const LOCALE_NAMES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  ar: 'العربية',
  de: 'Deutsch',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  hi: 'हिन्दी',
  it: 'Italiano',
  nl: 'Nederlands'
};

/** @type {Set<string>} RTL locales */
const RTL_LOCALES = new Set(['ar']);

/** @type {string} Current locale */
let currentLocale = 'en';

/** @type {Set<Function>} Locale change listeners */
const localeChangeListeners = new Set();

/**
 * Resolves a nested key path in an object.
 * @param {Object} obj - Object to traverse
 * @param {string} keyPath - Dot-separated key path
 * @returns {*} Resolved value or undefined
 */
function resolveKeyPath(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (current === undefined || current === null) return undefined;
    current = current[keys[i]];
  }
  return current;
}

/**
 * Translates a key to the current locale with optional interpolation.
 * Falls back to English if the key is missing in the current locale.
 * @param {string} key - Translation key (dot-notation supported)
 * @param {Object} [params] - Interpolation parameters
 * @returns {string} Translated string
 */
function t(key, params = {}) {
  if (typeof key !== 'string') return '';

  let value = resolveKeyPath(translations[currentLocale], key);

  if (value === undefined && currentLocale !== 'en') {
    value = resolveKeyPath(translations['en'], key);
  }

  if (value === undefined) {
    return key;
  }

  if (typeof value === 'object' && params.count !== undefined) {
    const count = Number(params.count);
    if (count === 0 && value.zero) {
      value = value.zero;
    } else if (count === 1 && value.one) {
      value = value.one;
    } else if (value.other) {
      value = value.other;
    } else {
      value = Object.values(value)[0] || key;
    }
  }

  if (typeof value !== 'string') return String(value);

  return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? String(params[paramKey]) : match;
  });
}

/**
 * Sets the active locale and updates RTL direction.
 * @param {string} locale - Locale code
 */
function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) {

    locale = 'en';
  }

  currentLocale = locale;

  const isRTL = RTL_LOCALES.has(locale);
  document.documentElement.setAttribute('lang', locale);
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  store.dispatch('ui.setLocale', locale);

  localeChangeListeners.forEach((listener) => {
    try {
      listener(locale);
    } catch (err) {

    }
  });
}

/**
 * Returns the current locale.
 * @returns {string}
 */
function getLocale() {
  return currentLocale;
}

/**
 * Checks if the current locale is RTL.
 * @returns {boolean}
 */
function isRTL() {
  return RTL_LOCALES.has(currentLocale);
}

/**
 * Returns the display name for a locale.
 * @param {string} locale - Locale code
 * @returns {string}
 */
function getLocaleName(locale) {
  return LOCALE_NAMES[locale] || locale;
}

/**
 * Returns all supported locale codes.
 * @returns {string[]}
 */
function getSupportedLocales() {
  return [...SUPPORTED_LOCALES];
}

/**
 * Registers a listener for locale changes.
 * @param {Function} listener - Callback receiving new locale
 * @returns {Function} Unregister function
 */
function onLocaleChange(listener) {
  localeChangeListeners.add(listener);
  return () => localeChangeListeners.delete(listener);
}

/**
 * Simple language detection from text input (heuristic-based).
 * @param {string} text - Input text
 * @returns {string} Detected locale code
 */
function detectLanguage(text) {
  if (typeof text !== 'string' || text.trim().length === 0) return 'en';

  const trimmed = text.trim();

  if (/[\u0600-\u06FF]/.test(trimmed)) return 'ar';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(trimmed)) return 'ja';
  if (/[\uAC00-\uD7AF]/.test(trimmed)) return 'ko';
  if (/[\u4E00-\u9FFF]/.test(trimmed)) return 'zh';
  if (/[\u0900-\u097F]/.test(trimmed)) return 'hi';

  const lowerText = trimmed.toLowerCase();

  if (/(hola|dónde|donde|cómo|qué|por favor|gracias|estadio|partido)/.test(lowerText)) return 'es';
  if (/(bonjour|où|comment|merci|stade|match|s'il vous plaît)/.test(lowerText)) return 'fr';
  if (/(olá|onde|como|obrigado|estádio|jogo)/.test(lowerText)) return 'pt';
  if (/(hallo|wo|wie|danke|stadion|spiel|bitte)/.test(lowerText)) return 'de';
  if (/(ciao|dove|come|grazie|stadio|partita)/.test(lowerText)) return 'it';
  if (/(hallo|waar|hoe|dank|stadion|wedstrijd|alstublieft)/.test(lowerText)) return 'nl';

  return 'en';
}

export {
  t,
  setLocale,
  getLocale,
  isRTL,
  getLocaleName,
  getSupportedLocales,
  onLocaleChange,
  detectLanguage,
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  RTL_LOCALES
};
