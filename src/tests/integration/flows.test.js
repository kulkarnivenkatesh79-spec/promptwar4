/**
 * @fileoverview Integration tests for cross-component workflows.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import store from '../../core/store.js';
import router from '../../core/router.js';
import { processMessage } from '../../components/Chat/ChatEngine.js';
import { switchRole } from '../../app.js';
import { getIncidentStats, sampleIncidents } from '../../data/mockIncidents.js';

vi.stubEnv('VITE_GEMINI_API_KEY', '');


describe('Role Switch Flow', () => {
  beforeEach(() => {
    store.reset('auth');
    store.reset('ui');
    // Ensure JSDOM elements exist for app.js switchRole
    document.body.innerHTML = `
      <div id="app"></div>
      <div id="toast-container"></div>
    `;
    // Mock location
    delete window.location;
    window.location = { hash: '#/fan' };
  });

  it('switches role to organizer and navigates to org home', () => {
    switchRole('organizer');
    
    expect(store.getState('auth').role).toBe('organizer');
    expect(window.location.hash).toBe('#/org');
    
    const ui = store.getState('ui');
    expect(ui.toasts).toHaveLength(1);
    expect(ui.toasts[0].title).toBe('Mode Switched');
  });

  it('switches role back to fan and navigates to fan home', () => {
    switchRole('organizer');
    switchRole('fan');
    
    expect(store.getState('auth').role).toBe('fan');
    expect(window.location.hash).toBe('#/fan');
  });
});

describe('Chat Interaction Flow', () => {
  beforeEach(() => {
    store.reset('chat');
  });

  it('processes user message, detects language, and stores AI response', async () => {
    // 1. Send Spanish message
    const msg = 'hola donde esta el estadio';
    
    // Process with mock chunk callback
    let chunks = [];
    const result = await processMessage(msg, (chunk) => {
      chunks.push(chunk);
    });

    // 2. Verify engine result
    expect(result.detectedLang).toBe('es');
    expect(result.topic).toBe('venues');
    expect(result.response.length).toBeGreaterThan(0);
    
    // 3. Verify chunking worked
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1]).toBe(result.response);
  });

  it('handles empty input gracefully', async () => {
    const result = await processMessage('   ', () => {});
    expect(result.topic).toBe('error');
    expect(result.response).toContain('Please enter a valid message');
  });
});

describe('Incident Management Flow', () => {
  beforeEach(() => {
    store.reset('incidents');
    store.dispatch('incidents.setItems', [...sampleIncidents]);
  });

  it('progresses incident status through lifecycle', () => {
    const items = store.getState('incidents').items;
    const reportedIncident = items.find(i => i.status === 'reported');
    expect(reportedIncident).toBeDefined();

    // Acknowledge
    store.dispatch('incidents.updateStatus', { id: reportedIncident.id, status: 'acknowledged' });
    expect(store.getState('incidents').items.find(i => i.id === reportedIncident.id).status).toBe('acknowledged');

    // In Progress
    store.dispatch('incidents.updateStatus', { id: reportedIncident.id, status: 'inProgress' });
    expect(store.getState('incidents').items.find(i => i.id === reportedIncident.id).status).toBe('inProgress');

    // Resolve
    store.dispatch('incidents.updateStatus', { id: reportedIncident.id, status: 'resolved' });
    const resolved = store.getState('incidents').items.find(i => i.id === reportedIncident.id);
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).toBeDefined();
  });

  it('calculates correct stats for active and resolved incidents', () => {
    const items = store.getState('incidents').items;
    const stats = getIncidentStats(items);
    
    expect(stats.total).toBe(items.length);
    const activeCount = items.filter(i => i.status !== 'resolved').length;
    expect(stats.active).toBe(activeCount);
    
    const criticalCount = items.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    expect(stats.critical).toBe(criticalCount);
  });
});
