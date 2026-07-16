/**
 * @fileoverview Edge-case tests — network failures, bad inputs, XSS injection.
 */
import { describe, it, expect, vi } from 'vitest';
import { sanitizeInput, sanitizeHTML } from '../../core/security.js';
import { fetchWithRetry, apiRateLimiter } from '../../core/api.js';

describe('Security Edge Cases (XSS)', () => {
  it('neutralizes deeply nested XSS vectors', () => {
    const input = '<<<<script>script>alert(1)</script>script>';
    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('handles zero-width characters in input', () => {
    const input = 'hello\u200Bworld';
    const sanitized = sanitizeInput(input);
    expect(sanitized).toBe('helloworld');
  });

  it('removes unicode script tags', () => {
    const input = '<\u0073\u0063\u0072\u0069\u0070\u0074>alert(1)</script>';
    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain('script');
  });
});

describe('Network Failure & Retry Edge Cases', () => {
  it('retries up to 3 times on failure and eventually fails', async () => {
    const start = Date.now();
    try {
      // 100% failure rate
      await fetchWithRetry('/api/test', { failureRate: 1.0, retries: 2, cacheTTL: 0 });
      expect.fail('Should have thrown an ApiError');
    } catch (err) {
      expect(err.name).toBe('ApiError');
      const duration = Date.now() - start;
      // Should have taken some time for retries
      expect(duration).toBeGreaterThan(100);
    }
  }, 15000);

  it('aborts request instantly when signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort(); // abort immediately

    try {
      await fetchWithRetry('/api/venues', { signal: controller.signal });
      expect.fail('Should have thrown AbortError');
    } catch (err) {
      expect(err.name).toBe('AbortError');
    }
  });
});

describe('Rate Limiting Edge Cases', () => {
  it('blocks requests when totally exhausted', () => {
    apiRateLimiter.reset();
    
    // Exhaust all tokens
    for (let i = 0; i < apiRateLimiter.maxTokens; i++) {
      expect(apiRateLimiter.tryConsume()).toBe(true);
    }
    
    // Next request should fail
    expect(apiRateLimiter.tryConsume()).toBe(false);
  });
});
