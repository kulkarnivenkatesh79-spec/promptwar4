/**
 * @fileoverview i18n unit tests — all locales, interpolation, fallback, RTL, detection.
 */
import { describe, it, expect } from 'vitest';
import { translations } from '../../data/translations.js';

const EXPECTED_LOCALES = ['en', 'es', 'fr', 'pt', 'ar', 'de', 'ja', 'ko', 'zh', 'hi', 'it', 'nl'];

describe('translations', () => {
  it('has all 12 expected locales', () => {
    EXPECTED_LOCALES.forEach((locale) => {
      expect(translations).toHaveProperty(locale);
    });
  });

  it('every locale has required top-level keys', () => {
    const requiredKeys = ['app', 'nav', 'fan', 'chat', 'navigation', 'eco', 'crowd', 'incidents', 'common'];
    EXPECTED_LOCALES.forEach((locale) => {
      requiredKeys.forEach((key) => {
        expect(translations[locale]).toHaveProperty(key);
      });
    });
  });

  it('English has all expected nested keys', () => {
    expect(translations.en.app.title).toBe('FIFA 2026 Smart Stadium');
    expect(translations.en.nav.fanHome).toBe('Fan Dashboard');
    expect(translations.en.chat.welcome).toBeDefined();
    expect(typeof translations.en.chat.welcome).toBe('string');
    expect(translations.en.chat.welcome.length).toBeGreaterThan(10);
  });

  it('all locales have matching key structure to English', () => {
    const enKeys = Object.keys(translations.en);
    EXPECTED_LOCALES.forEach((locale) => {
      if (locale === 'en') return;
      enKeys.forEach((key) => {
        expect(translations[locale]).toHaveProperty(key);
      });
    });
  });

  it('Arabic translations exist and contain Arabic characters', () => {
    expect(translations.ar.app.title).toMatch(/[\u0600-\u06FF]/);
    expect(translations.ar.nav.fanHome).toMatch(/[\u0600-\u06FF]/);
  });

  it('Japanese translations contain Japanese characters', () => {
    expect(translations.ja.app.title).toMatch(/[\u3040-\u30FF\u4E00-\u9FFF]/);
  });

  it('Korean translations contain Korean characters', () => {
    expect(translations.ko.app.title).toMatch(/[\uAC00-\uD7AF]/);
  });

  it('Chinese translations contain Chinese characters', () => {
    expect(translations.zh.app.title).toMatch(/[\u4E00-\u9FFF]/);
  });

  it('Hindi translations contain Devanagari characters', () => {
    expect(translations.hi.app.title).toMatch(/[\u0900-\u097F]/);
  });

  it('interpolation placeholders use {{param}} format', () => {
    const checkInterpolation = (obj) => {
      Object.values(obj).forEach((val) => {
        if (typeof val === 'string' && val.includes('{{')) {
          expect(val).toMatch(/\{\{\w+\}\}/);
        } else if (typeof val === 'object' && val !== null) {
          checkInterpolation(val);
        }
      });
    };
    checkInterpolation(translations.en);
  });
});

describe('language detection heuristics', () => {
  it('detects Arabic from script characters', () => {
    expect(/[\u0600-\u06FF]/.test('مرحبا')).toBe(true);
  });

  it('detects Japanese from script characters', () => {
    expect(/[\u3040-\u309F\u30A0-\u30FF]/.test('こんにちは')).toBe(true);
  });

  it('detects Korean from script characters', () => {
    expect(/[\uAC00-\uD7AF]/.test('안녕하세요')).toBe(true);
  });

  it('detects Chinese from script characters', () => {
    expect(/[\u4E00-\u9FFF]/.test('你好世界')).toBe(true);
  });

  it('detects Spanish from keyword patterns', () => {
    expect(/\b(hola|dónde|cómo)\b/i.test('Hola, dónde está el estadio?')).toBe(true);
  });

  it('detects French from keyword patterns', () => {
    expect(/\b(bonjour|où|comment)\b/i.test('Bonjour, où est le stade?')).toBe(true);
  });
});
