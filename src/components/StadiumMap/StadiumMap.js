/**
 * @fileoverview Interactive SVG stadium map with heatmap overlay, accessible pathways,
 * and section tooltips.
 * @module components/StadiumMap/StadiumMap
 */

import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import { generateCrowdData } from '../../data/mockCrowdData.js';
import { createElement } from '../../core/dom.js';

/** SVG namespace constant */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Creates an SVG element with attributes.
 * @param {string} tag - SVG tag name
 * @param {Object} attrs - Attributes
 * @param {Array} [children=[]] - Child elements or text
 * @returns {SVGElement} Created SVG element
 */
function svgEl(tag, attrs = {}, children = []) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'style' && typeof value === 'string') {
      el.setAttribute('style', value);
    } else if (key === 'aria') {
      for (const [ariaKey, ariaValue] of Object.entries(value)) {
        el.setAttribute(`aria-${ariaKey}`, ariaValue);
      }
    } else if (value !== null && value !== undefined && value !== false) {
      el.setAttribute(key, String(value));
    }
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Creates the Stadium Map component with integrated heatmap overlay.
 * @returns {Object} Component with render, mount, unmount methods
 */
export default function StadiumMap() {
  /** @type {Function[]} */
  const cleanupFns = [];
  /** @type {number|null} */
  let heatmapAnimFrame = null;
  /** @type {number|null} */
  let updateInterval = null;
  /** @type {string|null} */
  let selectedSection = null;

  const sectionColors = {
    normal: '#1e5a3a',
    warning: '#7a5c00',
    critical: '#7a1a1a',
    selected: '#00e5ff'
  };

  /**
   * Generates an SVG path element for a stadium section.
   * @param {string} id - Section identifier
   * @param {string} pathD - SVG path data
   * @param {number} level - Section level
   * @returns {SVGElement} Section path element
   */
  function generateSectionEl(id, pathD, level) {
    const density = 0.3 + Math.random() * 0.6;
    const status = density > 0.95 ? 'critical' : density > 0.8 ? 'warning' : 'normal';
    const fill = sectionColors[status];

    return svgEl('path', {
      d: pathD,
      fill: fill,
      'fill-opacity': '0.6',
      stroke: 'var(--glass-border)',
      'stroke-width': '1',
      class: 'stadium-section',
      'data-section': id,
      'data-level': String(level),
      'data-density': String(Math.round(density * 100)),
      role: 'button',
      tabindex: '0',
      aria: { label: `Section ${id}, Level ${level}, ${Math.round(density * 100)}% occupied, status ${status}` },
      style: 'cursor: pointer; transition: fill 0.3s ease;'
    });
  }

  /**
   * Generates an SVG group element for a gate indicator.
   * @param {string} name - Gate name
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {SVGElement} Gate group element
   */
  function generateGateEl(name, x, y) {
    return svgEl('g', { 'data-gate': name, role: 'button', tabindex: '0', aria: { label: `Gate ${name}` } }, [
      svgEl('circle', { cx: String(x), cy: String(y), r: '18', fill: 'var(--color-bg-tertiary)', stroke: 'var(--color-accent-cyan)', 'stroke-width': '2' }),
      svgEl('text', { x: String(x), y: String(y + 5), 'text-anchor': 'middle', 'font-size': '12', 'font-weight': '700', fill: 'var(--color-accent-cyan)' }, [name])
    ]);
  }

  /**
   * Renders the stadium map as a DOM element.
   * @returns {HTMLElement} Stadium map container
   */
  function render() {
    const svg = svgEl('svg', { viewBox: '0 0 800 500', class: 'stadium-map-svg', id: 'stadium-svg', role: 'group', aria: { label: 'Stadium sections' } }, [
      // Stadium Outline
      svgEl('ellipse', { cx: '400', cy: '250', rx: '370', ry: '220', fill: 'none', stroke: 'var(--glass-border)', 'stroke-width': '2' }),
      svgEl('ellipse', { cx: '400', cy: '250', rx: '320', ry: '180', fill: 'none', stroke: 'var(--glass-border)', 'stroke-width': '1', 'stroke-dasharray': '4 4' }),

      // Field
      svgEl('rect', { x: '250', y: '160', width: '300', height: '180', rx: '8', fill: '#0d3320', stroke: '#2a7a4a', 'stroke-width': '1.5', aria: { label: 'Playing field' } }),
      svgEl('line', { x1: '400', y1: '160', x2: '400', y2: '340', stroke: '#2a7a4a', 'stroke-width': '1' }),
      svgEl('circle', { cx: '400', cy: '250', r: '40', fill: 'none', stroke: '#2a7a4a', 'stroke-width': '1' }),
      svgEl('circle', { cx: '400', cy: '250', r: '3', fill: '#2a7a4a' }),

      // Level 100 Sections
      generateSectionEl('101', 'M 100 180 L 180 140 L 230 160 L 160 210 Z', 1),
      generateSectionEl('102', 'M 230 120 L 330 90 L 350 130 L 250 150 Z', 1),
      generateSectionEl('103', 'M 350 80 L 450 75 L 450 125 L 350 130 Z', 1),
      generateSectionEl('104', 'M 450 75 L 550 80 L 550 130 L 450 125 Z', 1),
      generateSectionEl('105', 'M 550 90 L 650 120 L 630 150 L 550 130 Z', 1),
      generateSectionEl('106', 'M 650 140 L 700 180 L 640 210 L 620 160 Z', 1),

      // Level 200 Sections
      generateSectionEl('201', 'M 100 320 L 160 290 L 230 340 L 180 360 Z', 2),
      generateSectionEl('202', 'M 230 350 L 250 340 L 350 370 L 330 410 Z', 2),
      generateSectionEl('203', 'M 350 370 L 450 375 L 450 420 L 350 415 Z', 2),
      generateSectionEl('204', 'M 450 375 L 550 370 L 550 415 L 450 420 Z', 2),
      generateSectionEl('205', 'M 550 370 L 630 340 L 650 360 L 550 410 Z', 2),
      generateSectionEl('206', 'M 640 290 L 700 320 L 680 360 L 620 340 Z', 2),

      // Gates
      generateGateEl('A', 400, 30),
      generateGateEl('B', 750, 250),
      generateGateEl('C', 400, 470),
      generateGateEl('D', 50, 250),

      // Accessible Pathways
      svgEl('g', { class: 'accessible-paths', aria: { label: 'Accessible pathways' } }, [
        svgEl('path', { d: 'M 400 30 L 400 80', stroke: 'var(--color-accent-gold)', 'stroke-width': '3', 'stroke-dasharray': '6 3', fill: 'none', aria: { label: 'Accessible path from Gate A' } }),
        svgEl('path', { d: 'M 750 250 L 700 250', stroke: 'var(--color-accent-gold)', 'stroke-width': '3', 'stroke-dasharray': '6 3', fill: 'none', aria: { label: 'Accessible path from Gate B' } }),
        svgEl('path', { d: 'M 400 470 L 400 420', stroke: 'var(--color-accent-gold)', 'stroke-width': '3', 'stroke-dasharray': '6 3', fill: 'none', aria: { label: 'Accessible path from Gate C' } }),
        svgEl('path', { d: 'M 50 250 L 100 250', stroke: 'var(--color-accent-gold)', 'stroke-width': '3', 'stroke-dasharray': '6 3', fill: 'none', aria: { label: 'Accessible path from Gate D' } })
      ]),

      // Facility Icons
      svgEl('text', { x: '160', y: '255', 'font-size': '16', fill: 'var(--color-accent-gold)', aria: { label: 'Elevator' } }, ['🛗']),
      svgEl('text', { x: '620', y: '255', 'font-size': '16', fill: 'var(--color-accent-gold)', aria: { label: 'Elevator' } }, ['🛗']),
      svgEl('text', { x: '390', y: '455', 'font-size': '14', fill: 'var(--color-accent-green)', aria: { label: 'First Aid' } }, ['🏥']),
      svgEl('text', { x: '390', y: '50', 'font-size': '14', fill: 'var(--color-accent-cyan)', aria: { label: 'Information' } }, ['ℹ️'])
    ]);

    const legendItems = [
      { color: sectionColors.normal, label: 'Normal (<80%)' },
      { color: sectionColors.warning, label: 'Warning (80–95%)' },
      { color: sectionColors.critical, label: 'Critical (>95%)' },
      { color: 'var(--color-accent-gold)', label: 'Accessible Path', border: true },
      { color: 'var(--color-accent-cyan)', label: 'Selected Section' }
    ];

    return createElement('div', { class: 'stadium-map-container', role: 'img', aria: { label: 'Interactive stadium map showing crowd density' } }, [
      createElement('div', { style: 'position: relative;' }, [
        svg,
        createElement('canvas', { id: 'heatmap-canvas', class: 'heatmap-canvas', aria: { hidden: 'true' } })
      ]),

      // Legend
      createElement('div', { class: 'stadium-legend', role: 'list', aria: { label: 'Map legend' } },
        legendItems.map(item =>
          createElement('div', { class: 'stadium-legend__item', role: 'listitem' }, [
            createElement('div', { class: 'stadium-legend__color', style: `background: ${item.color};${item.border ? ' border: 1px dashed ' + item.color + ';' : ''}` }),
            createElement('span', {}, [item.label])
          ])
        )
      ),

      // Section Info Tooltip
      createElement('div', { id: 'section-tooltip', style: 'display: none; position: absolute; z-index: var(--z-tooltip);', class: 'glass-card', role: 'tooltip', aria: { live: 'polite' } }),

      // Screen Reader Summary
      createElement('div', { class: 'sr-only', id: 'map-sr-summary', aria: { live: 'polite' }, role: 'status' })
    ]);
  }

  /**
   * Mounts the component: initializes heatmap, event listeners, and data refresh.
   */
  function mount() {
    initHeatmap();
    initSectionInteractions();

    const crowdData = generateCrowdData();
    updateSRSummary(crowdData);

    updateInterval = setInterval(() => {
      const newData = generateCrowdData();
      updateHeatmap(newData.heatmapPoints);
      updateSRSummary(newData);
    }, 5000);

    cleanupFns.push(() => {
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    });
  }

  /**
   * Initializes the Canvas-based heatmap overlay.
   */
  function initHeatmap() {
    const canvas = document.getElementById('heatmap-canvas');
    const svg = document.getElementById('stadium-svg');
    if (!canvas || !svg) return;

    const rect = svg.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (ctx) {
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    const crowdData = generateCrowdData();
    updateHeatmap(crowdData.heatmapPoints);

    const resizeObserver = new ResizeObserver(() => {
      const newRect = svg.getBoundingClientRect();
      canvas.width = newRect.width * (window.devicePixelRatio || 1);
      canvas.height = newRect.height * (window.devicePixelRatio || 1);
      canvas.style.width = newRect.width + 'px';
      canvas.style.height = newRect.height + 'px';
      const resizeCtx = canvas.getContext('2d', { willReadFrequently: false });
      if (resizeCtx) {
        resizeCtx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        updateHeatmap(crowdData.heatmapPoints);
      }
    });

    resizeObserver.observe(svg);
    cleanupFns.push(() => resizeObserver.disconnect());
  }

  /**
   * Renders heatmap points on the canvas.
   * @param {Object[]} points - Heatmap points with x, y, intensity, radius
   */
  function updateHeatmap(points) {
    const canvas = document.getElementById('heatmap-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;

    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    points.forEach((point) => {
      const x = point.x * w;
      const y = point.y * h;
      const radius = point.radius;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      if (point.intensity > 0.8) {
        gradient.addColorStop(0, 'rgba(255, 82, 82, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 171, 64, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 82, 82, 0)');
      } else if (point.intensity > 0.5) {
        gradient.addColorStop(0, 'rgba(255, 215, 64, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 171, 64, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 215, 64, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(105, 240, 174, 0.4)');
        gradient.addColorStop(0.5, 'rgba(105, 240, 174, 0.15)');
        gradient.addColorStop(1, 'rgba(105, 240, 174, 0)');
      }

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Sets up click and keyboard interactions for stadium sections.
   */
  function initSectionInteractions() {
    const svg = document.getElementById('stadium-svg');
    if (!svg) return;

    const handleInteraction = (e) => {
      const section = e.target.closest('[data-section]');
      const gate = e.target.closest('[data-gate]');

      if (section) {
        const sectionId = section.getAttribute('data-section');
        const density = section.getAttribute('data-density');
        const level = section.getAttribute('data-level');

        if (selectedSection) {
          const prev = svg.querySelector(`[data-section="${selectedSection}"]`);
          if (prev) prev.style.stroke = 'var(--glass-border)';
        }

        section.style.stroke = 'var(--color-accent-cyan)';
        section.style.strokeWidth = '3';
        selectedSection = sectionId;

        announceToScreenReader(`Selected Section ${sectionId}. Level ${level}. ${density}% occupied.`);
      }

      if (gate) {
        const gateName = gate.getAttribute('data-gate');
        announceToScreenReader(`Gate ${gateName} selected`);
      }
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInteraction(e);
      }
    };

    svg.addEventListener('click', handleInteraction);
    svg.addEventListener('keydown', handleKeydown);
    cleanupFns.push(() => {
      svg.removeEventListener('click', handleInteraction);
      svg.removeEventListener('keydown', handleKeydown);
    });
  }

  /**
   * Updates the screen reader summary of crowd data.
   * @param {Object} data - Crowd data
   */
  function updateSRSummary(data) {
    const summary = document.getElementById('map-sr-summary');
    if (!summary) return;

    summary.textContent = `Stadium occupancy: ${data.occupancyPercentage}% of ${data.totalCapacity.toLocaleString()} capacity. ${data.chokePoints.length} choke points detected.`;
  }

  /**
   * Unmounts and cleans up all resources.
   */
  function unmount() {
    if (heatmapAnimFrame) {
      cancelAnimationFrame(heatmapAnimFrame);
      heatmapAnimFrame = null;
    }

    cleanupFns.forEach((fn) => { try { fn(); } catch (e) { /* ignore */ } });
    cleanupFns.length = 0;
    selectedSection = null;
  }

  return { render, mount, unmount };
}
