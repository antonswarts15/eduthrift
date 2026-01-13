interface Coordinates {
  lat: number;
  lng: number;
}

// Mock geocoding for South African cities/suburbs
const locationCoordinates: { [key: string]: Coordinates } = {
  // Gauteng
  'sandton': { lat: -26.1076, lng: 28.0567 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'pretoria': { lat: -25.7479, lng: 28.2293 },
  'rosebank': { lat: -26.1448, lng: 28.0436 },
  'fourways': { lat: -25.9929, lng: 28.0094 },
  'randburg': { lat: -26.0939, lng: 28.0021 },
  'midrand': { lat: -25.9953, lng: 28.1289 },
  'centurion': { lat: -25.8601, lng: 28.1878 },
  
  // Western Cape
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'stellenbosch': { lat: -33.9321, lng: 18.8602 },
  'paarl': { lat: -33.7364, lng: 18.9707 },
  'bellville': { lat: -33.8803, lng: 18.6292 },
  
  // KwaZulu-Natal
  'durban': { lat: -29.8587, lng: 31.0218 },
  'pietermaritzburg': { lat: -29.6094, lng: 30.3781 },
  'umhlanga': { lat: -29.7277, lng: 31.0820 },
  
  // Default fallback
  'gauteng': { lat: -26.2041, lng: 28.0473 },
  'western cape': { lat: -33.9249, lng: 18.4241 },
  'kwazulu-natal': { lat: -29.8587, lng: 31.0218 }
};

export const getCoordinatesFromAddress = (address: { suburb: string; city: string; province: string }): Coordinates => {
  const searchTerms = [
    address.suburb.toLowerCase(),
    address.city.toLowerCase(),
    address.province.toLowerCase()
  ];
  
  // Try to find exact match first
  for (const term of searchTerms) {
    if (locationCoordinates[term]) {
      return locationCoordinates[term];
    }
  }
  
  // Try partial matches
  for (const term of searchTerms) {
    const match = Object.keys(locationCoordinates).find(key => 
      key.includes(term) || term.includes(key)
    );
    if (match) {
      return locationCoordinates[match];
    }
  }
  
  // Default to Johannesburg
  return locationCoordinates['johannesburg'];
};