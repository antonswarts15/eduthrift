interface CollectionPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const collectionPoints: CollectionPoint[] = [
  { name: 'PudoLocker - Sandton City Mall', address: 'Sandton City Mall, Johannesburg', lat: -26.1076, lng: 28.0567 },
  { name: 'PudoLocker - Eastgate Shopping Centre', address: 'Eastgate Shopping Centre, Johannesburg', lat: -26.1891, lng: 28.1631 },
  { name: 'PudoLocker - Menlyn Park Shopping Centre', address: 'Menlyn Park, Pretoria', lat: -25.7879, lng: 28.2774 }
];

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export const getNearestCollectionPoints = (userAddress: string): string[] => {
  // Mock coordinates based on common SA addresses
  const addressCoords: { [key: string]: { lat: number, lng: number } } = {
    'sandton': { lat: -26.1076, lng: 28.0567 },
    'johannesburg': { lat: -26.2041, lng: 28.0473 },
    'pretoria': { lat: -25.7479, lng: 28.2293 },
    'rosebank': { lat: -26.1448, lng: 28.0436 },
    'fourways': { lat: -25.9929, lng: 28.0094 }
  };

  const userKey = Object.keys(addressCoords).find(key => 
    userAddress.toLowerCase().includes(key)
  ) || 'johannesburg';
  
  const userCoords = addressCoords[userKey];
  
  return collectionPoints
    .map(point => ({
      ...point,
      distance: calculateDistance(userCoords.lat, userCoords.lng, point.lat, point.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .map(point => point.name);
};