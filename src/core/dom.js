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
export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attributes || {})) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === 'className' || key === 'class') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key === 'style' && typeof value === 'string') {
      el.style.cssText = value;
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [dataKey, dataValue] of Object.entries(value)) {
        el.dataset[dataKey] = dataValue;
      }
    } else if (key === 'aria') {
       for (const [ariaKey, ariaValue] of Object.entries(value)) {
         el.setAttribute(`aria-${ariaKey}`, ariaValue);
       }
    } else if (value !== null && value !== undefined && value !== false) {
      if (value === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, value);
      }
    }
  }

  // Flatten children to allow conditional rendering arrays
  const flatChildren = children.flat(Infinity);

  flatChildren.forEach(child => {
    if (child === null || child === undefined || child === false) return;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * Replaces the children of an element safely.
 * @param {HTMLElement} parent - Parent element
 * @param {Array<HTMLElement|string|false|null|undefined>} children - Child elements or text
 */
export function replaceChildren(parent, children) {
  if (!parent) return;
  parent.textContent = ''; // Fast way to clear children safely
  
  const flatChildren = children.flat(Infinity);
  
  flatChildren.forEach(child => {
    if (child === null || child === undefined || child === false) return;
    if (typeof child === 'string' || typeof child === 'number') {
      parent.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Node) {
      parent.appendChild(child);
    }
  });
}
