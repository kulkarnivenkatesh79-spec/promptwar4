/**
 * @fileoverview Mock crowd density data generator and sample datasets.
 * @module data/mockCrowdData
 */

import { venues } from './venues.js';

/**
 * Generates realistic crowd density data for a venue with temporal patterns.
 * @param {string} [venueId='metlife'] - Venue identifier
 * @returns {Object} Crowd data with gates, sections, and heatmap points
 */
function generateCrowdData(venueId = 'metlife') {
  const venue = venues.find((v) => v.id === venueId) || venues[0];
  const hour = new Date().getHours();

  const peakMultiplier = hour >= 17 && hour <= 21 ? 0.9 : hour >= 14 && hour <= 17 ? 0.7 : 0.4;

  const gateNames = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, venue.gateCount);
  const gates = {};

  gateNames.forEach((name, index) => {
    const gateCapacity = Math.floor(venue.capacity / venue.gateCount);
    const baseDensity = peakMultiplier + (Math.random() * 0.2 - 0.1);
    const current = Math.min(gateCapacity, Math.floor(gateCapacity * baseDensity));
    const percentage = Math.round((current / gateCapacity) * 100);

    gates[name] = {
      name: `Gate ${name}`,
      capacity: gateCapacity,
      current,
      percentage,
      throughput: Math.floor(Math.random() * 300) + 100,
      waitTime: Math.floor(Math.random() * 20) + 1,
      status: percentage >= 95 ? 'critical' : percentage >= 80 ? 'warning' : 'normal',
      trend: Math.random() > 0.5 ? 'up' : 'down'
    };
  });

  const sections = generateSections(venue.capacity, peakMultiplier);
  const heatmapPoints = generateHeatmapPoints(60, peakMultiplier);

  const totalCurrent = Object.values(gates).reduce((sum, g) => sum + g.current, 0);

  return {
    venueId: venue.id,
    venueName: venue.name,
    totalCapacity: venue.capacity,
    currentOccupancy: totalCurrent,
    occupancyPercentage: Math.round((totalCurrent / venue.capacity) * 100),
    gates,
    sections,
    heatmapPoints,
    chokePoints: identifyChokePoints(gates),
    aiSuggestions: generateAISuggestions(gates, totalCurrent, venue.capacity),
    timestamp: Date.now(),
    nextUpdate: Date.now() + 5000
  };
}

/**
 * Generates section-level crowd data.
 * @param {number} totalCapacity - Total venue capacity
 * @param {number} peakMultiplier - Time-based multiplier
 * @returns {Object[]} Section data
 */
function generateSections(totalCapacity, peakMultiplier) {
  const sectionNames = [
    '101', '102', '103', '104', '105', '106',
    '201', '202', '203', '204', '205', '206',
    '301', '302', '303', '304'
  ];

  return sectionNames.map((name) => {
    const sectionCapacity = Math.floor(totalCapacity / sectionNames.length);
    const density = peakMultiplier + (Math.random() * 0.3 - 0.15);
    const current = Math.min(sectionCapacity, Math.floor(sectionCapacity * density));
    const percentage = Math.round((current / sectionCapacity) * 100);

    return {
      id: `section-${name}`,
      name: `Section ${name}`,
      level: parseInt(name[0]),
      capacity: sectionCapacity,
      current,
      percentage,
      status: percentage >= 95 ? 'critical' : percentage >= 80 ? 'warning' : 'normal',
      temperature: 20 + Math.random() * 8,
      noiseLevel: 60 + Math.random() * 30
    };
  });
}

/**
 * Generates heatmap coordinate points with intensity values.
 * @param {number} count - Number of points to generate
 * @param {number} peakMultiplier - Intensity multiplier
 * @returns {Object[]} Heatmap points with x, y, intensity
 */
function generateHeatmapPoints(count, peakMultiplier) {
  const points = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radiusVariation = 0.3 + Math.random() * 0.5;
    const x = 0.5 + Math.cos(angle) * radiusVariation * 0.4;
    const y = 0.5 + Math.sin(angle) * radiusVariation * 0.3;
    const intensity = peakMultiplier * (0.3 + Math.random() * 0.7);

    points.push({
      x: Math.max(0.05, Math.min(0.95, x)),
      y: Math.max(0.05, Math.min(0.95, y)),
      intensity: Math.min(1, intensity),
      radius: 20 + Math.random() * 30
    });
  }

  const gatePositions = [
    { x: 0.5, y: 0.02 }, { x: 0.98, y: 0.5 },
    { x: 0.5, y: 0.98 }, { x: 0.02, y: 0.5 }
  ];

  gatePositions.forEach((pos) => {
    for (let j = 0; j < 5; j++) {
      points.push({
        x: pos.x + (Math.random() * 0.1 - 0.05),
        y: pos.y + (Math.random() * 0.1 - 0.05),
        intensity: peakMultiplier * (0.6 + Math.random() * 0.4),
        radius: 25 + Math.random() * 20
      });
    }
  });

  return points;
}

/**
 * Identifies choke points from gate data.
 * @param {Object} gates - Gate data
 * @returns {Object[]} Choke point alerts
 */
function identifyChokePoints(gates) {
  const chokePoints = [];
  Object.entries(gates).forEach(([key, gate]) => {
    if (gate.percentage >= 80) {
      chokePoints.push({
        gateId: key,
        gateName: gate.name,
        severity: gate.percentage >= 95 ? 'critical' : 'warning',
        percentage: gate.percentage,
        waitTime: gate.waitTime,
        recommendation: gate.percentage >= 95
          ? `Immediately redirect traffic from ${gate.name}. Open auxiliary lanes.`
          : `Monitor ${gate.name} closely. Consider early redirect if trend continues.`
      });
    }
  });
  return chokePoints;
}

/**
 * Generates AI-powered crowd redistribution suggestions.
 * @param {Object} gates - Gate data
 * @param {number} currentTotal - Current total occupancy
 * @param {number} totalCapacity - Total venue capacity
 * @returns {Object[]} AI suggestions
 */
function generateAISuggestions(gates, currentTotal, totalCapacity) {
  const suggestions = [];
  const overallPercentage = Math.round((currentTotal / totalCapacity) * 100);

  if (overallPercentage >= 90) {
    suggestions.push({
      id: 'overall-cap',
      priority: 'critical',
      type: 'capacity',
      title: 'Stadium Approaching Full Capacity',
      message: `Overall occupancy at ${overallPercentage}%. Consider halting new admissions temporarily.`,
      action: 'Activate overflow protocol',
      estimatedImpact: 'Reduce gate pressure by 40%'
    });
  }

  const gateEntries = Object.entries(gates);
  const overloaded = gateEntries.filter(([_, g]) => g.percentage >= 85);
  const underloaded = gateEntries.filter(([_, g]) => g.percentage < 50);

  if (overloaded.length > 0 && underloaded.length > 0) {
    suggestions.push({
      id: 'redistribute',
      priority: 'high',
      type: 'redistribution',
      title: 'Crowd Redistribution Recommended',
      message: `Redirect foot traffic from ${overloaded.map(([_, g]) => g.name).join(', ')} to ${underloaded.map(([_, g]) => g.name).join(', ')}.`,
      action: 'Update digital signage and deploy stewards',
      estimatedImpact: 'Balance gate loads within 15 minutes'
    });
  }

  const longWaitGates = gateEntries.filter(([_, g]) => g.waitTime > 10);
  if (longWaitGates.length > 0) {
    suggestions.push({
      id: 'wait-reduction',
      priority: 'medium',
      type: 'efficiency',
      title: 'Long Wait Times Detected',
      message: `${longWaitGates.map(([_, g]) => g.name).join(', ')} experiencing ${longWaitGates[0][1].waitTime}+ minute waits.`,
      action: 'Open additional screening lanes',
      estimatedImpact: 'Reduce wait by 5-8 minutes'
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'all-clear',
      priority: 'low',
      type: 'status',
      title: 'Operations Running Smoothly',
      message: 'All gates operating within normal parameters. No immediate action required.',
      action: 'Continue monitoring',
      estimatedImpact: 'N/A'
    });
  }

  return suggestions;
}

/**
 * Generates venue summary data for the dashboard overview.
 * @returns {Object[]} Summary data for all venues
 */
function generateVenueSummaries() {
  return venues.map((venue) => {
    const peakMultiplier = 0.3 + Math.random() * 0.6;
    const current = Math.floor(venue.capacity * peakMultiplier);
    const percentage = Math.round((current / venue.capacity) * 100);

    return {
      id: venue.id,
      name: venue.name,
      city: venue.city,
      country: venue.country,
      capacity: venue.capacity,
      current,
      percentage,
      status: percentage >= 95 ? 'critical' : percentage >= 80 ? 'warning' : 'normal',
      hasMatch: Math.random() > 0.5,
      nextEvent: percentage > 50 ? 'In Progress' : 'Upcoming'
    };
  });
}

export {
  generateCrowdData,
  generateSections,
  generateHeatmapPoints,
  identifyChokePoints,
  generateAISuggestions,
  generateVenueSummaries
};
