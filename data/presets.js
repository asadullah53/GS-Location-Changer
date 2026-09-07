/**
 * Popular global presets with exact coordinates, canonical names, and language pairs.
 * Used for quick 1-click Local SEO testing and initial favorite presets.
 */
const DEFAULT_PRESETS = [
  {
    id: "preset-us-nyc",
    name: "United States (New York)",
    countryCode: "us",
    languageCode: "en",
    latitude: 40.7128,
    longitude: -74.0060,
    canonicalName: "New York, New York, United States",
    category: "Americas"
  },
  {
    id: "preset-us-la",
    name: "United States (Los Angeles)",
    countryCode: "us",
    languageCode: "en",
    latitude: 34.0522,
    longitude: -118.2437,
    canonicalName: "Los Angeles, California, United States",
    category: "Americas"
  },
  {
    id: "preset-uk-london",
    name: "United Kingdom (London)",
    countryCode: "gb",
    languageCode: "en",
    latitude: 51.5074,
    longitude: -0.1278,
    canonicalName: "London, England, United Kingdom",
    category: "Europe"
  },
  {
    id: "preset-de-berlin",
    name: "Germany (Berlin)",
    countryCode: "de",
    languageCode: "de",
    latitude: 52.5200,
    longitude: 13.4050,
    canonicalName: "Berlin, Berlin, Germany",
    category: "Europe"
  },
  {
    id: "preset-fr-paris",
    name: "France (Paris)",
    countryCode: "fr",
    languageCode: "fr",
    latitude: 48.8566,
    longitude: 2.3522,
    canonicalName: "Paris, Ile-de-France, France",
    category: "Europe"
  },
  {
    id: "preset-ae-dubai",
    name: "United Arab Emirates (Dubai)",
    countryCode: "ae",
    languageCode: "ar",
    latitude: 25.2048,
    longitude: 55.2708,
    canonicalName: "Dubai, Dubai, United Arab Emirates",
    category: "Middle East"
  },
  {
    id: "preset-sa-riyadh",
    name: "Saudi Arabia (Riyadh)",
    countryCode: "sa",
    languageCode: "ar",
    latitude: 24.7136,
    longitude: 46.6753,
    canonicalName: "Riyadh, Riyadh Province, Saudi Arabia",
    category: "Middle East"
  },
  {
    id: "preset-pk-lahore",
    name: "Pakistan (Lahore)",
    countryCode: "pk",
    languageCode: "en",
    latitude: 31.5204,
    longitude: 74.3587,
    canonicalName: "Lahore, Punjab, Pakistan",
    category: "Asia"
  },
  {
    id: "preset-pk-karachi",
    name: "Pakistan (Karachi)",
    countryCode: "pk",
    languageCode: "ur",
    latitude: 24.8607,
    longitude: 67.0011,
    canonicalName: "Karachi, Sindh, Pakistan",
    category: "Asia"
  },
  {
    id: "preset-in-mumbai",
    name: "India (Mumbai)",
    countryCode: "in",
    languageCode: "en",
    latitude: 19.0760,
    longitude: 72.8777,
    canonicalName: "Mumbai, Maharashtra, India",
    category: "Asia"
  },
  {
    id: "preset-ca-toronto",
    name: "Canada (Toronto)",
    countryCode: "ca",
    languageCode: "en",
    latitude: 43.6532,
    longitude: -79.3832,
    canonicalName: "Toronto, Ontario, Canada",
    category: "Americas"
  },
  {
    id: "preset-au-sydney",
    name: "Australia (Sydney)",
    countryCode: "au",
    languageCode: "en",
    latitude: -33.8688,
    longitude: 151.2093,
    canonicalName: "Sydney, New South Wales, Australia",
    category: "Oceania"
  },
  {
    id: "preset-jp-tokyo",
    name: "Japan (Tokyo)",
    countryCode: "jp",
    languageCode: "ja",
    latitude: 35.6762,
    longitude: 139.6503,
    canonicalName: "Tokyo, Tokyo, Japan",
    category: "Asia"
  },
  {
    id: "preset-sg-singapore",
    name: "Singapore",
    countryCode: "sg",
    languageCode: "en",
    latitude: 1.3521,
    longitude: 103.8198,
    canonicalName: "Singapore, Central Singapore, Singapore",
    category: "Asia"
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_PRESETS };
}
