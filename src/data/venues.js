/**
 * @fileoverview FIFA World Cup 2026 venue data — all 16 real stadiums.
 * @module data/venues
 */

/** @typedef {Object} Venue
 * @property {string} id - Unique venue identifier
 * @property {string} name - Stadium name
 * @property {string} city - Host city
 * @property {string} country - Host country
 * @property {string} countryCode - ISO country code
 * @property {number} capacity - Seating capacity
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} gateCount - Number of entry gates
 * @property {string[]} facilities - Available facilities
 * @property {Object} accessibility - Accessibility features
 */

/** @type {Venue[]} */
const venues = [
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'New York / New Jersey',
    country: 'United States',
    countryCode: 'US',
    capacity: 82500,
    lat: 40.8128,
    lng: -74.0742,
    gateCount: 8,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'merchandise'],
    accessibility: { ramps: 12, elevators: 8, wheelchairSeats: 450, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'sofi',
    name: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'United States',
    countryCode: 'US',
    capacity: 70240,
    lat: 33.9535,
    lng: -118.3392,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'vip-lounge'],
    accessibility: { ramps: 10, elevators: 12, wheelchairSeats: 400, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'att',
    name: 'AT&T Stadium',
    city: 'Dallas',
    country: 'United States',
    countryCode: 'US',
    capacity: 80000,
    lat: 32.7473,
    lng: -97.0945,
    gateCount: 7,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'art-gallery'],
    accessibility: { ramps: 14, elevators: 10, wheelchairSeats: 500, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'hardrock',
    name: 'Hard Rock Stadium',
    city: 'Miami',
    country: 'United States',
    countryCode: 'US',
    capacity: 65326,
    lat: 25.9580,
    lng: -80.2389,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone'],
    accessibility: { ramps: 8, elevators: 6, wheelchairSeats: 350, brailleSignage: true, hearingLoops: false }
  },
  {
    id: 'nrg',
    name: 'NRG Stadium',
    city: 'Houston',
    country: 'United States',
    countryCode: 'US',
    capacity: 72220,
    lat: 29.6847,
    lng: -95.4107,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'retractable-roof'],
    accessibility: { ramps: 10, elevators: 8, wheelchairSeats: 380, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'mercedes',
    name: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    country: 'United States',
    countryCode: 'US',
    capacity: 71000,
    lat: 33.7554,
    lng: -84.4010,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'retractable-roof'],
    accessibility: { ramps: 12, elevators: 10, wheelchairSeats: 420, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'gillette',
    name: 'Gillette Stadium',
    city: 'Boston',
    country: 'United States',
    countryCode: 'US',
    capacity: 65878,
    lat: 42.0909,
    lng: -71.2643,
    gateCount: 5,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone'],
    accessibility: { ramps: 8, elevators: 6, wheelchairSeats: 320, brailleSignage: true, hearingLoops: false }
  },
  {
    id: 'lincoln',
    name: 'Lincoln Financial Field',
    city: 'Philadelphia',
    country: 'United States',
    countryCode: 'US',
    capacity: 69176,
    lat: 39.9008,
    lng: -75.1675,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm'],
    accessibility: { ramps: 10, elevators: 6, wheelchairSeats: 350, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'arrowhead',
    name: 'GEHA Field at Arrowhead Stadium',
    city: 'Kansas City',
    country: 'United States',
    countryCode: 'US',
    capacity: 76416,
    lat: 39.0489,
    lng: -94.4839,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'tailgate-area'],
    accessibility: { ramps: 8, elevators: 6, wheelchairSeats: 360, brailleSignage: true, hearingLoops: false }
  },
  {
    id: 'levis',
    name: "Levi's Stadium",
    city: 'San Francisco Bay Area',
    country: 'United States',
    countryCode: 'US',
    capacity: 68500,
    lat: 37.4033,
    lng: -121.9694,
    gateCount: 6,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone', 'green-roof'],
    accessibility: { ramps: 12, elevators: 8, wheelchairSeats: 400, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'lumen',
    name: 'Lumen Field',
    city: 'Seattle',
    country: 'United States',
    countryCode: 'US',
    capacity: 68740,
    lat: 47.5952,
    lng: -122.3316,
    gateCount: 5,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone'],
    accessibility: { ramps: 10, elevators: 8, wheelchairSeats: 350, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'azteca',
    name: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    countryCode: 'MX',
    capacity: 87523,
    lat: 19.3029,
    lng: -99.1505,
    gateCount: 8,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'museum', 'fan-zone'],
    accessibility: { ramps: 6, elevators: 4, wheelchairSeats: 300, brailleSignage: false, hearingLoops: false }
  },
  {
    id: 'akron',
    name: 'Estadio Akron',
    city: 'Guadalajara',
    country: 'Mexico',
    countryCode: 'MX',
    capacity: 49850,
    lat: 20.6810,
    lng: -103.4624,
    gateCount: 4,
    facilities: ['parking', 'food-court', 'first-aid', 'atm'],
    accessibility: { ramps: 6, elevators: 4, wheelchairSeats: 200, brailleSignage: false, hearingLoops: false }
  },
  {
    id: 'bbva',
    name: 'Estadio BBVA',
    city: 'Monterrey',
    country: 'Mexico',
    countryCode: 'MX',
    capacity: 53500,
    lat: 25.6644,
    lng: -100.2449,
    gateCount: 4,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone'],
    accessibility: { ramps: 6, elevators: 4, wheelchairSeats: 250, brailleSignage: false, hearingLoops: false }
  },
  {
    id: 'bmo',
    name: 'BMO Field',
    city: 'Toronto',
    country: 'Canada',
    countryCode: 'CA',
    capacity: 45736,
    lat: 43.6332,
    lng: -79.4186,
    gateCount: 4,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'fan-zone'],
    accessibility: { ramps: 8, elevators: 4, wheelchairSeats: 250, brailleSignage: true, hearingLoops: true }
  },
  {
    id: 'bcplace',
    name: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
    countryCode: 'CA',
    capacity: 54500,
    lat: 49.2768,
    lng: -123.1116,
    gateCount: 5,
    facilities: ['parking', 'food-court', 'first-aid', 'atm', 'retractable-roof', 'fan-zone'],
    accessibility: { ramps: 10, elevators: 6, wheelchairSeats: 300, brailleSignage: true, hearingLoops: true }
  }
];

/**
 * Returns a venue by its ID.
 * @param {string} id - Venue identifier
 * @returns {Venue|undefined}
 */
function getVenueById(id) {
  return venues.find((v) => v.id === id);
}

/**
 * Returns all venues for a specific country.
 * @param {string} country - Country name
 * @returns {Venue[]}
 */
function getVenuesByCountry(country) {
  return venues.filter((v) => v.country === country);
}

/**
 * Returns total global capacity across all venues.
 * @returns {number}
 */
function getTotalCapacity() {
  return venues.reduce((sum, v) => sum + v.capacity, 0);
}

export { venues, getVenueById, getVenuesByCountry, getTotalCapacity };
