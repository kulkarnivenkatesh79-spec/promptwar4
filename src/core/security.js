/**
 * @fileoverview Security utilities: XSS sanitization, input validation, rate limiting, and payload validation.
 * @module core/security
 */

/**
 * HTML entity map for escaping dangerous characters.
 * @type {Object<string, string>}
 */
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;'
};

/**
 * Regex pattern matching dangerous HTML characters.
 * @type {RegExp}
 */
const DANGEROUS_CHARS_REGEX = /[&<>"'`/]/g;

/**
 * Regex pattern matching HTML tags.
 * @type {RegExp}
 */
const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * Regex pattern matching control characters and zero-width spaces.
 * @type {RegExp}
 */
const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF]/g;

/**
 * Regex pattern matching JavaScript event handlers in attributes.
 * @type {RegExp}
 */
const EVENT_HANDLER_REGEX = /\bon\w+\s*=/gi;

/**
 * Regex pattern matching javascript: protocol in strings.
 * @type {RegExp}
 */
const JAVASCRIPT_PROTOCOL_REGEX = /javascript\s*:/gi;

/**
 * Regex pattern matching data: protocol in strings.
 * @type {RegExp}
 */
const DATA_PROTOCOL_REGEX = /data\s*:[^,]*;base64/gi;

/**
 * Escapes HTML entities in a string to prevent XSS.
 * @param {string} str - Raw string
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(DANGEROUS_CHARS_REGEX, (char) => HTML_ENTITIES[char] || char);
}

function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';

  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const doc = new window.DOMParser().parseFromString(input, 'text/html');
      const dangerous = doc.querySelectorAll('script, style, iframe, object, embed, noscript, meta');
      dangerous.forEach((el) => el.remove());
      return escapeHTML(doc.body.textContent || '');
    } catch (e) {
      // Fallback below if DOMParser fails
    }
  }

  let sanitized = input;
  let previous = '';

  while (sanitized !== previous) {
    previous = sanitized;
    sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(HTML_TAG_REGEX, '');
    sanitized = sanitized.replace(EVENT_HANDLER_REGEX, '');
    sanitized = sanitized.replace(JAVASCRIPT_PROTOCOL_REGEX, '');
    sanitized = sanitized.replace(DATA_PROTOCOL_REGEX, '');
  }

  return escapeHTML(sanitized);
}

/**
 * Sanitizes user input: trims, removes control characters, enforces max length.
 * @param {string} input - Raw user input
 * @param {Object} [options] - Sanitization options
 * @param {number} [options.maxLength=2000] - Maximum allowed length
 * @param {boolean} [options.allowNewlines=true] - Whether to preserve newlines
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, options = {}) {
  if (typeof input !== 'string') return '';

  const { maxLength = 2000, allowNewlines = true } = options;

  let sanitized = input.trim();

  sanitized = sanitized.replace(CONTROL_CHARS_REGEX, '');

  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  }

  sanitized = sanitized.replace(JAVASCRIPT_PROTOCOL_REGEX, '');

  sanitized = sanitized.replace(EVENT_HANDLER_REGEX, '');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Escapes a string for safe use in an HTML attribute value.
 * @param {string} str - Raw string
 * @returns {string} Escaped string safe for attribute insertion
 */
function escapeForAttribute(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * @typedef {Object} SchemaField
 * @property {string} type - Expected type ('string', 'number', 'boolean', 'array', 'object')
 * @property {boolean} [required=false] - Whether the field is required
 * @property {number} [minLength] - Minimum string length
 * @property {number} [maxLength] - Maximum string length
 * @property {number} [min] - Minimum number value
 * @property {number} [max] - Maximum number value
 * @property {string[]} [enum] - Allowed values
 * @property {RegExp} [pattern] - Regex pattern to match
 */

/**
 * Validates a data object against a schema.
 * @param {Object<string, SchemaField>} schema - Validation schema
 * @param {Object} data - Data to validate
 * @returns {{ valid: boolean, errors: string[] }} Validation result
 */
function validatePayload(schema, data) {
  const errors = [];

  if (data === null || typeof data !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null object'] };
  }

  const schemaKeys = Object.keys(schema);
  for (let i = 0; i < schemaKeys.length; i++) {
    const key = schemaKeys[i];
    const rule = schema[key];
    const value = data[key];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field "${key}" is required`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`Field "${key}" must be a string`);
    } else if (rule.type === 'number' && typeof value !== 'number') {
      errors.push(`Field "${key}" must be a number`);
    } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`Field "${key}" must be a boolean`);
    } else if (rule.type === 'array' && !Array.isArray(value)) {
      errors.push(`Field "${key}" must be an array`);
    } else if (rule.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      errors.push(`Field "${key}" must be an object`);
    }

    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`Field "${key}" must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`Field "${key}" must be at most ${rule.maxLength} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`Field "${key}" does not match the required pattern`);
      }
    }

    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Field "${key}" must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Field "${key}" must be at most ${rule.max}`);
      }
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`Field "${key}" must be one of: ${rule.enum.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Token-bucket rate limiter implementation.
 */
class RateLimiter {
  /**
   * @param {Object} options - Rate limiter configuration
   * @param {number} [options.maxTokens=10] - Maximum token count
   * @param {number} [options.refillRate=1] - Tokens added per second
   * @param {number} [options.windowMs=60000] - Time window in milliseconds
   */
  constructor(options = {}) {
    /** @type {number} */
    this.maxTokens = options.maxTokens || 10;
    /** @type {number} */
    this.refillRate = options.refillRate || 1;
    /** @type {number} */
    this.windowMs = options.windowMs || 60000;
    /** @type {number} */
    this.tokens = this.maxTokens;
    /** @type {number} */
    this.lastRefill = Date.now();
  }

  /**
   * Refills tokens based on elapsed time.
   */
  refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor((elapsed / 1000) * this.refillRate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  /**
   * Attempts to consume a token. Returns false if rate-limited.
   * @returns {boolean} True if the request is allowed
   */
  tryConsume() {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    return false;
  }

  /**
   * Returns the number of remaining tokens.
   * @returns {number}
   */
  getRemaining() {
    this.refill();
    return this.tokens;
  }

  /**
   * Resets the rate limiter to full capacity.
   */
  reset() {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

/**
 * Generates a CSP-compatible nonce string.
 * @returns {string} Base64-encoded nonce
 */
function generateCSPNonce() {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return btoa(String.fromCharCode(...array));
}

/**
 * Generates a CSRF token.
 * @returns {string} CSRF token
 */
function generateCSRFToken() {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Singleton CSRF token for the session */
const csrfToken = generateCSRFToken();

/**
 * Returns the session CSRF token.
 * @returns {string}
 */
function getCSRFToken() {
  return csrfToken;
}

export {
  escapeHTML,
  sanitizeHTML,
  sanitizeInput,
  escapeForAttribute,
  validatePayload,
  RateLimiter,
  generateCSPNonce,
  generateCSRFToken,
  getCSRFToken
};
