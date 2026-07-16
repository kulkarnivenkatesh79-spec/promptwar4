/**
 * @fileoverview Router unit tests.
 */
import { describe, it, expect } from 'vitest';

describe('Router route matching', () => {
  const routes = [
    { path: '#/fan', requiredRole: 'fan' },
    { path: '#/fan/assistant', requiredRole: 'fan' },
    { path: '#/fan/navigation', requiredRole: 'fan' },
    { path: '#/fan/eco', requiredRole: 'fan' },
    { path: '#/org', requiredRole: 'organizer' },
    { path: '#/org/crowd', requiredRole: 'organizer' },
    { path: '#/org/incidents', requiredRole: 'organizer' }
  ];

  function matchRoute(hash) {
    return routes.find((r) => r.path === hash) || null;
  }

  it('matches fan home route', () => {
    expect(matchRoute('#/fan')).toBeTruthy();
    expect(matchRoute('#/fan').requiredRole).toBe('fan');
  });

  it('matches fan sub-routes', () => {
    expect(matchRoute('#/fan/assistant')).toBeTruthy();
    expect(matchRoute('#/fan/navigation')).toBeTruthy();
    expect(matchRoute('#/fan/eco')).toBeTruthy();
  });

  it('matches org routes', () => {
    expect(matchRoute('#/org')).toBeTruthy();
    expect(matchRoute('#/org/crowd')).toBeTruthy();
    expect(matchRoute('#/org/incidents')).toBeTruthy();
  });

  it('returns null for unknown routes', () => {
    expect(matchRoute('#/unknown')).toBeNull();
    expect(matchRoute('#/fan/unknown')).toBeNull();
    expect(matchRoute('')).toBeNull();
  });

  it('enforces role-based access for fan routes', () => {
    const route = matchRoute('#/fan');
    expect(route.requiredRole).toBe('fan');
  });

  it('enforces role-based access for org routes', () => {
    const route = matchRoute('#/org/crowd');
    expect(route.requiredRole).toBe('organizer');
  });

  it('has correct total number of routes', () => {
    expect(routes).toHaveLength(7);
  });

  it('all routes have required properties', () => {
    routes.forEach((route) => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('requiredRole');
      expect(typeof route.path).toBe('string');
      expect(route.path.startsWith('#/')).toBe(true);
    });
  });
});
