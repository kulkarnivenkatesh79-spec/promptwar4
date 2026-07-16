/**
 * @fileoverview Security module unit tests — XSS vectors, rate limiting, validation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  escapeHTML, sanitizeHTML, sanitizeInput, escapeForAttribute,
  validatePayload, RateLimiter, generateCSPNonce, generateCSRFToken
} from '../../core/security.js';

describe('escapeHTML', () => {
  it('escapes ampersands', () => {
    expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });
  it('escapes less-than and greater-than', () => {
    expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
  });
  it('escapes double and single quotes', () => {
    expect(escapeHTML('"hello" & \'world\'')).toBe('&quot;hello&quot; &amp; &#x27;world&#x27;');
  });
  it('escapes backticks and forward slashes', () => {
    expect(escapeHTML('`test`/path')).toBe('&#96;test&#96;&#x2F;path');
  });
  it('returns empty string for non-string input', () => {
    expect(escapeHTML(null)).toBe('');
    expect(escapeHTML(undefined)).toBe('');
    expect(escapeHTML(42)).toBe('');
  });
  it('handles empty string', () => {
    expect(escapeHTML('')).toBe('');
  });
  it('preserves safe text', () => {
    expect(escapeHTML('Hello World 123')).toBe('Hello World 123');
  });
});

describe('sanitizeHTML', () => {
  it('strips script tags', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeHTML('<script>alert("xss")</script>')).not.toContain('</script>');
  });
  it('strips all HTML tags', () => {
    expect(sanitizeHTML('<div><p>Hello</p></div>')).not.toContain('<div>');
    expect(sanitizeHTML('<div><p>Hello</p></div>')).not.toContain('<p>');
  });
  it('strips event handler attributes', () => {
    const result = sanitizeHTML('<button onclick="alert(1)">Click</button>');
    expect(result).not.toContain('onclick');
    expect(result).toBe('Click');
  });
  it('strips javascript: protocol', () => {
    const result = sanitizeHTML('<a href="javascript:alert(1)">Link</a>');
    expect(result).not.toContain('javascript:');
    expect(result).toBe('Link');
  });
  it('handles nested script injections', () => {
    const result = sanitizeHTML('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('<img');
    expect(result).not.toContain('onerror');
  });
  it('strips SVG-based XSS vectors', () => {
    const result = sanitizeHTML('<svg onload=alert(1)>');
    expect(result).not.toContain('<svg');
  });
  it('returns empty string for non-string input', () => {
    expect(sanitizeHTML(null)).toBe('');
  });
});

describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
  it('enforces maximum length', () => {
    const long = 'a'.repeat(3000);
    expect(sanitizeInput(long, { maxLength: 100 }).length).toBe(100);
  });
  it('removes control characters', () => {
    expect(sanitizeInput('hello\x00world')).toBe('helloworld');
    expect(sanitizeInput('test\x07data')).toBe('testdata');
  });
  it('preserves newlines when allowed', () => {
    expect(sanitizeInput('line1\nline2', { allowNewlines: true })).toContain('\n');
  });
  it('removes newlines when not allowed', () => {
    expect(sanitizeInput('line1\nline2', { allowNewlines: false })).not.toContain('\n');
  });
  it('strips javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:');
  });
  it('strips event handlers from input', () => {
    expect(sanitizeInput('test onclick=alert(1)')).not.toContain('onclick');
  });
  it('returns empty string for non-string input', () => {
    expect(sanitizeInput(123)).toBe('');
  });
  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('escapeForAttribute', () => {
  it('escapes attribute-dangerous characters', () => {
    expect(escapeForAttribute('" onclick="alert')).toContain('&quot;');
    expect(escapeForAttribute('" onclick="alert')).not.toContain('"');
  });
  it('returns empty for non-string', () => {
    expect(escapeForAttribute(null)).toBe('');
  });
});

describe('validatePayload', () => {
  const schema = {
    name: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    age: { type: 'number', required: false, min: 0, max: 150 },
    role: { type: 'string', required: true, enum: ['admin', 'user', 'viewer'] }
  };

  it('validates a correct payload', () => {
    const result = validatePayload(schema, { name: 'John', age: 30, role: 'admin' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing required fields', () => {
    const result = validatePayload(schema, { age: 30 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid types', () => {
    const result = validatePayload(schema, { name: 123, role: 'admin' });
    expect(result.valid).toBe(false);
  });

  it('rejects values outside enum', () => {
    const result = validatePayload(schema, { name: 'John', role: 'hacker' });
    expect(result.valid).toBe(false);
  });

  it('rejects strings below minLength', () => {
    const result = validatePayload(schema, { name: 'J', role: 'user' });
    expect(result.valid).toBe(false);
  });

  it('rejects strings above maxLength', () => {
    const result = validatePayload(schema, { name: 'A'.repeat(51), role: 'user' });
    expect(result.valid).toBe(false);
  });

  it('rejects numbers outside range', () => {
    const result = validatePayload(schema, { name: 'John', age: -1, role: 'user' });
    expect(result.valid).toBe(false);
  });

  it('rejects null payload', () => {
    const result = validatePayload(schema, null);
    expect(result.valid).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('allows requests up to maxTokens', () => {
    const limiter = new RateLimiter({ maxTokens: 3, refillRate: 0, windowMs: 60000 });
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(true);
    expect(limiter.tryConsume()).toBe(false);
  });

  it('returns remaining token count', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 0 });
    limiter.tryConsume();
    limiter.tryConsume();
    expect(limiter.getRemaining()).toBe(3);
  });

  it('resets to full capacity', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 0 });
    limiter.tryConsume();
    limiter.tryConsume();
    limiter.reset();
    expect(limiter.getRemaining()).toBe(5);
  });

  it('blocks after exhaustion', () => {
    const limiter = new RateLimiter({ maxTokens: 1, refillRate: 0 });
    limiter.tryConsume();
    expect(limiter.tryConsume()).toBe(false);
    expect(limiter.tryConsume()).toBe(false);
  });
});

describe('generateCSPNonce', () => {
  it('generates a non-empty string', () => {
    const nonce = generateCSPNonce();
    expect(typeof nonce).toBe('string');
    expect(nonce.length).toBeGreaterThan(0);
  });

  it('generates unique values', () => {
    const a = generateCSPNonce();
    const b = generateCSPNonce();
    expect(a).not.toBe(b);
  });
});

describe('generateCSRFToken', () => {
  it('generates a 64-character hex string', () => {
    const token = generateCSRFToken();
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });
});
