/**
 * @fileoverview Organizer Dashboard for real-time crowd density monitoring,
 * AI suggestions, and choke point alerts. Includes Canvas heatmap.
 * @module components/CrowdDashboard/CrowdDashboard
 */

import { t } from '../../core/i18n.js';
import { announceToScreenReader } from '../../core/accessibility.js';
import store from '../../core/store.js';
import { createElement, replaceChildren } from '../../core/dom.js';

/**
 * Creates the Crowd Dashboard component.
 * @returns {Object} Component with render, mount, unmount methods
 */
function _renderLoadingState() {
  return createElement('div', { class: 'text-center', style: 'padding: var(--space-8); color: var(--color-text-muted);' }, ['Loading crowd data...']);
}

function _renderStatCards(data) {
  return [
    createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Total occupancy: ${data.currentOccupancy.toLocaleString()}` } }, [
      createElement('span', { class: 'stat-card__label' }, [t('crowd.occupancy')]),
      createElement('span', { class: 'stat-card__value', id: 'crowd-total-display' }, [data.currentOccupancy.toLocaleString()]),
      createElement('span', { class: 'stat-card__delta stat-card__delta--up' }, [`${data.occupancyPercentage}% capacity`])
    ]),
    createElement('article', { class: 'glass-card stat-card', role: 'article', aria: { label: `Active choke points: ${data.chokePoints.length}` } }, [
      createElement('span', { class: 'stat-card__label' }, ['Choke Points']),
      createElement('span', { class: 'stat-card__value', id: 'crowd-chokes-display', style: data.chokePoints.length > 0 ? '-webkit-text-fill-color: var(--color-accent-red);' : '' }, [data.chokePoints.length]),
      createElement('span', { class: 'stat-card__delta' }, ['Active alerts'])
    ])
  ];
}

function _renderHeatmapSection() {
  return createElement('section', { class: 'glass-card', aria: { labelledby: 'crowd-heatmap-heading' } }, [
    createElement('h3', { id: 'crowd-heatmap-heading', style: 'margin-bottom: var(--space-4);' }, ['🌡️ Heatmap & Zones']),
    createElement('div', { style: 'position: relative; width: 100%; aspect-ratio: 16/9; background: var(--color-bg-tertiary); border-radius: var(--radius-md); overflow: hidden;' }, [
      createElement('canvas', { id: 'crowd-heatmap-canvas', width: '800', height: '450', style: 'width: 100%; height: 100%; display: block;' })
    ])
  ]);
}

function _renderRightPanel(gateList, aiSuggestions) {
  return createElement('div', { class: 'flex flex-col gap-6' }, [
    createElement('section', { aria: { labelledby: 'crowd-gates-heading' } }, [
      createElement('h3', { id: 'crowd-gates-heading', style: 'margin-bottom: var(--space-4);' }, [`🚪 ${t('crowd.gates')}`]),
      createElement('div', { class: 'flex flex-col gap-3', id: 'crowd-gates-list' }, gateList)
    ]),
    createElement('section', { aria: { labelledby: 'crowd-ai-heading' } }, [
      createElement('h3', { id: 'crowd-ai-heading', style: 'margin-bottom: var(--space-4);' }, [`🤖 ${t('crowd.aiSuggestions')}`]),
      createElement('div', { class: 'flex flex-col gap-3', id: 'crowd-ai-list' }, aiSuggestions)
    ])
  ]);
}

export default function TournamentOperationsHub() {
  const cleanupFns = [];
  let updateInterval = null;
  let canvasContext = null;
  let canvasElement = null;

  function render() {
    const data = store.getState('crowd').currentData;
    if (!data) return _renderLoadingState();

    const statCards = _renderStatCards(data);
    const gateList = Object.values(data.gates).map((gate) => renderGateCard(gate));
    const heatmapSection = _renderHeatmapSection();
    const rightPanel = _renderRightPanel(gateList, data.aiSuggestions.map((s) => renderAISuggestion(s)));

    return createElement('div', { class: 'flex flex-col gap-6' }, [
      createElement('div', { class: 'flex justify-between items-center' }, [
        createElement('h2', { style: 'font-size: var(--text-2xl);' }, [data.venueName]),
        createElement('div', { class: 'flex items-center gap-2' }, [
          createElement('span', { class: 'pulse-dot pulse-dot--active', aria: { hidden: 'true' } }),
          createElement('span', { style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, ['Live Updates'])
        ])
      ]),
      createElement('div', { class: 'dashboard-grid dashboard-grid--2' }, statCards),
      createElement('div', { class: 'dashboard-grid dashboard-grid--sidebar' }, [
        heatmapSection,
        rightPanel
      ])
    ]);
  }

  function renderGateCard(gate) {
    const statusClassMap = { normal: 'capacity-bar__fill--ok', warning: 'capacity-bar__fill--warning', critical: 'capacity-bar__fill--critical' };
    const barClass = statusClassMap[gate.status] || 'capacity-bar__fill--ok';

    return createElement('article', { class: 'glass-card', role: 'article', aria: { label: `${gate.name}, ${gate.percentage}% capacity, ${gate.waitTime} minute wait` } }, [
      createElement('div', { class: 'flex justify-between items-center mb-2' }, [
        createElement('span', { style: 'font-weight: var(--weight-semibold);' }, [gate.name]),
        createElement('span', { class: 'badge badge--info' }, [`⏱️ ${gate.waitTime}m`])
      ]),
      createElement('div', { class: 'capacity-bar', role: 'progressbar', aria: { valuenow: String(gate.percentage), valuemin: '0', valuemax: '100', label: `${gate.percentage}% capacity` } }, [
        createElement('div', { class: `capacity-bar__fill ${barClass}`, style: `width: ${gate.percentage}%;` })
      ]),
      createElement('div', { class: 'flex justify-between mt-2', style: 'font-size: var(--text-xs); color: var(--color-text-muted);' }, [
        createElement('span', {}, [`${gate.current.toLocaleString()} / ${gate.capacity.toLocaleString()}`]),
        createElement('span', {}, [`${gate.percentage}%`])
      ])
    ]);
  }

  function renderAISuggestion(suggestion) {
    const priorityColor = suggestion.priority === 'critical' ? 'var(--color-accent-red)' : suggestion.priority === 'high' ? 'var(--color-accent-orange)' : 'var(--color-accent-cyan)';

    return createElement('article', { class: 'glass-card', style: `border-left: 4px solid ${priorityColor};`, role: 'article', aria: { label: `AI Suggestion: ${suggestion.title}` } }, [
      createElement('div', { style: 'font-weight: var(--weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);' }, [suggestion.title]),
      createElement('p', { style: 'font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-3);' }, [suggestion.message]),
      createElement('div', { class: 'flex justify-between items-center mt-2' }, [
        createElement('button', { class: 'btn btn--secondary btn--sm', type: 'button' }, [suggestion.action]),
        createElement('span', { style: 'font-size: 0.65rem; color: var(--color-text-muted);' }, [suggestion.estimatedImpact])
      ])
    ]);
  }

  function _applyHeatmapColors(data) {
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        if (alpha < 64) {
          data[i] = 0; data[i + 1] = 0; data[i + 2] = 255;
        } else if (alpha < 128) {
          data[i] = 0; data[i + 1] = 255; data[i + 2] = 255 - (alpha - 64) * 4;
        } else if (alpha < 192) {
          data[i] = (alpha - 128) * 4; data[i + 1] = 255; data[i + 2] = 0;
        } else {
          data[i] = 255; data[i + 1] = 255 - (alpha - 192) * 4; data[i + 2] = 0;
        }
        data[i + 3] = alpha;
      }
    }
  }

  function _drawHeatmapPoints(tempCtx, points, canvasWidth, canvasHeight) {
    points.forEach(p => {
      if (typeof p !== 'object' || !p) return;
      const x = p.x * canvasWidth;
      const y = p.y * canvasHeight;
      const radius = p.radius * (canvasWidth / 800);
      const intensity = p.intensity;

      const grad = tempCtx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(0, 0, 0, ${intensity})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      tempCtx.fillStyle = grad;
      tempCtx.beginPath();
      tempCtx.arc(x, y, radius, 0, Math.PI * 2);
      tempCtx.fill();
    });
  }

  function initializeRealTimeHeatmap(points) {
    if (!canvasContext || !canvasElement || !Array.isArray(points)) return;
    const canvas = canvasElement;
    const ctx = canvasContext;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8, 20);
    ctx.stroke();

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    _drawHeatmapPoints(tempCtx, points, canvas.width, canvas.height);

    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    _applyHeatmapColors(imageData.data);
    ctx.putImageData(imageData, 0, 0);
  }

  function updateDashboard(data) {
    if (typeof data !== 'object' || !data) return;
    const totalEl = document.getElementById('crowd-total-display');
    const chokesEl = document.getElementById('crowd-chokes-display');
    const gatesListEl = document.getElementById('crowd-gates-list');
    const aiListEl = document.getElementById('crowd-ai-list');

    if (totalEl) totalEl.textContent = data.currentOccupancy.toLocaleString();
    if (chokesEl) {
      chokesEl.textContent = data.chokePoints.length;
      chokesEl.style.webkitTextFillColor = data.chokePoints.length > 0 ? 'var(--color-accent-red)' : '';
    }

    if (gatesListEl) replaceChildren(gatesListEl, Object.values(data.gates).map((gate) => renderGateCard(gate)));
    if (aiListEl) replaceChildren(aiListEl, data.aiSuggestions.map((s) => renderAISuggestion(s)));
    if (data.heatmapPoints && canvasContext) initializeRealTimeHeatmap(data.heatmapPoints);
  }

  function mount() {
    canvasElement = document.getElementById('crowd-heatmap-canvas');
    if (canvasElement) {
      canvasContext = canvasElement.getContext('2d', { willReadFrequently: true });
      const initialData = store.getState('crowd').currentData;
      if (initialData && initialData.heatmapPoints) initializeRealTimeHeatmap(initialData.heatmapPoints);
      
      const handleResize = () => {
        const currentData = store.getState('crowd').currentData;
        if (currentData && currentData.heatmapPoints) initializeRealTimeHeatmap(currentData.heatmapPoints);
      };
      window.addEventListener('resize', handleResize);
      cleanupFns.push(() => window.removeEventListener('resize', handleResize));
    }

    const unsubscribe = store.subscribe('crowd', (crowdState) => {
      if (crowdState.currentData) updateDashboard(crowdState.currentData);
    });
    cleanupFns.push(unsubscribe);

    store.dispatch('crowd.fetchData', 'metlife');
    updateInterval = setInterval(() => {
      store.dispatch('crowd.fetchData', 'metlife');
    }, 5000);

    cleanupFns.push(() => clearInterval(updateInterval));
    announceToScreenReader('Crowd Dashboard loaded. Live updates active.');
  }

  function unmount() {
    cleanupFns.forEach((fn) => { try { fn(); } catch (e) {} });
    cleanupFns.length = 0;
    canvasContext = null;
    canvasElement = null;
  }

  return { render, mount, unmount };
}
