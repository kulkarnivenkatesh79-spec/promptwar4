/**
 * @fileoverview State management unit tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { createStore, deepFreeze, deepClone } from '../../core/store.js';

describe('Store', () => {
  it('initializes with default state', () => {
    const store = createStore();
    const auth = store.getState('auth');
    expect(auth.role).toBe('fan');
    expect(auth.isAuthenticated).toBe(true);
    expect(typeof auth.sessionId).toBe('string');
  });

  it('returns full state when no key specified', () => {
    const store = createStore();
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('chat');
    expect(state).toHaveProperty('crowd');
    expect(state).toHaveProperty('incidents');
    expect(state).toHaveProperty('eco');
    expect(state).toHaveProperty('navigation');
  });

  it('dispatches mutations correctly', () => {
    const store = createStore();
    store.dispatch('auth.setRole', 'organizer');
    expect(store.getState('auth').role).toBe('organizer');
  });

  it('notifies subscribers on dispatch', () => {
    const store = createStore();
    const callback = vi.fn();
    store.subscribe('auth', callback);
    store.dispatch('auth.setRole', 'organizer');
    expect(callback).toHaveBeenCalledOnce();
    expect(callback.mock.calls[0][0].role).toBe('organizer');
  });

  it('returns unsubscribe function that works', () => {
    const store = createStore();
    const callback = vi.fn();
    const unsub = store.subscribe('auth', callback);
    unsub();
    store.dispatch('auth.setRole', 'organizer');
    expect(callback).not.toHaveBeenCalled();
  });

  it('throws on invalid action format', () => {
    const store = createStore();
    expect(() => store.dispatch('invalidAction', {})).toThrow();
  });

  it('throws on unknown state slice', () => {
    const store = createStore();
    expect(() => store.dispatch('nonexistent.action', {})).toThrow();
  });

  it('throws on unknown action within slice', () => {
    const store = createStore();
    expect(() => store.dispatch('auth.nonexistent', {})).toThrow();
  });

  it('rolls back state on action failure', () => {
    const store = createStore();
    const originalRole = store.getState('auth').role;
    try {
      store.dispatch('auth.setRole', 'invalid_role');
    } catch (e) { /* expected */ }
    expect(store.getState('auth').role).toBe(originalRole);
  });

  it('returns frozen state (prevents mutation)', () => {
    const store = createStore();
    const auth = store.getState('auth');
    expect(() => { auth.role = 'hacked'; }).toThrow();
  });

  it('batches multiple dispatches into single notification', () => {
    const store = createStore();
    const callback = vi.fn();
    store.subscribe('ui', callback);

    store.batch(() => {
      store.dispatch('ui.setRoute', '#/test1');
      store.dispatch('ui.setLocale', 'es');
    });

    expect(callback).toHaveBeenCalledOnce();
  });

  it('dispatches chat messages correctly', () => {
    const store = createStore();
    store.dispatch('chat.addMessage', { role: 'user', content: 'Hello' });
    const chat = store.getState('chat');
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].content).toBe('Hello');
    expect(chat.messages[0].role).toBe('user');
  });

  it('resets a state slice to initial values', () => {
    const store = createStore();
    store.dispatch('chat.addMessage', { role: 'user', content: 'test' });
    store.reset('chat');
    expect(store.getState('chat').messages).toHaveLength(0);
  });
});

describe('deepFreeze', () => {
  it('freezes nested objects', () => {
    const obj = { a: { b: { c: 1 } } };
    deepFreeze(obj);
    expect(Object.isFrozen(obj)).toBe(true);
    expect(Object.isFrozen(obj.a)).toBe(true);
    expect(Object.isFrozen(obj.a.b)).toBe(true);
  });

  it('handles null/undefined gracefully', () => {
    expect(deepFreeze(null)).toBe(null);
    expect(deepFreeze(undefined)).toBe(undefined);
  });
});

describe('deepClone', () => {
  it('creates independent copies', () => {
    const original = { a: [1, 2, { b: 3 }] };
    const clone = deepClone(original);
    clone.a[2].b = 99;
    expect(original.a[2].b).toBe(3);
  });

  it('handles primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(null)).toBe(null);
  });
});
