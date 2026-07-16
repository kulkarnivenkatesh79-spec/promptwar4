/**
 * @fileoverview Accessibility utilities: focus trapping, screen reader announcements,
 * contrast ratio calculation, and route-change focus management.
 * @module core/accessibility
 */

/** @type {HTMLElement|null} Previously focused element before trap activation */
let previouslyFocused = null;

/** @type {Function|null} Active keydown handler for focus trap */
let activeTrapHandler = null;

/** @type {HTMLElement|null} Element containing the focus trap */
let trapElement = null;

/**
 * Selector for all focusable elements.
 * @type {string}
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'summary',
  'details'
].join(', ');

/**
 * Returns all focusable elements within a container.
 * @param {HTMLElement} container - Container element
 * @returns {HTMLElement[]} Array of focusable elements
 */
function getFocusableElements(container) {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
  });
}

/**
 * Traps focus within a container element.
 * @param {HTMLElement} element - Container to trap focus within
 */
function trapFocusInElement(element) {
  if (!element) return;

  releaseFocusTrap();

  previouslyFocused = document.activeElement;
  trapElement = element;

  const focusable = getFocusableElements(element);
  if (focusable.length > 0) {
    focusable[0].focus();
  }

  activeTrapHandler = function handleTrapKeydown(event) {
    if (event.key !== 'Tab') return;

    const currentFocusable = getFocusableElements(element);
    if (currentFocusable.length === 0) return;

    const firstFocusable = currentFocusable[0];
    const lastFocusable = currentFocusable[currentFocusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  document.addEventListener('keydown', activeTrapHandler);
}

/**
 * Releases the focus trap and restores focus to the previously focused element.
 */
function releaseFocusTrap() {
  if (activeTrapHandler) {
    document.removeEventListener('keydown', activeTrapHandler);
    activeTrapHandler = null;
  }

  if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
    try {
      previouslyFocused.focus();
    } catch (e) {
      /* Element may have been removed from DOM */
    }
  }

  previouslyFocused = null;
  trapElement = null;
}

/**
 * Announces a message to screen readers via aria-live regions.
 * @param {string} message - Message to announce
 * @param {'polite'|'assertive'} [priority='polite'] - Announcement priority
 */
function announceToScreenReader(message, priority = 'polite') {
  if (typeof message !== 'string' || message.trim().length === 0) return;

  const regionId = priority === 'assertive' ? 'sr-announcer-assertive' : 'sr-announcer-polite';
  const region = document.getElementById(regionId);

  if (!region) return;

  region.textContent = '';

  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/**
 * Manages focus after a route change by moving focus to the main heading.
 */
function manageFocusOnRouteChange() {
  requestAnimationFrame(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const heading = mainContent.querySelector('h1, h2, [data-page-title]');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: false });
      heading.addEventListener('blur', () => {
        heading.removeAttribute('tabindex');
      }, { once: true });
    } else {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus({ preventScroll: false });
      mainContent.addEventListener('blur', () => {
        mainContent.removeAttribute('tabindex');
      }, { once: true });
    }
  });
}

/**
 * Parses a hex color string to RGB components.
 * @param {string} hex - Hex color string (e.g., '#ffffff' or '#fff')
 * @returns {{ r: number, g: number, b: number }} RGB components
 */
function hexToRgb(hex) {
  let cleaned = hex.replace('#', '');

  if (cleaned.length === 3) {
    cleaned = cleaned[0] + cleaned[0] + cleaned[1] + cleaned[1] + cleaned[2] + cleaned[2];
  }

  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calculates relative luminance of an RGB color.
 * @param {{ r: number, g: number, b: number }} rgb - RGB color
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(rgb) {
  const [rs, gs, bs] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  const r = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const g = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const b = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the WCAG contrast ratio between two colors.
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @returns {number} Contrast ratio (1:1 to 21:1)
 */
function getContrastRatio(foreground, background) {
  const fgLum = getRelativeLuminance(hexToRgb(foreground));
  const bgLum = getRelativeLuminance(hexToRgb(background));

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Checks if a contrast ratio meets WCAG AA or AAA standards.
 * @param {number} ratio - Contrast ratio
 * @param {'AA'|'AAA'} [level='AA'] - WCAG level
 * @param {boolean} [isLargeText=false] - Whether the text is large (≥18pt or ≥14pt bold)
 * @returns {boolean} True if the ratio meets the specified level
 */
function meetsContrastRequirement(ratio, level = 'AA', isLargeText = false) {
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Creates a debounced version of a function.
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function with cancel method
 */
function debounce(fn, delay) {
  let timer = null;

  function debounced(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  }

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}

/**
 * Memoizes a pure function for expensive computations.
 * @param {Function} fn - Pure function to memoize
 * @param {number} [maxSize=100] - Maximum cache size
 * @returns {Function} Memoized function
 */
function memoize(fn, maxSize = 100) {
  const cache = new Map();

  return function memoized(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  };
}

export {
  trapFocusInElement,
  releaseFocusTrap,
  getFocusableElements,
  announceToScreenReader,
  manageFocusOnRouteChange,
  getContrastRatio,
  meetsContrastRequirement,
  hexToRgb,
  getRelativeLuminance,
  debounce,
  memoize,
  FOCUSABLE_SELECTOR
};
