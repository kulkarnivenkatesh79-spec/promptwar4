/**
 * @fileoverview Mock sustainability and eco-tracker data.
 * @module data/mockEcoData
 */

/** @type {Object[]} Available eco actions with point values */
const ecoActions = [
  { id: 'waste-segregation', type: 'waste', label: 'Waste Segregation', points: 50, icon: '♻️', description: 'Properly sorted waste at recycling station' },
  { id: 'digital-ticket', type: 'digital', label: 'Digital Ticket', points: 100, icon: '📱', description: 'Used digital ticket instead of paper' },
  { id: 'public-transit', type: 'transit', label: 'Public Transit', points: 75, icon: '🚇', description: 'Traveled to venue via public transportation' },
  { id: 'refill-bottle', type: 'water', label: 'Refillable Bottle', points: 25, icon: '🍶', description: 'Used refillable water bottle at hydration station' },
  { id: 'carbon-neutral', type: 'travel', label: 'Carbon Neutral Travel', points: 150, icon: '🌿', description: 'Offset travel carbon footprint' },
  { id: 'carpool', type: 'travel', label: 'Carpooling', points: 60, icon: '🚗', description: 'Shared ride with other fans' },
  { id: 'bike-ride', type: 'travel', label: 'Bike to Stadium', points: 100, icon: '🚲', description: 'Cycled to the venue' },
  { id: 'food-local', type: 'food', label: 'Local Food Choice', points: 30, icon: '🥗', description: 'Chose locally sourced food option' },
  { id: 'merch-sustainable', type: 'merch', label: 'Eco Merchandise', points: 40, icon: '👕', description: 'Purchased FIFA eco-certified merchandise' },
  { id: 'water-save', type: 'water', label: 'Water Conservation', points: 20, icon: '💧', description: 'Used water-saving fixtures' }
];

/** @type {Object[]} Achievement badges */
const achievements = [
  { id: 'green-starter', title: 'Green Starter', icon: '🌱', description: 'Earned first 100 eco points', requiredPoints: 100 },
  { id: 'eco-warrior', title: 'Eco Warrior', icon: '⚔️', description: 'Earned 500 eco points', requiredPoints: 500 },
  { id: 'planet-hero', title: 'Planet Hero', icon: '🌍', description: 'Earned 1000 eco points', requiredPoints: 1000 },
  { id: 'recycling-champ', title: 'Recycling Champion', icon: '♻️', description: 'Completed 10 waste segregation actions', requiredAction: 'waste', requiredCount: 10 },
  { id: 'transit-master', title: 'Transit Master', icon: '🚇', description: 'Used public transit 5 times', requiredAction: 'transit', requiredCount: 5 },
  { id: 'digital-native', title: 'Digital Native', icon: '📱', description: 'Used digital tickets for all matches', requiredAction: 'digital', requiredCount: 3 },
  { id: 'zero-waste', title: 'Zero Waste Hero', icon: '🏆', description: 'Achieved zero waste for a match day', requiredPoints: 200 },
  { id: 'carbon-fighter', title: 'Carbon Fighter', icon: '💨', description: 'Saved 50kg of CO₂', requiredCarbon: 50 }
];

/** @type {Object[]} Mock leaderboard data */
const leaderboard = [
  { rank: 1, name: 'Maria G.', country: '🇧🇷', points: 2450, carbonSaved: 112 },
  { rank: 2, name: 'James K.', country: '🇺🇸', points: 2180, carbonSaved: 98 },
  { rank: 3, name: 'Yuki T.', country: '🇯🇵', points: 1950, carbonSaved: 87 },
  { rank: 4, name: 'Ahmed R.', country: '🇸🇦', points: 1720, carbonSaved: 76 },
  { rank: 5, name: 'Sophie L.', country: '🇫🇷', points: 1580, carbonSaved: 71 },
  { rank: 6, name: 'Carlos M.', country: '🇲🇽', points: 1440, carbonSaved: 65 },
  { rank: 7, name: 'Kim S.', country: '🇰🇷', points: 1350, carbonSaved: 61 },
  { rank: 8, name: 'Hans W.', country: '🇩🇪', points: 1200, carbonSaved: 54 },
  { rank: 9, name: 'Priya P.', country: '🇮🇳', points: 1080, carbonSaved: 49 },
  { rank: 10, name: 'Marco B.', country: '🇮🇹', points: 950, carbonSaved: 43 }
];

/**
 * Calculates carbon savings in kg from eco actions.
 * @param {Object[]} actions - Completed eco actions
 * @returns {number} Total carbon saved in kg
 */
function calculateCarbonSaved(actions) {
  const carbonMap = {
    transit: 4.2,
    travel: 8.5,
    digital: 0.5,
    waste: 1.2,
    water: 0.3,
    food: 1.8,
    merch: 0.8
  };

  return actions.reduce((total, action) => {
    return total + (carbonMap[action.type] || 0.5);
  }, 0);
}

/**
 * Checks which achievements the user has earned.
 * @param {number} totalPoints - User's total points
 * @param {Object[]} completedActions - User's completed actions
 * @param {number} carbonSaved - Total carbon saved
 * @returns {Object[]} Earned achievements
 */
function checkAchievements(totalPoints, completedActions, carbonSaved) {
  return achievements.filter((achievement) => {
    if (achievement.requiredPoints && totalPoints >= achievement.requiredPoints) return true;
    if (achievement.requiredCarbon && carbonSaved >= achievement.requiredCarbon) return true;
    if (achievement.requiredAction && achievement.requiredCount) {
      const actionCount = completedActions.filter((a) => a.type === achievement.requiredAction).length;
      return actionCount >= achievement.requiredCount;
    }
    return false;
  });
}

/**
 * Gets the tournament-wide eco statistics.
 * @returns {Object} Global eco stats
 */
function getGlobalEcoStats() {
  return {
    totalParticipants: 284567,
    totalPointsEarned: 42_850_000,
    totalCarbonSaved: 1_284_500,
    totalTreesEquivalent: 58_386,
    wasteRecycled: 847_000,
    digitalTickets: 2_140_000,
    publicTransitTrips: 1_560_000,
    dailyGrowth: 3.2
  };
}

export {
  ecoActions,
  achievements,
  leaderboard,
  calculateCarbonSaved,
  checkAchievements,
  getGlobalEcoStats
};
