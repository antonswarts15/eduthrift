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
import { locationOutline, schoolOutline } from 'ionicons/icons';
import LocationService, { School } from '../services/location';
import { userApi } from '../services/api';

interface SchoolSelectorProps {
  value: string;
  onSchoolChange: (schoolName: string) => void;
  placeholder?: string;
  userType?: 'buyer' | 'seller';
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ value, onSchoolChange, placeholder = "Select or enter school name", userType = 'seller' }) => {
  const [useNearbySchools, setUseNearbySchools] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customSchoolName, setCustomSchoolName] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{name: string, town: string, province: string}[]>([]);

  const [nearbySchools, setNearbySchools] = useState<School[]>([]);
  const [filteredNearbySchools, setFilteredNearbySchools] = useState<School[]>([]);
  const [nearbySearchTerm, setNearbySearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Load nearby schools only when toggle is turned on
  // useEffect removed - schools load only when user enables nearby toggle
  
  // Mock database organized by province and town
  const schoolDatabase = {
    'Gauteng': {
      'Johannesburg': ['Johannesburg High School', 'St. Mary\'s Catholic School', 'Greenwood Primary School'],
      'Pretoria': ['Pretoria Boys High', 'Pretoria Girls High', 'University of Pretoria Preparatory'],
      'Kempton Park': [
        'Kempton Park High School',
        'Birchleigh North Primary School', 
        'Norkem Park Primary School',
        'Kempton Park Primary School',
        'Edenglen High School',
        'Edenglen Primary School',
        'Bonaero Park Primary School',
        'Bonaero Park High School',
        'Spartan Primary School',
        'Spartan High School',
        'Terenure Primary School',
        'Terenure College',
        'Rhodesfield Primary School',
        'Rhodesfield Technical High School',
        'Isando Primary School',
        'Isando Secondary School',
        'Bartlett Primary School',
        'Bartlett High School',
        'Greenstone Primary School',
        'Greenstone Hill College',
        'Pomona Primary School',
        'Pomona High School',
        'Bredell Primary School',
        'Bredell High School',
        'Klopperpark Primary School',
        'Klopperpark High School',
        'Zuurfontein Primary School',
        'Zuurfontein Secondary School'
      ],
      'Sandton': ['Sandton High School', 'Crawford College Sandton', 'Redhill School']
    },
    'Western Cape': {
      'Cape Town': ['Cape Town Primary', 'Bishops Diocesan College', 'Herschel Girls School'],
      'Stellenbosch': ['Stellenbosch Primary', 'Paul Roos Gymnasium', 'Bloemhof Girls High'],
      'Paarl': ['Paarl Boys High', 'Paarl Girls High', 'La Rochelle Girls High']
    },
    'KwaZulu-Natal': {
      'Durban': ['Durban Secondary School', 'Durban High School', 'Westville Boys High'],
      'Pietermaritzburg': ['Pietermaritzburg School', 'Maritzburg College', 'Epworth School']
    },
    'North West': {
      'Rustenburg': ['Rustenburg College', 'Rustenburg High School', 'Hoërskool Rustenburg'],
      'Potchefstroom': ['Potchefstroom High', 'Gimnasium High School', 'Hoërskool Ferdinand Postma']
    },
    'Free State': {
      'Bloemfontein': ['Bloemfontein High School', 'Grey College', 'Eunice High School']
    },
    'Eastern Cape': {
      'Port Elizabeth': ['Port Elizabeth College', 'Grey High School', 'Collegiate Girls High'],
      'East London': ['East London Academy', 'Selborne College', 'Hudson Park High']
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setUseNearbySchools(checked);
    if (checked) {
      await loadNearbySchools();
    } else {
      onSchoolChange('');
      setSelectedProvince('');
      setSelectedTown('');
      setAvailableTowns([]);
      setAvailableSchools([]);
      setNearbySchools([]);
      setFilteredNearbySchools([]);
    }
  };

  const loadNearbySchools = async () => {
    try {
      setLoading(true);

      // Try to get location from user profile first
      try {
        setLocationStatus('Checking your profile address...');
        const profile = await userApi.getProfile();

        if (profile && profile.data.town && profile.data.province) {
          // Geocode the profile address to get coordinates
          setLocationStatus(`Searching schools near ${profile.data.town}, ${profile.data.province}...`);
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(profile.data.town + ', ' + profile.data.province + ', South Africa')}&limit=1`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData && geocodeData.length > 0) {
            const location = {
              lat: parseFloat(geocodeData[0].lat),
              lng: parseFloat(geocodeData[0].lon)
            };

            const schools = await LocationService.searchNearbySchools(location, 10);

            if (schools.length > 0) {
              setNearbySchools(schools);
              setLocationStatus(`Found ${schools.length} schools within 10km of your address`);
              return;
            }
          }
        }
      } catch (profileError) {
        console.log('Could not load profile address, using current location');
      }

      // Fall back to current location
      setLocationStatus('Using your current location...');
      const location = await LocationService.getCurrentLocation();
      setLocationStatus('Searching nearby schools...');

      const schools = await LocationService.searchNearbySchools(location, 10);
      
      // Also include schools from local database based on detected location
      const address = await LocationService.getAddressFromCoords(location.lat, location.lng);
      const localSchools = getLocalSchoolsFromAddress(address);
      
      // Combine and deduplicate schools
      const allSchools = [...schools, ...localSchools];
      const uniqueSchools = allSchools.filter((school, index, self) => 
        index === self.findIndex(s => s.name.toLowerCase() === school.name.toLowerCase())
      );

      if (uniqueSchools.length > 0) {
        setNearbySchools(uniqueSchools);
        setLocationStatus(`Found ${uniqueSchools.length} schools nearby`);
      } else {
        setLocationStatus('No schools found nearby. Try manual selection.');
        setUseNearbySchools(false);
      }
    } catch (error) {
      setLocationStatus('Unable to get location. Please select manually.');
      setUseNearbySchools(false);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedTown('');
    onSchoolChange('');
    setAvailableSchools([]);
    
    if (province && schoolDatabase[province as keyof typeof schoolDatabase]) {
      const towns = Object.keys(schoolDatabase[province as keyof typeof schoolDatabase]);
      setAvailableTowns(towns);
    } else {
      setAvailableTowns([]);
    }
  };
  
  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    onSchoolChange('');
    setSearchTerm('');
    
    if (selectedProvince && town && schoolDatabase[selectedProvince as keyof typeof schoolDatabase]) {
      const schools = schoolDatabase[selectedProvince as keyof typeof schoolDatabase][town as keyof typeof schoolDatabase[keyof typeof schoolDatabase]] || [];
      setAvailableSchools(schools);
      setFilteredSchools(schools);
    } else {
      setAvailableSchools([]);
      setFilteredSchools([]);
    }
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredSchools(availableSchools);
    } else {
      const filtered = availableSchools.filter(school => 
        school.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  };

  const handleNearbySearchChange = (term: string) => {
    setNearbySearchTerm(term);
    if (term.trim() === '') {
      setFilteredNearbySchools(nearbySchools);
    } else {
      const filtered = nearbySchools.filter(school => 
        school.name.toLowerCase().includes(term.toLowerCase()) ||
        school.address.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredNearbySchools(filtered);
    }
  };

 

  const handleSchoolSelect = (schoolName: string) => {
    onSchoolChange(schoolName);
  };

  const getLocalSchoolsFromAddress = (address: string): School[] => {
    const localSchools: School[] = [];
    
    // Extract town/city from address
    const addressLower = address.toLowerCase();
    
    Object.entries(schoolDatabase).forEach(([province, towns]) => {
      Object.entries(towns).forEach(([town, schools]) => {
        if (addressLower.includes(town.toLowerCase())) {
          schools.forEach((schoolName, index) => {
            localSchools.push({
              id: `local-${province}-${town}-${index}`,
              name: schoolName,
              address: `${town}, ${province}`,
              lat: 0, // Placeholder coordinates
              lng: 0,
              distance: 0
            });
          });
        }
      });
    });
    
    return localSchools;
  };

  const handleGlobalSearch = (term: string) => {
    setGlobalSearchTerm(term);
    if (term.trim() === '') {
      setGlobalSearchResults([]);
      return;
    }

    const results: {name: string, town: string, province: string}[] = [];
    Object.entries(schoolDatabase).forEach(([province, towns]) => {
      Object.entries(towns).forEach(([town, schools]) => {
        schools.forEach(school => {
          if (school.toLowerCase().includes(term.toLowerCase())) {
            results.push({ name: school, town, province });
          }
        });
      });
    });
    setGlobalSearchResults(results.slice(0, 10)); // Limit to 10 results
  };

  const handleGlobalSchoolSelect = (school: {name: string, town: string, province: string}) => {
    onSchoolChange(school.name);
    setGlobalSearchTerm('');
    setGlobalSearchResults([]);
  };

  return (
    <div>
      <IonItem style={{ marginBottom: '16px' }}>
        <IonInput 
          label="Type to search..." 
          labelPlacement="stacked"
          placeholder="Search for any school by name"
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
              {globalSearchResults.map((school, index) => (
                <IonItem 
                  key={`${school.province}-${school.town}-${school.name}-${index}`}
                  button 
                  onClick={() => handleGlobalSchoolSelect(school)}
                  style={{ 
                    backgroundColor: value === school.name ? '#e3f2fd' : 'transparent'
                  }}
                >
                  <IonIcon icon={schoolOutline} slot="start" />
                  <IonLabel>
                    <h3>{school.name}</h3>
                    <p>{school.town}, {school.province}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      )}
      
      <IonItem style={{ marginBottom: '16px' }}>
        <IonLabel>Use nearby schools</IonLabel>
        <IonToggle 
          checked={useNearbySchools} 
          onIonChange={e => handleToggleChange(e.detail.checked)}
        />
      </IonItem>

      {useNearbySchools ? (
        <div>
          {loading && (
            <IonItem>
              <IonSpinner name="crescent" />
              <IonLabel style={{ marginLeft: '12px' }}>Searching nearby schools...</IonLabel>
            </IonItem>
          )}
          
          {locationStatus && (
            <div style={{ 
              padding: '8px 16px', 
              fontSize: '12px', 
              color: nearbySchools.length > 0 ? '#28a745' : '#666',
              backgroundColor: nearbySchools.length > 0 ? '#f8f9fa' : 'transparent',
              borderRadius: '4px',
              margin: '8px 16px'
            }}>
              {locationStatus}
            </div>
          )}
          
          {nearbySchools.length > 0 && (
            <IonCard>
              <IonCardContent style={{ padding: '0' }}>
                <IonList>
                  {nearbySchools.map((school) => (
                    <IonItem 
                      key={school.id} 
                      button 
                      onClick={() => handleSchoolSelect(school.name)}
                      style={{ 
                        backgroundColor: value === school.name ? '#e3f2fd' : 'transparent'
                      }}
                    >
                      <IonIcon icon={schoolOutline} slot="start" />
                      <IonLabel>
                        <h3>{school.name}</h3>
                        <p>{school.address}</p>
                      </IonLabel>
                      {school.distance && school.distance > 0 && (
                        <IonBadge color="primary" slot="end">
                          {school.distance}km
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
              {Object.keys(schoolDatabase).map(province => (
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
          
          {selectedTown && availableSchools.length > 0 && (
            <div>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput 
                  label="Search Schools" 
                  labelPlacement="stacked"
                  placeholder="Type to search schools..."
                  value={searchTerm}
                  onIonChange={e => handleSearchChange(e.detail.value!)}
                />
              </IonItem>
              
              {filteredSchools.length > 0 && (
                <IonCard>
                  <IonCardContent style={{ padding: '0' }}>
                    <IonList>
                      {filteredSchools.map((school) => (
                        <IonItem 
                          key={school} 
                          button 
                          onClick={() => handleSchoolSelect(school)}
                          style={{ 
                            backgroundColor: value === school ? '#e3f2fd' : 'transparent'
                          }}
                        >
                          <IonIcon icon={schoolOutline} slot="start" />
                          <IonLabel>
                            <h3>{school}</h3>
                            <p>{selectedTown}, {selectedProvince}</p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              )}
              
              {filteredSchools.length === 0 && searchTerm && (
                <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
                  No schools found matching "{searchTerm}"
                </div>
              )}
              
              <IonItem style={{ marginTop: '16px' }}>
                <IonLabel>School not listed?</IonLabel>
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={() => setShowCustomInput(!showCustomInput)}
                >
                  Add Custom School
                </IonButton>
              </IonItem>
              
              {showCustomInput && (
                <IonItem style={{ marginBottom: '16px' }}>
                  <IonInput 
                    label="Custom School Name" 
                    labelPlacement="stacked"
                    placeholder="Enter school name"
                    value={customSchoolName}
                    onIonChange={e => setCustomSchoolName(e.detail.value!)}
                  />
                  <IonButton 
                    slot="end" 
                    fill="solid" 
                    size="small"
                    onClick={() => {
                      if (customSchoolName.trim()) {
                        handleSchoolSelect(customSchoolName.trim());
                        setCustomSchoolName('');
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

export default SchoolSelector;