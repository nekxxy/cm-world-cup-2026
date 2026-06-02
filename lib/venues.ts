import type { Venue } from "./types";

/**
 * The 16 WC2026 host-city venues, verified from the spec's Appendix A.
 * Venues are public, verified facts and are the ONE dataset hardcoded here;
 * all other sports data is sourced from API-Football via scripts/seed.ts.
 */
export const VENUES: Venue[] = [
  {
    id: "mexico-city",
    city: "Mexico City",
    country: "Mexico",
    countryCode: "MX",
    stadium: "Estadio Azteca",
    lat: 19.303,
    lon: -99.15,
    opening: true,
  },
  {
    id: "new-york-nj",
    city: "New York/NJ",
    country: "United States",
    countryCode: "US",
    stadium: "MetLife Stadium",
    lat: 40.814,
    lon: -74.074,
    final: true,
  },
  {
    id: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    countryCode: "US",
    stadium: "SoFi Stadium",
    lat: 33.953,
    lon: -118.339,
  },
  {
    id: "dallas",
    city: "Dallas",
    country: "United States",
    countryCode: "US",
    stadium: "AT&T Stadium",
    lat: 32.747,
    lon: -97.093,
  },
  {
    id: "atlanta",
    city: "Atlanta",
    country: "United States",
    countryCode: "US",
    stadium: "Mercedes-Benz Stadium",
    lat: 33.755,
    lon: -84.401,
  },
  {
    id: "miami",
    city: "Miami",
    country: "United States",
    countryCode: "US",
    stadium: "Hard Rock Stadium",
    lat: 25.958,
    lon: -80.239,
  },
  {
    id: "houston",
    city: "Houston",
    country: "United States",
    countryCode: "US",
    stadium: "NRG Stadium",
    lat: 29.685,
    lon: -95.411,
  },
  {
    id: "kansas-city",
    city: "Kansas City",
    country: "United States",
    countryCode: "US",
    stadium: "Arrowhead Stadium",
    lat: 39.049,
    lon: -94.484,
  },
  {
    id: "philadelphia",
    city: "Philadelphia",
    country: "United States",
    countryCode: "US",
    stadium: "Lincoln Financial Field",
    lat: 39.901,
    lon: -75.168,
  },
  {
    id: "san-francisco",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    stadium: "Levi's Stadium",
    lat: 37.403,
    lon: -121.97,
  },
  {
    id: "seattle",
    city: "Seattle",
    country: "United States",
    countryCode: "US",
    stadium: "Lumen Field",
    lat: 47.595,
    lon: -122.332,
  },
  {
    id: "boston",
    city: "Boston",
    country: "United States",
    countryCode: "US",
    stadium: "Gillette Stadium",
    lat: 42.091,
    lon: -71.264,
  },
  {
    id: "guadalajara",
    city: "Guadalajara",
    country: "Mexico",
    countryCode: "MX",
    stadium: "Estadio Akron",
    lat: 20.681,
    lon: -103.463,
  },
  {
    id: "monterrey",
    city: "Monterrey",
    country: "Mexico",
    countryCode: "MX",
    stadium: "Estadio BBVA",
    lat: 25.669,
    lon: -100.244,
  },
  {
    id: "toronto",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    stadium: "BMO Field",
    lat: 43.633,
    lon: -79.418,
  },
  {
    id: "vancouver",
    city: "Vancouver",
    country: "Canada",
    countryCode: "CA",
    stadium: "BC Place",
    lat: 49.277,
    lon: -123.112,
  },
];

const VENUE_BY_ID = new Map(VENUES.map((v) => [v.id, v]));

export function getVenue(id: string | null | undefined): Venue | undefined {
  if (!id) return undefined;
  return VENUE_BY_ID.get(id);
}

export const openingVenue = VENUES.find((v) => v.opening)!;
export const finalVenue = VENUES.find((v) => v.final)!;
