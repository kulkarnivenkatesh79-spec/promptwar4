/**
 * @fileoverview Mock incident data and protocol generation.
 * @module data/mockIncidents
 */

/** @type {Object[]} Pre-seeded incident reports */
const sampleIncidents = [
  {
    id: 'inc-001', category: 'medical', location: 'Section 103, Row 12', severity: 'critical',
    description: 'Fan experiencing chest pains and difficulty breathing. Requires immediate medical attention.',
    status: 'inProgress', reportedAt: Date.now() - 600000, venue: 'MetLife Stadium',
    protocol: { title: 'Medical Emergency Response', steps: ['Dispatch on-site paramedic team to Section 103', 'Clear surrounding area for stretcher access', 'Notify nearest hospital (Hackensack University Medical Center)', 'Prepare ambulance at Gate B exit'], estimatedResponse: '3 min', personnelNeeded: 4, priority: 'P1' }
  },
  {
    id: 'inc-002', category: 'security', location: 'Gate A Entrance', severity: 'high',
    description: 'Unauthorized individual attempting to bypass security screening. Confrontational behavior reported.',
    status: 'acknowledged', reportedAt: Date.now() - 300000, venue: 'MetLife Stadium',
    protocol: { title: 'Security Breach Protocol', steps: ['Deploy 2 security officers to Gate A immediately', 'Activate CCTV monitoring on Gate A approach', 'Notify law enforcement liaison if escalation needed', 'Document incident with photo/video evidence'], estimatedResponse: '2 min', personnelNeeded: 3, priority: 'P1' }
  },
  {
    id: 'inc-003', category: 'infrastructure', location: 'Section 202, Restroom Block C', severity: 'medium',
    description: 'Water leak from ceiling in restroom area. Floor becoming slippery — potential fall hazard.',
    status: 'reported', reportedAt: Date.now() - 120000, venue: 'MetLife Stadium',
    protocol: { title: 'Infrastructure Maintenance Protocol', steps: ['Deploy maintenance crew with wet floor signage', 'Redirect fans to Restroom Blocks A or D', 'Isolate water source and apply temporary fix', 'Schedule full repair for post-event window'], estimatedResponse: '8 min', personnelNeeded: 2, priority: 'P2' }
  },
  {
    id: 'inc-004', category: 'crowd', location: 'Gate D Concourse', severity: 'high',
    description: 'Crowd density exceeding safe thresholds near Gate D food court. Fans unable to move freely.',
    status: 'inProgress', reportedAt: Date.now() - 450000, venue: 'MetLife Stadium',
    protocol: { title: 'Crowd Control Protocol', steps: ['Deploy 4 stewards to Gate D concourse', 'Open overflow path through Corridor 7', 'Announce alternate routes via PA system', 'Activate digital signage redirects'], estimatedResponse: '5 min', personnelNeeded: 6, priority: 'P1' }
  },
  {
    id: 'inc-005', category: 'medical', location: 'Fan Zone East, First Aid Tent', severity: 'low',
    description: 'Fan reporting mild dehydration symptoms. Requesting water and shade access.',
    status: 'resolved', reportedAt: Date.now() - 900000, resolvedAt: Date.now() - 780000, venue: 'MetLife Stadium',
    protocol: { title: 'Minor Medical Assistance', steps: ['Provide water and electrolyte drink', 'Guide fan to shaded seating area', 'Monitor for 15 minutes before releasing', 'Log incident for daily health report'], estimatedResponse: '2 min', personnelNeeded: 1, priority: 'P3' }
  },
  {
    id: 'inc-006', category: 'weather', location: 'Entire Venue', severity: 'medium',
    description: 'Thunderstorm warning issued for the region. Expected to arrive in 45 minutes.',
    status: 'acknowledged', reportedAt: Date.now() - 200000, venue: 'MetLife Stadium',
    protocol: { title: 'Severe Weather Protocol', steps: ['Activate weather monitoring on all digital displays', 'Prepare sheltered areas for outdoor spectators', 'Brief all stewards on evacuation routes', 'Coordinate with match officials on potential delay'], estimatedResponse: '10 min', personnelNeeded: 12, priority: 'P2' }
  },
  {
    id: 'inc-007', category: 'general', location: 'VIP Entrance North', severity: 'low',
    description: 'VIP guest reporting lost credential badge. Requesting replacement.',
    status: 'resolved', reportedAt: Date.now() - 1200000, resolvedAt: Date.now() - 1080000, venue: 'MetLife Stadium',
    protocol: { title: 'Credential Replacement Protocol', steps: ['Verify guest identity against VIP database', 'Issue temporary replacement badge', 'Deactivate lost badge access immediately', 'Escort guest to designated VIP area'], estimatedResponse: '5 min', personnelNeeded: 1, priority: 'P3' }
  },
  {
    id: 'inc-008', category: 'security', location: 'Parking Lot B', severity: 'medium',
    description: 'Suspicious unattended bag found near vehicle row 14. Area needs inspection.',
    status: 'inProgress', reportedAt: Date.now() - 180000, venue: 'MetLife Stadium',
    protocol: { title: 'Suspicious Item Protocol', steps: ['Establish 50m perimeter around the item', 'Deploy trained security sweep team', 'Redirect parking traffic to Lot C', 'Coordinate with local bomb squad if needed'], estimatedResponse: '4 min', personnelNeeded: 5, priority: 'P1' }
  }
];

/**
 * Generates an automated response protocol based on incident details.
 * @param {Object} incident - Incident data
 * @returns {Object} Generated protocol
 */
function generateProtocol(incident) {
  const protocols = {
    medical: {
      title: 'Medical Emergency Response Protocol',
      steps: [
        `Dispatch medical team to ${incident.location}`,
        'Assess patient condition and stabilize',
        'Clear area for emergency equipment access',
        'Coordinate with on-site ambulance if evacuation needed',
        'Notify venue medical director',
        'Complete incident medical form'
      ],
      estimatedResponse: incident.severity === 'critical' ? '2 min' : '5 min',
      personnelNeeded: incident.severity === 'critical' ? 4 : 2,
      priority: incident.severity === 'critical' ? 'P1' : 'P2',
      equipment: ['First aid kit', 'AED', 'Stretcher', 'Oxygen supply']
    },
    security: {
      title: 'Security Incident Response Protocol',
      steps: [
        `Deploy security team to ${incident.location}`,
        'Assess threat level and contain situation',
        'Activate CCTV monitoring for the area',
        'Document with photo/video evidence',
        'Notify law enforcement if escalation required',
        'File security incident report'
      ],
      estimatedResponse: incident.severity === 'critical' ? '1 min' : '3 min',
      personnelNeeded: incident.severity === 'critical' ? 6 : 3,
      priority: incident.severity === 'critical' ? 'P1' : 'P2',
      equipment: ['Radio communication', 'Body camera', 'Restraint kit']
    },
    infrastructure: {
      title: 'Infrastructure Issue Response Protocol',
      steps: [
        `Send maintenance crew to ${incident.location}`,
        'Assess damage and safety implications',
        'Deploy warning signage and barriers',
        'Apply temporary fix if feasible',
        'Redirect affected fans to alternate facilities',
        'Schedule permanent repair'
      ],
      estimatedResponse: '8 min',
      personnelNeeded: 2,
      priority: 'P2',
      equipment: ['Tool kit', 'Wet floor signs', 'Barriers', 'Repair materials']
    },
    crowd: {
      title: 'Crowd Management Protocol',
      steps: [
        `Deploy stewards to ${incident.location}`,
        'Open alternate flow paths',
        'Activate digital signage redirects',
        'Announce via PA system',
        'Monitor crowd density via CCTV',
        'Report density levels every 5 minutes until normalized'
      ],
      estimatedResponse: '5 min',
      personnelNeeded: incident.severity === 'critical' ? 8 : 4,
      priority: incident.severity === 'critical' ? 'P1' : 'P2',
      equipment: ['Megaphone', 'Barrier tape', 'Digital signage controller']
    },
    weather: {
      title: 'Weather Event Protocol',
      steps: [
        'Activate weather alert across all displays',
        'Brief all staff on current conditions',
        'Prepare sheltered areas for outdoor spectators',
        'Review and communicate evacuation routes',
        'Coordinate with match officials',
        'Monitor weather radar continuously'
      ],
      estimatedResponse: '10 min',
      personnelNeeded: 12,
      priority: 'P2',
      equipment: ['Weather monitoring system', 'PA system', 'Emergency lighting']
    },
    general: {
      title: 'General Incident Response Protocol',
      steps: [
        `Assign staff member to handle at ${incident.location}`,
        'Assess situation and determine required action',
        'Resolve or escalate as appropriate',
        'Document outcome in incident log',
        'Follow up with affected parties'
      ],
      estimatedResponse: '10 min',
      personnelNeeded: 1,
      priority: 'P3',
      equipment: ['Radio', 'Incident report form']
    }
  };

  const baseProtocol = protocols[incident.category] || protocols.general;

  return {
    ...baseProtocol,
    generatedAt: Date.now(),
    incidentId: incident.id,
    aiConfidence: 0.85 + Math.random() * 0.15
  };
}

/**
 * Returns today's incident statistics.
 * @param {Object[]} incidents - Current incidents
 * @returns {Object} Statistics
 */
function getIncidentStats(incidents) {
  const items = incidents || sampleIncidents;
  const active = items.filter((i) => i.status !== 'resolved').length;
  const resolved = items.filter((i) => i.status === 'resolved').length;
  const critical = items.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;

  const resolvedItems = items.filter((i) => i.resolvedAt);
  let avgResponseMs = 0;
  if (resolvedItems.length > 0) {
    avgResponseMs = resolvedItems.reduce((sum, i) => sum + (i.resolvedAt - i.reportedAt), 0) / resolvedItems.length;
  }

  return {
    total: items.length,
    active,
    resolved,
    critical,
    avgResponseTime: Math.round(avgResponseMs / 60000),
    bySeverity: {
      critical: items.filter((i) => i.severity === 'critical').length,
      high: items.filter((i) => i.severity === 'high').length,
      medium: items.filter((i) => i.severity === 'medium').length,
      low: items.filter((i) => i.severity === 'low').length
    },
    byCategory: {
      medical: items.filter((i) => i.category === 'medical').length,
      security: items.filter((i) => i.category === 'security').length,
      infrastructure: items.filter((i) => i.category === 'infrastructure').length,
      crowd: items.filter((i) => i.category === 'crowd').length,
      weather: items.filter((i) => i.category === 'weather').length,
      general: items.filter((i) => i.category === 'general').length
    }
  };
}

export { sampleIncidents, generateProtocol, getIncidentStats };
