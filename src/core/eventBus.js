/**
 * @fileoverview Pub/sub event bus for decoupled inter-component messaging.
 * @module core/eventBus
 */

/**
 * Creates an event bus with on/off/emit/once capabilities.
 * @returns {Object} EventBus API
 */
function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  /**
   * Registers an event handler.
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  function on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError('[EventBus] Handler must be a function');
    }
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(handler);

    return () => off(event, handler);
  }

  /**
   * Removes an event handler.
   * @param {string} event - Event name
   * @param {Function} handler - Event handler to remove
   */
  function off(event, handler) {
    const set = listeners.get(event);
    if (set) {
      set.delete(handler);
      if (set.size === 0) {
        listeners.delete(event);
      }
    }
  }

  /**
   * Emits an event with optional data.
   * @param {string} event - Event name
   * @param {*} [data] - Event payload
   */
  function emit(event, data) {
    const set = listeners.get(event);
    if (set) {
      set.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for "${event}":`, err);
        }
      });
    }

    const wildcardSet = listeners.get('*');
    if (wildcardSet) {
      wildcardSet.forEach((handler) => {
        try {
          handler({ event, data });
        } catch (err) {
          console.error(`[EventBus] Error in wildcard handler:`, err);
        }
      });
    }
  }

  /**
   * Registers a one-time event handler.
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  function once(event, handler) {
    const wrapper = (data) => {
      off(event, wrapper);
      handler(data);
    };
    return on(event, wrapper);
  }

  /**
   * Removes all listeners for an event, or all listeners if no event specified.
   * @param {string} [event] - Event name
   */
  function clear(event) {
    if (event) {
      listeners.delete(event);
    } else {
      listeners.clear();
    }
  }

  /**
   * Returns the number of listeners for an event.
   * @param {string} event - Event name
   * @returns {number}
   */
  function listenerCount(event) {
    return listeners.has(event) ? listeners.get(event).size : 0;
  }

  return { on, off, emit, once, clear, listenerCount };
}

/** Singleton event bus */
const eventBus = createEventBus();

export default eventBus;
export { createEventBus };
