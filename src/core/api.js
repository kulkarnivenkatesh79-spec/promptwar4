/**
 * @fileoverview Mock API service with configurable latency, failure simulation,
 * exponential backoff retry, request deduplication, caching, and AbortController support.
 * @module core/api
 */

import { RateLimiter, getCSRFToken, validatePayload } from './security.js';
import store from './store.js';

/** @type {RateLimiter} Global API rate limiter */
const apiRateLimiter = new RateLimiter({ maxTokens: 30, refillRate: 2, windowMs: 60000 });

/** @type {Map<string, {data: *, expires: number}>} Response cache */
const responseCache = new Map();

/** @type {Map<string, Promise>} In-flight request deduplication map */
const inflightRequests = new Map();

/** @type {number} Default cache TTL in milliseconds */
const DEFAULT_CACHE_TTL = 30000;

/** @type {number} Deduplication window in milliseconds */
const DEDUP_WINDOW = 100;

/**
 * Simulates network latency.
 * @param {number} [min=200] - Minimum delay in ms
 * @param {number} [max=800] - Maximum delay in ms
 * @param {AbortSignal} [signal] - Abort signal
 * @returns {Promise<void>}
 */
function simulateLatency(min = 200, max = 800, signal) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, delay);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Request aborted', 'AbortError'));
      }, { once: true });
    }
  });
}

/**
 * Simulates a failure based on a probability.
 * @param {number} [failureRate=0] - Probability of failure (0-1)
 * @returns {{ shouldFail: boolean, errorType: string }}
 */
function maybeSimulateFailure(failureRate = 0) {
  if (Math.random() > failureRate) {
    return { shouldFail: false, errorType: null };
  }

  const errors = [
    { errorType: 'timeout', status: 408, message: 'Request timeout' },
    { errorType: 'server', status: 500, message: 'Internal server error' },
    { errorType: 'rateLimit', status: 429, message: 'Too many requests' },
    { errorType: 'malformed', status: 200, message: 'Malformed response' }
  ];

  const error = errors[Math.floor(Math.random() * errors.length)];
  return { shouldFail: true, ...error };
}

/**
 * Fetches data with automatic retry and exponential backoff.
 * @param {string} endpoint - API endpoint path
 * @param {Object} [options] - Fetch options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.body] - Request body
 * @param {number} [options.retries=3] - Max retry attempts
 * @param {number} [options.cacheTTL] - Cache TTL in ms (0 to disable)
 * @param {AbortSignal} [options.signal] - AbortController signal
 * @param {number} [options.failureRate=0] - Simulated failure rate (0-1)
 * @returns {Promise<Object>} Response data
 */
async function fetchWithRetry(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    retries = 3,
    cacheTTL = DEFAULT_CACHE_TTL,
    signal = null,
    failureRate = 0
  } = options;

  if (!apiRateLimiter.tryConsume()) {
    throw new ApiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED');
  }

  const cacheKey = `${method}:${endpoint}:${JSON.stringify(body)}`;

  if (method === 'GET' && cacheTTL > 0) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = executeWithRetry(endpoint, method, body, retries, signal, failureRate, cacheTTL, cacheKey);

  inflightRequests.set(cacheKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    setTimeout(() => inflightRequests.delete(cacheKey), DEDUP_WINDOW);
  }
}

/**
 * Executes a request with retry logic.
 * @param {string} endpoint
 * @param {string} method
 * @param {Object|null} body
 * @param {number} retries
 * @param {AbortSignal|null} signal
 * @param {number} failureRate
 * @param {number} cacheTTL
 * @param {string} cacheKey
 * @returns {Promise<Object>}
 */
async function executeWithRetry(endpoint, method, body, retries, signal, failureRate, cacheTTL, cacheKey) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal && signal.aborted) {
      throw new DOMException('Request aborted', 'AbortError');
    }

    try {
      await simulateLatency(150, 600, signal);

      const failure = maybeSimulateFailure(failureRate);
      if (failure.shouldFail) {
        throw new ApiError(failure.message, failure.status, failure.errorType);
      }

      const responseData = getMockResponse(endpoint, method, body);

      if (method === 'GET' && cacheTTL > 0) {
        responseCache.set(cacheKey, {
          data: responseData,
          expires: Date.now() + cacheTTL
        });
      }

      return responseData;

    } catch (err) {
      lastError = err;

      if (err.name === 'AbortError') throw err;

      if (attempt < retries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 8000);
        const jitter = Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, backoffDelay + jitter));
      }
    }
  }

  throw lastError || new ApiError('Request failed after all retries', 500, 'EXHAUSTED_RETRIES');
}

/**
 * Custom API error class.
 */
class ApiError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} status - HTTP status code
   * @param {string} code - Error code
   */
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Returns mock response data for an endpoint.
 * @param {string} endpoint - Endpoint path
 * @param {string} method - HTTP method
 * @param {Object|null} body - Request body
 * @returns {Object} Mock response
 */
function getMockResponse(endpoint, method, body) {
  const routes = {
    '/api/venues': () => {
      const { venues } = require('../data/venues.js');
      return { success: true, data: venues };
    },
    '/api/crowd/live': () => {
      return {
        success: true,
        data: generateLiveCrowdData(),
        timestamp: Date.now()
      };
    },
    '/api/incidents': () => {
      return {
        success: true,
        data: store.getState('incidents').items
      };
    },
    '/api/incidents/report': () => {
      return {
        success: true,
        data: { id: Date.now().toString(36), status: 'reported' }
      };
    },
    '/api/eco/stats': () => {
      return {
        success: true,
        data: store.getState('eco')
      };
    },
    '/api/navigation/routes': () => {
      return {
        success: true,
        data: generateNavigationRoutes()
      };
    },
    '/api/chat/stream': () => {
      return {
        success: true,
        data: { message: 'Stream initialized' }
      };
    }
  };

  const handler = routes[endpoint];
  if (handler) {
    return handler();
  }

  return { success: true, data: null };
}

/**
 * Generates simulated live crowd data.
 * @returns {Object} Crowd data
 */
function generateLiveCrowdData() {
  const gateNames = ['A', 'B', 'C', 'D', 'E', 'F'];
  const gates = {};

  gateNames.forEach((name) => {
    const capacity = 5000 + Math.floor(Math.random() * 3000);
    const current = Math.floor(Math.random() * capacity);
    gates[name] = {
      name: `Gate ${name}`,
      capacity,
      current,
      percentage: Math.round((current / capacity) * 100),
      throughput: Math.floor(Math.random() * 200) + 50,
      waitTime: Math.floor(Math.random() * 15) + 1
    };
  });

  return {
    totalCapacity: 80000,
    currentOccupancy: Object.values(gates).reduce((sum, g) => sum + g.current, 0),
    gates,
    timestamp: Date.now()
  };
}

/**
 * Generates simulated navigation routes.
 * @returns {Object[]} Navigation routes
 */
function generateNavigationRoutes() {
  return [
    {
      id: 'route-1',
      from: 'Main Entrance',
      to: 'Section 101',
      distance: '250m',
      walkingTime: '4 min',
      crowdLevel: 'low',
      accessible: true,
      features: ['elevator', 'ramp']
    },
    {
      id: 'route-2',
      from: 'Gate B',
      to: 'Section 205',
      distance: '180m',
      walkingTime: '3 min',
      crowdLevel: 'medium',
      accessible: true,
      features: ['ramp']
    },
    {
      id: 'route-3',
      from: 'Parking Lot C',
      to: 'Gate D',
      distance: '400m',
      walkingTime: '6 min',
      crowdLevel: 'high',
      accessible: false,
      features: ['stairs']
    }
  ];
}

/**
 * Clears the response cache.
 */
function clearCache() {
  responseCache.clear();
}

/**
 * Returns the current API rate limiter status.
 * @returns {{ remaining: number, maxTokens: number }}
 */
function getRateLimitStatus() {
  return {
    remaining: apiRateLimiter.getRemaining(),
    maxTokens: apiRateLimiter.maxTokens
  };
}

export {
  fetchWithRetry,
  clearCache,
  getRateLimitStatus,
  ApiError,
  apiRateLimiter,
  simulateLatency,
  generateLiveCrowdData,
  generateNavigationRoutes
};
