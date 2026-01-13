export interface Location {
  lat: number;
  lng: number;
}

export interface School {
  id: string;
  name: string;
  address: string;
  distance?: number;
  lat: number;
  lng: number;
}

export interface Club {
  id: string;
  name: string;
  address: string;
  distance?: number;
  lat: number;
  lng: number;
  sport?: string;
}

class LocationService {
  // Get user's current location
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Search nearby schools using multiple APIs for better coverage
  async searchNearbySchools(location: Location, radius: number = 10): Promise<School[]> {
    try {
      const allSchools: School[] = [];
      
      // Search with multiple queries for better results
      const queries = [
        'primary school',
        'high school', 
        'secondary school',
        'college',
        'academy'
      ];
      
      for (const query of queries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&lat=${location.lat}&lon=${location.lng}&bounded=1&viewbox=${location.lng-0.05},${location.lat+0.05},${location.lng+0.05},${location.lat-0.05}&limit=10&countrycodes=za`
        );
        
        const data = await response.json();
        
        const schools = data
          .filter((place: any) => {
            const name = place.display_name.toLowerCase();
            return name.includes('school') || name.includes('college') || name.includes('academy');
          })
          .map((place: any) => {
            const distance = this.calculateDistance(
              location.lat, location.lng,
              parseFloat(place.lat), parseFloat(place.lon)
            );
            
            return {
              id: place.place_id.toString(),
              name: this.cleanSchoolName(place.display_name.split(',')[0]),
              address: place.display_name,
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon),
              distance: Math.round(distance * 10) / 10
            };
          })
          .filter((school: School) => school.distance! <= radius);
          
        allSchools.push(...schools);
      }
      
      // Remove duplicates and sort by distance
      const uniqueSchools = allSchools.filter((school, index, self) => 
        index === self.findIndex(s => s.name === school.name)
      );
      
      return uniqueSchools
        .sort((a: School, b: School) => a.distance! - b.distance!)
        .slice(0, 15);
        
    } catch (error) {
      console.error('Error searching schools:', error);
      return [];
    }
  }
  
  private cleanSchoolName(name: string): string {
    // Clean up school names
    return name
      .replace(/^(The\s+)?/, '') // Remove "The" prefix
      .replace(/\s+(Primary|High|Secondary)\s+School$/i, ' $1 School')
      .trim();
  }

  // Search nearby clubs/sports facilities
  async searchNearbyClubs(location: Location, radius: number = 15): Promise<Club[]> {
    try {
      const queries = ['sports club', 'gym', 'fitness center', 'rugby club', 'cricket club'];
      const allClubs: Club[] = [];

      for (const query of queries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&lat=${location.lat}&lon=${location.lng}&bounded=1&viewbox=${location.lng-0.2},${location.lat+0.2},${location.lng+0.2},${location.lat-0.2}&limit=10`
        );
        
        const data = await response.json();
        
        const clubs = data.map((place: any) => {
          const distance = this.calculateDistance(
            location.lat, location.lng,
            parseFloat(place.lat), parseFloat(place.lon)
          );
          
          return {
            id: place.place_id.toString(),
            name: place.display_name.split(',')[0],
            address: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            distance: Math.round(distance * 10) / 10,
            sport: this.extractSport(place.display_name)
          };
        });
        
        allClubs.push(...clubs);
      }

      return allClubs
        .filter((club: Club) => club.distance! <= radius)
        .sort((a: Club, b: Club) => a.distance! - b.distance!)
        .slice(0, 15);
    } catch (error) {
      console.error('Error searching clubs:', error);
      return [];
    }
  }

  private extractSport(name: string): string {
    const sports = ['rugby', 'cricket', 'soccer', 'tennis', 'golf', 'swimming', 'gym', 'fitness'];
    const lowerName = name.toLowerCase();
    
    for (const sport of sports) {
      if (lowerName.includes(sport)) {
        return sport.charAt(0).toUpperCase() + sport.slice(1);
      }
    }
    
    return 'General';
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      return data.locality || data.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}

export default new LocationService();