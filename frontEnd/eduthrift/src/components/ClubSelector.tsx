import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonIcon,
  IonToggle,
  IonList,
  IonCard,
  IonCardContent,
  IonBadge,
  IonSpinner
} from '@ionic/react';
import { locationOutline, fitnessOutline } from 'ionicons/icons';
import LocationService, { Club } from '../services/location';

interface ClubSelectorProps {
  value: string;
  onClubChange: (clubName: string) => void;
  placeholder?: string;
}

const ClubSelector: React.FC<ClubSelectorProps> = ({ value, onClubChange, placeholder = "Select or enter club name" }) => {
  const [useNearbyClubs, setUseNearbyClubs] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableClubs, setAvailableClubs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customClubName, setCustomClubName] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{name: string, town: string, province: string}[]>([]);

  const [nearbyClubs, setNearbyClubs] = useState<Club[]>([]);
  const [filteredNearbyClubs, setFilteredNearbyClubs] = useState<Club[]>([]);
  const [nearbySearchTerm, setNearbySearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Mock club database organized by province and town
  const clubDatabase = {
    'Gauteng': {
      'Johannesburg': ['Wanderers Cricket Club', 'Pirates Rugby Club', 'Johannesburg Country Club', 'Ellis Park Tennis Club'],
      'Pretoria': ['Loftus Versfeld Rugby Club', 'Pretoria Country Club', 'Blue Bulls Rugby Club', 'Centurion Cricket Club'],
      'Kempton Park': ['Kempton Park Golf Club', 'Kempton Park Cricket Club', 'Bonaero Park Tennis Club', 'Spartan Rugby Club', 'Edenvale Tennis Club', 'OR Tambo Athletics Club'],
      'Sandton': ['Sandton Country Club', 'Bryanston Country Club', 'Wanderers Golf Club', 'Sandton Tennis Club']
    },
    'Western Cape': {
      'Cape Town': ['Western Province Rugby Club', 'Newlands Cricket Club', 'Royal Cape Golf Club', 'Cape Town Tennis Club'],
      'Stellenbosch': ['Stellenbosch Rugby Club', 'Boland Cricket Club', 'Stellenbosch Golf Club', 'Maties Tennis Club'],
      'Paarl': ['Paarl Rugby Club', 'Boland Park Cricket Club', 'Pearl Valley Golf Club', 'Paarl Tennis Club']
    },
    'KwaZulu-Natal': {
      'Durban': ['Sharks Rugby Club', 'Kingsmead Cricket Club', 'Durban Country Club', 'Durban Tennis Club'],
      'Pietermaritzburg': ['Natal Sharks Rugby Club', 'Alexandra Park Cricket Club', 'Pietermaritzburg Golf Club', 'PMB Tennis Club']
    }
  };

  // Load nearby clubs only when toggle is turned on
  // useEffect removed - clubs load only when user enables nearby toggle

  const handleToggleChange = async (checked: boolean) => {
    setUseNearbyClubs(checked);
    if (checked) {
      await loadNearbyClubs();
    } else {
      onClubChange('');
      setSelectedProvince('');
      setSelectedTown('');
      setAvailableTowns([]);
      setAvailableClubs([]);
      setNearbyClubs([]);
      setFilteredNearbyClubs([]);
    }
  };

  const loadNearbyClubs = async () => {
    try {
      setLoading(true);
      setLocationStatus('Getting your location...');
      
      const location = await LocationService.getCurrentLocation();
      setLocationStatus('Searching nearby clubs...');

      const clubs = await LocationService.searchNearbyClubs(location, 15);
      
      // Also include clubs from local database based on detected location
      const address = await LocationService.getAddressFromCoords(location.lat, location.lng);
      const localClubs = getLocalClubsFromAddress(address);
      
      // Combine and deduplicate clubs
      const allClubs = [...clubs, ...localClubs];
      const uniqueClubs = allClubs.filter((club, index, self) => 
        index === self.findIndex(c => c.name.toLowerCase() === club.name.toLowerCase())
      );

      if (uniqueClubs.length > 0) {
        setNearbyClubs(uniqueClubs);
        setLocationStatus(`Found ${uniqueClubs.length} clubs nearby`);
      } else {
        setLocationStatus('No clubs found nearby. Try manual selection.');
        setUseNearbyClubs(false);
      }
    } catch (error) {
      setLocationStatus('Unable to get location. Please select manually.');
      setUseNearbyClubs(false);
    } finally {
      setLoading(false);
    }
  };

  const getLocalClubsFromAddress = (address: string): Club[] => {
    const localClubs: Club[] = [];
    const addressLower = address.toLowerCase();
    
    Object.entries(clubDatabase).forEach(([province, towns]) => {
      Object.entries(towns).forEach(([town, clubs]) => {
        if (addressLower.includes(town.toLowerCase())) {
          clubs.forEach((clubName, index) => {
            localClubs.push({
              id: `local-${province}-${town}-${index}`,
              name: clubName,
              address: `${town}, ${province}`,
              lat: 0,
              lng: 0,
              distance: 0
            });
          });
        }
      });
    });
    
    return localClubs;
  };

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    if (term.trim() === '') {
      setGlobalSearchResults([]);
      return;
    }

    const results: {name: string, town: string, province: string}[] = [];
    Object.entries(clubDatabase).forEach(([province, towns]) => {
      Object.entries(towns).forEach(([town, clubs]) => {
        clubs.forEach(club => {
          if (club.toLowerCase().includes(term.toLowerCase())) {
            results.push({ name: club, town, province });
          }
        });
      });
    });
    setGlobalSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  const handleGlobalClubSelect = (club: {name: string, town: string, province: string}) => {
    onClubChange(club.name);
    setGlobalSearchTerm('');
    setGlobalSearchResults([]);
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedTown('');
    onClubChange('');
    setAvailableClubs([]);
    setSearchTerm('');
    
    if (province && clubDatabase[province as keyof typeof clubDatabase]) {
      const towns = Object.keys(clubDatabase[province as keyof typeof clubDatabase]);
      setAvailableTowns(towns);
    } else {
      setAvailableTowns([]);
    }
  };
  
  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    onClubChange('');
    setSearchTerm('');
    
    if (selectedProvince && town && clubDatabase[selectedProvince as keyof typeof clubDatabase]) {
      const clubs = clubDatabase[selectedProvince as keyof typeof clubDatabase][town as keyof typeof clubDatabase[keyof typeof clubDatabase]] || [];
      setAvailableClubs(clubs);
      setFilteredClubs(clubs);
    } else {
      setAvailableClubs([]);
      setFilteredClubs([]);
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredClubs(availableClubs);
    } else {
      const filtered = availableClubs.filter(club => 
        club.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredClubs(filtered);
    }
  };

  const handleNearbySearchChange = (term: string) => {
    setNearbySearchTerm(term);
    if (term.trim() === '') {
      setFilteredNearbyClubs(nearbyClubs);
    } else {
      const filtered = nearbyClubs.filter(club => 
        club.name.toLowerCase().includes(term.toLowerCase()) ||
        club.address.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredNearbyClubs(filtered);
    }
  };

  const handleClubSelect = (clubName: string) => {
    onClubChange(clubName);
  };

  return (
    <div>
      <IonItem style={{ marginBottom: '16px' }}>
        <IonInput 
          label="Type to search..." 
          labelPlacement="stacked"
          placeholder="Search for any club by name"
          value={globalSearchTerm}
          onIonChange={e => handleGlobalSearch(e.detail.value!)}
        />
        <IonButton 
          slot="end" 
          fill="clear" 
          size="small"
          onClick={() => handleGlobalSearch(globalSearchTerm)}
        >
          Search
        </IonButton>
      </IonItem>
      
      {globalSearchResults.length > 0 && (
        <IonCard style={{ marginBottom: '16px' }}>
          <IonCardContent style={{ padding: '0' }}>
            <IonList>
              {globalSearchResults.map((club, index) => (
                <IonItem 
                  key={`${club.province}-${club.town}-${club.name}-${index}`}
                  button 
                  onClick={() => handleGlobalClubSelect(club)}
                  style={{ 
                    backgroundColor: value === club.name ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <IonIcon icon={fitnessOutline} slot="start" />
                  <IonLabel>
                    <h3>{club.name}</h3>
                    <p>{club.town}, {club.province}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      )}
      
      <IonItem style={{ marginBottom: '16px' }}>
        <IonLabel>Use nearby clubs</IonLabel>
        <IonToggle 
          checked={useNearbyClubs} 
          onIonChange={e => handleToggleChange(e.detail.checked)}
        />
      </IonItem>

      {useNearbyClubs ? (
        <div>
          {loading && (
            <IonItem>
              <IonSpinner name="crescent" />
              <IonLabel style={{ marginLeft: '12px' }}>Searching nearby clubs...</IonLabel>
            </IonItem>
          )}
          
          {locationStatus && (
            <div style={{ 
              padding: '8px 16px', 
              fontSize: '12px', 
              color: nearbyClubs.length > 0 ? '#28a745' : '#666',
              backgroundColor: nearbyClubs.length > 0 ? '#f8f9fa' : 'transparent',
              borderRadius: '4px',
              margin: '8px 16px'
            }}>
              {locationStatus}
            </div>
          )}
          
          {nearbyClubs.length > 0 && (
            <IonCard>
              <IonCardContent style={{ padding: '0' }}>
                <IonList>
                  {nearbyClubs.map((club) => (
                    <IonItem 
                      key={club.id} 
                      button 
                      onClick={() => handleClubSelect(club.name)}
                      style={{ 
                        backgroundColor: value === club.name ? '#e3f2fd' : 'transparent'
                      }}
                    >
                      <IonIcon icon={fitnessOutline} slot="start" />
                      <IonLabel>
                        <h3>{club.name}</h3>
                        <p>{club.address}</p>
                      </IonLabel>
                      {club.distance && club.distance > 0 && (
                        <IonBadge color="primary" slot="end">
                          {club.distance}km
                        </IonBadge>
                      )}
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      ) : (
        <div>
          <IonItem style={{ marginBottom: '16px' }}>
            <IonLabel position="stacked">Province</IonLabel>
            <IonSelect value={selectedProvince} onIonChange={e => handleProvinceChange(e.detail.value)} placeholder="Select Province">
              {Object.keys(clubDatabase).map(province => (
                <IonSelectOption key={province} value={province}>{province}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          
          {selectedProvince && (
            <IonItem style={{ marginBottom: '16px' }}>
              <IonLabel position="stacked">Town/City</IonLabel>
              <IonSelect value={selectedTown} onIonChange={e => handleTownChange(e.detail.value)} placeholder="Select Town">
                {availableTowns.map(town => (
                  <IonSelectOption key={town} value={town}>{town}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}
          
          {selectedTown && availableClubs.length > 0 && (
            <div>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="Search Clubs" 
                  labelPlacement="stacked"
                  placeholder="Type to search clubs..."
                  value={searchTerm}
                  onIonChange={e => handleSearchChange(e.detail.value!)}
                />
              </IonItem>
              
              {filteredClubs.length > 0 && (
                <IonCard>
                  <IonCardContent style={{ padding: '0' }}>
                    <IonList>
                      {filteredClubs.map((club) => (
                        <IonItem 
                          key={club} 
                          button 
                          onClick={() => handleClubSelect(club)}
                          style={{ 
                            backgroundColor: value === club ? '#e3f2fd' : 'transparent'
                          }}
                        >
                          <IonIcon icon={fitnessOutline} slot="start" />
                          <IonLabel>
                            <h3>{club}</h3>
                            <p>{selectedTown}, {selectedProvince}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              )}
              
              {filteredClubs.length === 0 && searchTerm && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                  No clubs found matching "{searchTerm}"
                </div>
              )}
              
              <IonItem style={{ marginTop: '16px' }}>
                <IonLabel>Club not listed?</IonLabel>
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={() => setShowCustomInput(!showCustomInput)}
                >
                  Add Custom Club
                </IonButton>
              </IonItem>
              
              {showCustomInput && (
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Custom Club Name" 
                    labelPlacement="stacked"
                    placeholder="Enter club name"
                    value={customClubName}
                    onIonChange={e => setCustomClubName(e.detail.value!)}
                  />
                  <IonButton 
                    slot="end" 
                    fill="solid" 
                    size="small"
                    onClick={() => {
                      if (customClubName.trim()) {
                        handleClubSelect(customClubName.trim());
                        setCustomClubName('');
                        setShowCustomInput(false);
                      }
                    }}
                  >
                    Add
                  </IonButton>
                </IonItem>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubSelector;