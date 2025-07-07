const https = require('https');
const querystring = require('querystring');

const webhookUrl = 'https://hartzell.app/rest/1/jp689g5yfvre9pvd/';
const smartProcessId = 1058;

// Updated finish IDs based on current configuration
const productFinishes = [
  { 
    id: 11, 
    name: "Sherwin-Williams - Super Paint", 
    // For now, using most popular finish since field is single-select
    finishId: "2102", // Satin
    allFinishes: "Flat, Satin, Gloss, High Gloss"
  },
  { 
    id: 12, 
    name: "Sherwin-Williams - Self-Cleaning", 
    finishId: "2100", // Flat/Matte
    allFinishes: "Flat, Satin"
  },
  { 
    id: 13, 
    name: "Sherwin-Williams - Latitude", 
    finishId: "2102", // Satin
    allFinishes: "Flat, Satin, Gloss"
  },
  { 
    id: 14, 
    name: "Sherwin-Williams - Emerald", 
    finishId: "2102", // Satin
    allFinishes: "Flat, Satin, Gloss"
  },
  { 
    id: 15, 
    name: "Benjamin Moore - Ultra Spec", 
    finishId: "2102", // Satin
    allFinishes: "Flat, Low Lustre, Satin, Gloss"
  },
  { 
    id: 16, 
    name: "Benjamin Moore - Crylicote", 
    finishId: "2102", // Satin
    allFinishes: "Flat, Satin, Semi-Gloss"
  },
  { 
    id: 17, 
    name: "Benjamin Moore - Regal", 
    finishId: "2101", // Low Sheen/Lustre
    allFinishes: "Flat, Low Lustre, Soft Gloss"
  },
  { 
    id: 18, 
    name: "Benjamin Moore - Aura",