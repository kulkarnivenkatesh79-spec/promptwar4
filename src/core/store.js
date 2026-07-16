/**
 * @fileoverview Reactive Proxy-based state management with subscriber pattern.
 * Provides immutable state reads, action-based mutations, and deep-freeze enforcement.
 * @module core/store
 */

/** @typedef {'fan' | 'organizer'} UserRole */
/** @typedef {'idle' | 'loading' | 'error' | 'success'} AsyncStatus */

/**
 * Deep freezes an object to prevent accidental mutation.
 * @param {Object} obj - Object to freeze
 * @returns {Object} Frozen object
 */
function deepFreeze(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  const propNames = Object.getOwnPropertyNames(obj);
  for (let i = 0; i < propNames.length; i++) {
    const value = obj[propNames[i]];
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj;
}

/**
 * Deep clones a value using structured cloning approach.
 * @param {*} value - Value to clone
 * @returns {*} Cloned value
 */
function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const cloned = {};
  const keys = Object.keys(value);
  for (let i = 0; i < keys.length; i++) {
    cloned[keys[i]] = deepClone(value[keys[i]]);
  }
  return cloned;
}

/** Initial application state */
const initialState = {
  auth: {
    role: 'fan',
    sessionId: generateSessionId(),
    isAuthenticated: true
  },
  ui: {
    sidebarOpen: false,
    currentRoute: '#/fan',
    locale: 'en',
    theme: 'dark',
    isRTL: false,
    toasts: [],
    modalOpen: null
  },
  chat: {
    messages: [],
    isTyping: false,
    selectedLanguage: 'en',
    status: 'idle'
  },
  crowd: {
    venues: {},
    selectedVenue: null,
    heatmapData: [],
    lastUpdated: null,
    status: 'idle'
  },
  incidents: {
    items: [],
    filters: { status: 'all', severity: 'all' },
    selectedIncident: null,
    status: 'idle'
  },
  eco: {
    userPoints: 0,
    actions: [],
    leaderboard: [],
    achievements: [],
    carbonSaved: 0,
    treeEquivalent: 0,
    status: 'idle'
  },
  navigation: {
    routes: [],
    shuttleTimes: [],
    accessiblePaths: [],
    crowdDensity: {},
    selectedDestination: null,
    status: 'idle'
  }
};

/**
 * Generates a cryptographically-adequate session ID.
 * @returns {string} Session identifier
 */
function generateSessionId() {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates a reactive store with Proxy-based change detection.
 * @returns {Object} Store API
 */
function createStore() {
  /** @type {Map<string, Set<Function>>} */
  const subscribers = new Map();
  let state = deepClone(initialState);
  let batchDepth = 0;
  const pendingNotifications = new Set();

  /**
   * Notifies subscribers of a state slice change.
   * @param {string} key - State slice key
   */
  function notifySubscribers(key) {
    if (batchDepth > 0) {
      pendingNotifications.add(key);
      return;
    }
    const subs = subscribers.get(key);
    if (subs) {
      const frozenSlice = deepFreeze(deepClone(state[key]));
      subs.forEach((callback) => {
        try {
          callback(frozenSlice, key);
        } catch (err) {
          console.error(`[Store] Subscriber error for "${key}":`, err);
        }
      });
    }
    const wildcardSubs = subscribers.get('*');
    if (wildcardSubs) {
      const frozenState = deepFreeze(deepClone(state));
      wildcardSubs.forEach((callback) => {
        try {
          callback(frozenState, key);
        } catch (err) {
          console.error(`[Store] Wildcard subscriber error:`, err);
        }
      });
    }
  }

  /**
   * Subscribes to state changes for a given key.
   * @param {string} key - State slice key or '*' for all changes
   * @param {Function} callback - Handler receiving (newValue, key)
   * @returns {Function} Unsubscribe function
   */
  function subscribe(key, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('[Store] subscribe callback must be a function');
    }
    if (!subscribers.has(key)) {
      subscribers.set(key, new Set());
    }
    subscribers.get(key).add(callback);

    return function unsubscribe() {
      const subs = subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          subscribers.delete(key);
        }
      }
    };
  }

  /**
   * Returns a deep-frozen copy of a state slice.
   * @param {string} key - State slice key
   * @returns {*} Frozen state slice
   */
  function getState(key) {
    if (key && state[key] !== undefined) {
      return deepFreeze(deepClone(state[key]));
    }
    return deepFreeze(deepClone(state));
  }

  /**
   * Dispatches a mutation action to update state.
   * @param {string} action - Action identifier in format "slice.action"
   * @param {*} payload - Action payload
   */
  function dispatch(action, payload) {
    if (typeof action !== 'string' || !action.includes('.')) {
      throw new Error(`[Store] Invalid action format: "${action}". Use "slice.action".`);
    }

    const [slice, actionName] = action.split('.');

    if (!state[slice]) {
      throw new Error(`[Store] Unknown state slice: "${slice}"`);
    }

    const prevState = deepClone(state[slice]);

    try {
      const handler = actionHandlers[slice]?.[actionName];
      if (!handler) {
        throw new Error(`[Store] Unknown action: "${action}"`);
      }
      handler(state[slice], payload);
      notifySubscribers(slice);
    } catch (err) {
      state[slice] = prevState;
      console.error(`[Store] Action "${action}" failed, state rolled back:`, err);
      throw err;
    }
  }

  /**
   * Batches multiple dispatches into a single notification cycle.
   * @param {Function} fn - Function containing multiple dispatch calls
   */
  function batch(fn) {
    batchDepth++;
    try {
      fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0) {
        pendingNotifications.forEach((key) => notifySubscribers(key));
        pendingNotifications.clear();
      }
    }
  }

  /**
   * Resets a state slice to its initial value.
   * @param {string} key - State slice key
   */
  function reset(key) {
    if (initialState[key]) {
      state[key] = deepClone(initialState[key]);
      notifySubscribers(key);
    }
  }

  /** Action handlers organized by state slice */
  const actionHandlers = {
    auth: {
      setRole(state, /** @type {UserRole} */ role) {
        if (role !== 'fan' && role !== 'organizer') {
          throw new Error(`Invalid role: ${role}`);
        }
        state.role = role;
      },
      setSession(state, sessionId) {
        state.sessionId = String(sessionId);
      }
    },
    ui: {
      toggleSidebar(state) {
        state.sidebarOpen = !state.sidebarOpen;
      },
      setSidebarOpen(state, open) {
        state.sidebarOpen = Boolean(open);
      },
      setRoute(state, route) {
        state.currentRoute = String(route);
      },
      setLocale(state, locale) {
        state.locale = String(locale);
        state.isRTL = locale === 'ar';
      },
      addToast(state, toast) {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        state.toasts.push({
          id,
          type: toast.type || 'info',
          title: String(toast.title || ''),
          message: String(toast.message || ''),
          duration: Number(toast.duration) || 5000,
          timestamp: Date.now()
        });
      },
      removeToast(state, id) {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      },
      setModal(state, modalId) {
        state.modalOpen = modalId;
      }
    },
    chat: {
      addMessage(state, message) {
        state.messages.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          role: String(message.role || 'user'),
          content: String(message.content || ''),
          language: String(message.language || 'en'),
          timestamp: Date.now()
        });
      },
      updateLastMessage(state, content) {
        if (state.messages.length > 0) {
          state.messages[state.messages.length - 1].content = String(content);
        }
      },
      setTyping(state, isTyping) {
        state.isTyping = Boolean(isTyping);
      },
      setLanguage(state, lang) {
        state.selectedLanguage = String(lang);
      },
      setStatus(state, status) {
        state.status = String(status);
      },
      clearMessages(state) {
        state.messages = [];
      }
    },
    crowd: {
      setVenues(state, venues) {
        state.venues = venues;
      },
      setSelectedVenue(state, venueId) {
        state.selectedVenue = venueId;
      },
      setHeatmapData(state, data) {
        state.heatmapData = Array.isArray(data) ? data : [];
      },
      setLastUpdated(state) {
        state.lastUpdated = Date.now();
      },
      setStatus(state, status) {
        state.status = String(status);
      }
    },
    incidents: {
      setItems(state, items) {
        state.items = Array.isArray(items) ? items : [];
      },
      addItem(state, item) {
        state.items.unshift({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          category: String(item.category || 'general'),
          location: String(item.location || ''),
          severity: String(item.severity || 'medium'),
          description: String(item.description || ''),
          status: 'reported',
          reportedAt: Date.now(),
          protocol: item.protocol || null,
          assignee: null
        });
      },
      updateStatus(state, { id, status }) {
        const incident = state.items.find((i) => i.id === id);
        if (incident) {
          incident.status = String(status);
          if (status === 'resolved') {
            incident.resolvedAt = Date.now();
          }
        }
      },
      setProtocol(state, { id, protocol }) {
        const incident = state.items.find((i) => i.id === id);
        if (incident) {
          incident.protocol = protocol;
        }
      },
      setFilters(state, filters) {
        state.filters = { ...state.filters, ...filters };
      },
      setSelected(state, id) {
        state.selectedIncident = id;
      },
      setStatus(state, status) {
        state.status = String(status);
      }
    },
    eco: {
      addPoints(state, points) {
        state.userPoints += Number(points) || 0;
      },
      addAction(state, action) {
        state.actions.push({
          id: Date.now().toString(36),
          type: String(action.type || ''),
          points: Number(action.points) || 0,
          label: String(action.label || ''),
          timestamp: Date.now()
        });
      },
      setLeaderboard(state, data) {
        state.leaderboard = Array.isArray(data) ? data : [];
      },
      addAchievement(state, achievement) {
        if (!state.achievements.find((a) => a.id === achievement.id)) {
          state.achievements.push({
            id: String(achievement.id),
            title: String(achievement.title || ''),
            icon: String(achievement.icon || '🏆'),
            earnedAt: Date.now()
          });
        }
      },
      setCarbonSaved(state, kg) {
        state.carbonSaved = Number(kg) || 0;
        state.treeEquivalent = Math.round((Number(kg) || 0) / 22);
      },
      setStatus(state, status) {
        state.status = String(status);
      }
    },
    navigation: {
      setRoutes(state, routes) {
        state.routes = Array.isArray(routes) ? routes : [];
      },
      setShuttleTimes(state, times) {
        state.shuttleTimes = Array.isArray(times) ? times : [];
      },
      setAccessiblePaths(state, paths) {
        state.accessiblePaths = Array.isArray(paths) ? paths : [];
      },
      setCrowdDensity(state, density) {
        state.crowdDensity = density || {};
      },
      setDestination(state, dest) {
        state.selectedDestination = dest;
      },
      setStatus(state, status) {
        state.status = String(status);
      }
    }
  };

  return {
    subscribe,
    getState,
    dispatch,
    batch,
    reset,
    generateSessionId
  };
}

/** Singleton store instance */
const store = createStore();

export default store;
export { createStore, deepFreeze, deepClone };
