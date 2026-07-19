/**
 * @fileoverview Safe DOM manipulation utilities to prevent XSS.
 * @module core/dom
 */

/**
 * Safely creates a DOM element with attributes and children.
 * @param {string} tag - HTML tag name
 * @param {Object} [attributes={}] - Element attributes or properties
 * @param {Array<HTMLElement|string|false|null|undefined>} [children=[]] - Child elements or text
 * @returns {HTMLElement} Created element
 */
function _applyEvents(el, key, value) {
  const eventName = key.slice(2).toLowerCase();
  const isPassive = ['wheel', 'touchstart', 'touchmove', 'scroll'].includes(eventName);
  el.addEventListener(eventName, value, isPassive ? { passive: true } : undefined);
}

function _applyStyle(el, value) {
  if (typeof value === 'object') Object.assign(el.style, value);
  else if (typeof value === 'string') el.style.cssText = value;
}

function _applyDataset(el, value) {
  if (typeof value !== 'object') return;
  for (const [k, v] of Object.entries(value)) el.dataset[k] = v;
}

function _applyAria(el, value) {
  if (typeof value !== 'object') return;
  for (const [k, v] of Object.entries(value)) el.setAttribute(`aria-${k}`, v);
}

function _applyAttribute(el, key, value) {
  if (value === null || value === undefined || value === false) return;
  if (value === true) el.setAttribute(key, '');
  else el.setAttribute(key, value);
}

function _applyProperties(el, attributes) {
  if (typeof attributes !== 'object' || attributes === null) return;
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('on') && typeof value === 'function') _applyEvents(el, key, value);
    else if (key === 'className' || key === 'class') el.className = value;
    else if (key === 'style') _applyStyle(el, value);
    else if (key === 'dataset') _applyDataset(el, value);
    else if (key === 'aria') _applyAria(el, value);
    else _applyAttribute(el, key, value);
  }
}

function _appendSafeChild(parent, child) {
  if (child === null || child === undefined || child === false) return;
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(String(child)));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  }
}

function _flattenAndAppendChildren(parent, children) {
  if (!Array.isArray(children)) return;
  const flatChildren = children.flat(Infinity);
  flatChildren.forEach(child => _appendSafeChild(parent, child));
}

/**
 * Safely creates a DOM element with attributes and children.
 * @param {string} tag - HTML tag name
 * @param {Object} [attributes={}] - Element attributes or properties
 * @param {Array<HTMLElement|string|false|null|undefined>} [children=[]] - Child elements or text
 * @returns {HTMLElement|DocumentFragment} Created element
 */
export function createElement(tag, attributes = {}, children = []) {
  if (typeof tag !== 'string') return document.createDocumentFragment();
  const el = document.createElement(tag);
  _applyProperties(el, attributes);
  _flattenAndAppendChildren(el, children);
  return el;
}

/**
 * Replaces the children of an element safely.
 * @param {HTMLElement} parent - Parent element
 * @param {Array<HTMLElement|string|false|null|undefined>} children - Child elements or text
 */
export function replaceChildren(parent, children) {
  if (!(parent instanceof HTMLElement)) return;
  parent.textContent = ''; // Fast way to clear children safely
  _flattenAndAppendChildren(parent, children);
}
