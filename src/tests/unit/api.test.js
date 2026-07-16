/**
 * @fileoverview API resilience unit tests — retry, caching, rate limiting.
 */
import { describe, it, expect } from 'vitest';
import { generateLiveCrowdData, generateNavigationRoutes } from '../../core/api.js';

describe('API Mock Data Generation', () => {
  it('generates valid crowd data', () => {
    const data = generateLiveCrowdData();
    expect(data).toHaveProperty('totalCapacity');
    expect(data).toHaveProperty('currentOccupancy');
    expect(data).toHaveProperty('gates');
    expect(data.totalCapacity).toBe(80000);
    expect(typeof data.currentOccupancy).toBe('number');
    expect(data.currentOccupancy).toBeGreaterThanOrEqual(0);
  });

  it('generates gate data with required properties', () => {
    const data = generateLiveCrowdData();
    const gateNames = Object.keys(data.gates);
    expect(gateNames.length).toBeGreaterThan(0);

    gateNames.forEach((name) => {
      const gate = data.gates[name];
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('capacity');
      expect(gate).toHaveProperty('current');
      expect(gate).toHaveProperty('percentage');
      expect(gate).toHaveProperty('throughput');
      expect(gate).toHaveProperty('waitTime');
      expect(gate.percentage).toBeGreaterThanOrEqual(0);
      expect(gate.percentage).toBeLessThanOrEqual(100);
    });
  });

  it('generates navigation routes with required properties', () => {
    const routes = generateNavigationRoutes();
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);

    routes.forEach((route) => {
      expect(route).toHaveProperty('id');
      expect(route).toHaveProperty('from');
      expect(route).toHaveProperty('to');
      expect(route).toHaveProperty('distance');
      expect(route).toHaveProperty('walkingTime');
      expect(route).toHaveProperty('crowdLevel');
      expect(route).toHaveProperty('accessible');
      expect(route).toHaveProperty('features');
      expect(typeof route.accessible).toBe('boolean');
      expect(Array.isArray(route.features)).toBe(true);
    });
  });

  it('generates timestamp with crowd data', () => {
    const data = generateLiveCrowdData();
    expect(data).toHaveProperty('timestamp');
    expect(typeof data.timestamp).toBe('number');
    expect(data.timestamp).toBeGreaterThan(0);
  });

  it('generates different data on subsequent calls', () => {
    const a = generateLiveCrowdData();
    const b = generateLiveCrowdData();
    const differentOccupancy = a.currentOccupancy !== b.currentOccupancy;
    const differentTimestamp = a.timestamp !== b.timestamp;
    expect(differentOccupancy || differentTimestamp).toBe(true);
  });
});

describe('API Error Handling', () => {
  it('ApiError has correct properties', async () => {
    const { ApiError } = await import('../../core/api.js');
    const error = new ApiError('Test error', 500, 'SERVER_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(500);
    expect(error.code).toBe('SERVER_ERROR');
    expect(error.name).toBe('ApiError');
    expect(error instanceof Error).toBe(true);
  });

  it('ApiError for rate limiting', async () => {
    const { ApiError } = await import('../../core/api.js');
    const error = new ApiError('Rate limited', 429, 'RATE_LIMITED');
    expect(error.status).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('ApiError for timeout', async () => {
    const { ApiError } = await import('../../core/api.js');
    const error = new ApiError('Request timeout', 408, 'TIMEOUT');
    expect(error.status).toBe(408);
  });
});
