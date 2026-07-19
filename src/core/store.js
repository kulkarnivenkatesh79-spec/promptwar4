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

  /**
   * Action handlers for authentication state.
   * @type {Object<string, Function>}
   */
  const authHandlers = {
    /**
     * Sets the current user role.
     * @param {Object} state - The auth state slice
     * @param {UserRole} role - The new role to set
     */
    setRole(state, role) {
      if (role !== 'fan' && role !== 'organizer') {
        throw new Error(`Invalid role: ${role}`);
      }
      state.role = role;
    },
    /**
     * Sets the current session ID.
     * @param {Object} state - The auth state slice
     * @param {string} sessionId - The session ID
     */
    setSession(state, sessionId) {
      state.sessionId = String(sessionId);
    }
  };

  /**
   * Action handlers for UI state.
   * @type {Object<string, Function>}
   */
  const uiHandlers = {
    /**
     * Toggles the sidebar open/closed state.
     * @param {Object} state - The UI state slice
     */
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    /**
     * Explicitly sets the sidebar open state.
     * @param {Object} state - The UI state slice
     * @param {boolean} open - Whether the sidebar should be open
     */
    setSidebarOpen(state, open) {
      state.sidebarOpen = Boolean(open);
    },
    /**
     * Sets the current route path.
     * @param {Object} state - The UI state slice
     * @param {string} route - The route hash path
     */
    setRoute(state, route) {
      state.currentRoute = String(route);
    },
    /**
     * Sets the current active locale and RTL flag.
     * @param {Object} state - The UI state slice
     * @param {string} locale - The locale code
     */
    setLocale(state, locale) {
      state.locale = String(locale);
      state.isRTL = locale === 'ar';
    },
    /**
     * Adds a new toast notification.
     * @param {Object} state - The UI state slice
     * @param {Object} toast - The toast notification data
     */
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
    /**
     * Removes a toast notification by ID.
     * @param {Object} state - The UI state slice
     * @param {string} id - The toast ID to remove
     */
    removeToast(state, id) {
      state.toasts = state.toasts.filter((t) => t.id !== id);
    },
    /**
     * Sets the currently open modal.
     * @param {Object} state - The UI state slice
     * @param {string|null} modalId - The modal ID or null
     */
    setModal(state, modalId) {
      state.modalOpen = modalId;
    }
  };

  /**
   * Action handlers for chat state.
   * @type {Object<string, Function>}
   */
  const chatHandlers = {
    /**
     * Adds a new chat message.
     * @param {Object} state - The chat state slice
     * @param {Object} message - The message object
     */
    addMessage(state, message) {
      state.messages.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        role: String(message.role || 'user'),
        content: String(message.content || ''),
        language: String(message.language || 'en'),
        timestamp: Date.now()
      });
    },
    /**
     * Updates the content of the last chat message.
     * @param {Object} state - The chat state slice
     * @param {string} content - The new content string
     */
    updateLastMessage(state, content) {
      if (state.messages.length > 0) {
        state.messages[state.messages.length - 1].content = String(content);
      }
    },
    /**
     * Sets the typing indicator status.
     * @param {Object} state - The chat state slice
     * @param {boolean} isTyping - True if typing
     */
    setTyping(state, isTyping) {
      state.isTyping = Boolean(isTyping);
    },
    /**
     * Sets the preferred chat language.
     * @param {Object} state - The chat state slice
     * @param {string} lang - The language code
     */
    setLanguage(state, lang) {
      state.selectedLanguage = String(lang);
    },
    /**
     * Sets the chat engine connection status.
     * @param {Object} state - The chat state slice
     * @param {AsyncStatus} status - The new status
     */
    setStatus(state, status) {
      state.status = String(status);
    },
    /**
     * Clears all chat messages.
     * @param {Object} state - The chat state slice
     */
    clearMessages(state) {
      state.messages = [];
    }
  };

  /**
   * Action handlers for crowd intelligence state.
   * @type {Object<string, Function>}
   */
  const crowdHandlers = {
    /**
     * Sets the available venues.
     * @param {Object} state - The crowd state slice
     * @param {Object} venues - Venues mapping
     */
    setVenues(state, venues) {
      state.venues = venues;
    },
    /**
     * Sets the currently selected venue ID.
     * @param {Object} state - The crowd state slice
     * @param {string} venueId - Venue ID
     */
    setSelectedVenue(state, venueId) {
      state.selectedVenue = venueId;
    },
    /**
     * Sets the heatmap data points.
     * @param {Object} state - The crowd state slice
     * @param {Array} data - Heatmap data array
     */
    setHeatmapData(state, data) {
      state.heatmapData = Array.isArray(data) ? data : [];
    },
    /**
     * Updates the last updated timestamp to now.
     * @param {Object} state - The crowd state slice
     */
    setLastUpdated(state) {
      state.lastUpdated = Date.now();
    },
    /**
     * Sets the crowd data fetch status.
     * @param {Object} state - The crowd state slice
     * @param {AsyncStatus} status - Status
     */
    setStatus(state, status) {
      state.status = String(status);
    }
  };

  /**
   * Action handlers for incidents state.
   * @type {Object<string, Function>}
   */
  const incidentsHandlers = {
    /**
     * Replaces the entire incidents list.
     * @param {Object} state - The incidents state slice
     * @param {Array} items - Array of incidents
     */
    setItems(state, items) {
      state.items = Array.isArray(items) ? items : [];
    },
    /**
     * Adds a new incident to the top of the list.
     * @param {Object} state - The incidents state slice
     * @param {Object} item - Incident data
     */
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
    /**
     * Updates the status of an existing incident.
     * @param {Object} state - The incidents state slice
     * @param {Object} payload - Object containing id and status
     */
    updateStatus(state, { id, status }) {
      const incident = state.items.find((i) => i.id === id);
      if (incident) {
        incident.status = String(status);
        if (status === 'resolved') {
          incident.resolvedAt = Date.now();
        }
      }
    },
    /**
     * Attaches an AI-generated protocol to an incident.
     * @param {Object} state - The incidents state slice
     * @param {Object} payload - Object containing id and protocol
     */
    setProtocol(state, { id, protocol }) {
      const incident = state.items.find((i) => i.id === id);
      if (incident) {
        incident.protocol = protocol;
      }
    },
    /**
     * Sets incident list filters.
     * @param {Object} state - The incidents state slice
     * @param {Object} filters - Filter configuration
     */
    setFilters(state, filters) {
      state.filters = { ...state.filters, ...filters };
    },
    /**
     * Selects an incident by ID.
     * @param {Object} state - The incidents state slice
     * @param {string} id - Incident ID
     */
    setSelected(state, id) {
      state.selectedIncident = id;
    },
    /**
     * Sets incidents sync status.
     * @param {Object} state - The incidents state slice
     * @param {AsyncStatus} status - Status
     */
    setStatus(state, status) {
      state.status = String(status);
    }
  };

  /**
   * Action handlers for eco tracker state.
   * @type {Object<string, Function>}
   */
  const ecoHandlers = {
    /**
     * Adds points to the user's total.
     * @param {Object} state - The eco state slice
     * @param {number} points - Points to add
     */
    addPoints(state, points) {
      state.userPoints += Number(points) || 0;
    },
    /**
     * Logs a completed eco action.
     * @param {Object} state - The eco state slice
     * @param {Object} action - Action details
     */
    addAction(state, action) {
      state.actions.push({
        id: Date.now().toString(36),
        type: String(action.type || ''),
        points: Number(action.points) || 0,
        label: String(action.label || ''),
        timestamp: Date.now()
      });
    },
    /**
     * Sets the global leaderboard data.
     * @param {Object} state - The eco state slice
     * @param {Array} data - Leaderboard entries
     */
    setLeaderboard(state, data) {
      state.leaderboard = Array.isArray(data) ? data : [];
    },
    /**
     * Awards an achievement if not already earned.
     * @param {Object} state - The eco state slice
     * @param {Object} achievement - Achievement details
     */
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
    /**
     * Updates total carbon saved metrics.
     * @param {Object} state - The eco state slice
     * @param {number} kg - Carbon saved in kg
     */
    setCarbonSaved(state, kg) {
      state.carbonSaved = Number(kg) || 0;
      state.treeEquivalent = Math.round((Number(kg) || 0) / 22);
    },
    /**
     * Sets eco tracker fetch status.
     * @param {Object} state - The eco state slice
     * @param {AsyncStatus} status - Status
     */
    setStatus(state, status) {
      state.status = String(status);
    }
  };

  /**
   * Action handlers for smart navigation state.
   * @type {Object<string, Function>}
   */
  const navigationHandlers = {
    /**
     * Sets available navigation routes.
     * @param {Object} state - The nav state slice
     * @param {Array} routes - Available routes
     */
    setRoutes(state, routes) {
      state.routes = Array.isArray(routes) ? routes : [];
    },
    /**
     * Sets real-time shuttle schedule data.
     * @param {Object} state - The nav state slice
     * @param {Array} times - Shuttle times
     */
    setShuttleTimes(state, times) {
      state.shuttleTimes = Array.isArray(times) ? times : [];
    },
    /**
     * Sets explicitly accessible paths.
     * @param {Object} state - The nav state slice
     * @param {Array} paths - Accessible paths
     */
    setAccessiblePaths(state, paths) {
      state.accessiblePaths = Array.isArray(paths) ? paths : [];
    },
    /**
     * Sets crowd density map for navigation routing.
     * @param {Object} state - The nav state slice
     * @param {Object} density - Density mapping
     */
    setCrowdDensity(state, density) {
      state.crowdDensity = density || {};
    },
    /**
     * Sets the user's selected destination.
     * @param {Object} state - The nav state slice
     * @param {string} dest - Destination ID or name
     */
    setDestination(state, dest) {
      state.selectedDestination = dest;
    },
    /**
     * Sets nav data fetch status.
     * @param {Object} state - The nav state slice
     * @param {AsyncStatus} status - Status
     */
    setStatus(state, status) {
      state.status = String(status);
    }
  };

  /** Action handlers organized by state slice */
  const actionHandlers = {
    auth: authHandlers,
    ui: uiHandlers,
    chat: chatHandlers,
    crowd: crowdHandlers,
    incidents: incidentsHandlers,
    eco: ecoHandlers,
    navigation: navigationHandlers
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
