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
import { useAuthStore } from '../stores/authStore';
import { useAuthPromptStore } from '../stores/authPromptStore';
import { SA_PROVINCES } from '../utils/provinces';
import schoolIcon from '../assets/school.png';

interface SchoolSelectorProps {
  value: string;
  onSchoolChange: (schoolName: string) => void;
  placeholder?: string;
  userType?: 'buyer' | 'seller';
}

const SchoolSelector: React.FC<SchoolSelectorProps> = ({ value, onSchoolChange, placeholder = "Select or enter school name", userType = 'seller' }) => {
  const { isAuthenticated } = useAuthStore();
  const [useNearbySchools, setUseNearbySchools] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableSchools, setAvailableSchools] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<string[]>([]);
  const [customSchoolName, setCustomSchoolName] = useState('');

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
      'Kempton Park': ['Kempton Park High School', 'Birchleigh North Primary School', 'Norkem Park Primary School', 'Kempton Park Primary School', 'Edenglen High School', 'Edenglen Primary School', 'Bonaero Park Primary School', 'Bonaero Park High School', 'Spartan Primary School', 'Spartan High School', 'Terenure Primary School', 'Terenure College', 'Rhodesfield Primary School', 'Rhodesfield Technical High School', 'Isando Primary School', 'Isando Secondary School', 'Bartlett Primary School', 'Bartlett High School', 'Greenstone Primary School', 'Greenstone Hill College', 'Pomona Primary School', 'Pomona High School', 'Bredell Primary School', 'Bredell High School', 'Klopperpark Primary School', 'Klopperpark High School', 'Zuurfontein Primary School', 'Zuurfontein Secondary School'],
      'Sandton': ['Sandton High School', 'Crawford College Sandton', 'Redhill School'],
      'Soweto': ['Soweto Primary School', 'Soweto High School', 'Soweto Secondary School'],
      'Randburg': ['Randburg Primary School', 'Randburg High School', 'Randburg Secondary School'],
      'Roodepoort': ['Roodepoort Primary School', 'Roodepoort High School', 'Roodepoort Secondary School'],
      'Boksburg': ['Boksburg Primary School', 'Boksburg High School', 'Boksburg Secondary School'],
      'Benoni': ['Benoni Primary School', 'Benoni High School', 'Benoni Secondary School'],
      'Springs': ['Springs Primary School', 'Springs High School', 'Springs Secondary School'],
      'Germiston': ['Germiston Primary School', 'Germiston High School', 'Germiston Secondary School'],
      'Alberton': ['Alberton Primary School', 'Alberton High School', 'Alberton Secondary School'],
      'Midrand': ['Midrand Primary School', 'Midrand High School', 'Midrand Secondary School'],
      'Centurion': ['Centurion Primary School', 'Centurion High School', 'Centurion Secondary School'],
      'Vanderbijlpark': ['Vanderbijlpark Primary School', 'Vanderbijlpark High School', 'Vanderbijlpark Secondary School'],
      'Vereeniging': ['Vereeniging Primary School', 'Vereeniging High School', 'Vereeniging Secondary School'],
      'Krugersdorp': ['Krugersdorp Primary School', 'Krugersdorp High School', 'Krugersdorp Secondary School'],
      'Carletonville': ['Carletonville Primary School', 'Carletonville High School', 'Carletonville Secondary School'],
      'Randfontein': ['Randfontein Primary School', 'Randfontein High School', 'Randfontein Secondary School']
    },
    'Western Cape': {
      'Cape Town': ['Cape Town Primary', 'Bishops Diocesan College', 'Herschel Girls School'],
      'Stellenbosch': ['Stellenbosch Primary', 'Paul Roos Gymnasium', 'Bloemhof Girls High'],
      'Paarl': ['Paarl Boys High', 'Paarl Girls High', 'La Rochelle Girls High'],
      'Bellville': ['Bellville Primary School', 'Bellville High School', 'Bellville Secondary School'],
      'George': ['George Primary School', 'George High School', 'George Secondary School'],
      'Worcester': ['Worcester Primary School', 'Worcester High School', 'Worcester Secondary School'],
      'Mossel Bay': ['Mossel Bay Primary School', 'Mossel Bay High School', 'Mossel Bay Secondary School'],
      'Oudtshoorn': ['Oudtshoorn Primary School', 'Oudtshoorn High School', 'Oudtshoorn Secondary School'],
      'Knysna': ['Knysna Primary School', 'Knysna High School', 'Knysna Secondary School'],
      'Hermanus': ['Hermanus Primary School', 'Hermanus High School', 'Hermanus Secondary School'],
      'Somerset West': ['Somerset West Primary School', 'Somerset West High School', 'Somerset West Secondary School'],
      'Wellington': ['Wellington Primary School', 'Wellington High School', 'Wellington Secondary School'],
      'Vredenburg': ['Vredenburg Primary School', 'Vredenburg High School', 'Vredenburg Secondary School'],
      'Malmesbury': ['Malmesbury Primary School', 'Malmesbury High School', 'Malmesbury Secondary School'],
      'Robertson': ['Robertson Primary School', 'Robertson High School', 'Robertson Secondary School'],
      'Swellendam': ['Swellendam Primary School', 'Swellendam High School', 'Swellendam Secondary School'],
      'Beaufort West': ['Beaufort West Primary School', 'Beaufort West High School', 'Beaufort West Secondary School']
    },
    'KwaZulu-Natal': {
      'Durban': ['Durban Secondary School', 'Durban High School', 'Westville Boys High'],
      'Pietermaritzburg': ['Pietermaritzburg School', 'Maritzburg College', 'Epworth School'],
      'Newcastle': ['Newcastle Primary School', 'Newcastle High School', 'Newcastle Secondary School'],
      'Richards Bay': ['Richards Bay Primary School', 'Richards Bay High School', 'Richards Bay Secondary School'],
      'Ladysmith': ['Ladysmith Primary School', 'Ladysmith High School', 'Ladysmith Secondary School'],
      'Empangeni': ['Empangeni Primary School', 'Empangeni High School', 'Empangeni Secondary School'],
      'Pinetown': ['Pinetown Primary School', 'Pinetown High School', 'Pinetown Secondary School'],
      'Umhlanga': ['Umhlanga Primary School', 'Umhlanga High School', 'Umhlanga Secondary School'],
      'Margate': ['Margate Primary School', 'Margate High School', 'Margate Secondary School'],
      'Vryheid': ['Vryheid Primary School', 'Vryheid High School', 'Vryheid Secondary School'],
      'Estcourt': ['Estcourt Primary School', 'Estcourt High School', 'Estcourt Secondary School'],
      'Kokstad': ['Kokstad Primary School', 'Kokstad High School', 'Kokstad Secondary School'],
      'Port Shepstone': ['Port Shepstone Primary School', 'Port Shepstone High School', 'Port Shepstone Secondary School'],
      'Dundee': ['Dundee Primary School', 'Dundee High School', 'Dundee Secondary School'],
      'Howick': ['Howick Primary School', 'Howick High School', 'Howick Secondary School'],
      'Ballito': ['Ballito Primary School', 'Ballito High School', 'Ballito Secondary School']
    },
    'Eastern Cape': {
      'Port Elizabeth': ['Port Elizabeth College', 'Grey High School', 'Collegiate Girls High'],
      'East London': ['East London Academy', 'Selborne College', 'Hudson Park High'],
      'Mthatha': ['Mthatha Primary School', 'Mthatha High School', 'Mthatha Secondary School'],
      'Queenstown': ['Queenstown Primary School', 'Queenstown High School', 'Queenstown Secondary School'],
      'Makhanda': ['Makhanda Primary School', 'Makhanda High School', 'Makhanda Secondary School'],
      'King William\'s Town': ['King William\'s Town Primary School', 'King William\'s Town High School', 'King William\'s Town Secondary School'],
      'Uitenhage': ['Uitenhage Primary School', 'Uitenhage High School', 'Uitenhage Secondary School'],
      'Graaff-Reinet': ['Graaff-Reinet Primary School', 'Graaff-Reinet High School', 'Graaff-Reinet Secondary School'],
      'Butterworth': ['Butterworth Primary School', 'Butterworth High School', 'Butterworth Secondary School'],
      'Aliwal North': ['Aliwal North Primary School', 'Aliwal North High School', 'Aliwal North Secondary School'],
      'Cradock': ['Cradock Primary School', 'Cradock High School', 'Cradock Secondary School'],
      'Humansdorp': ['Humansdorp Primary School', 'Humansdorp High School', 'Humansdorp Secondary School'],
      'Jeffreys Bay': ['Jeffreys Bay Primary School', 'Jeffreys Bay High School', 'Jeffreys Bay Secondary School']
    },
    'Free State': {
      'Bloemfontein': ['Bloemfontein High School', 'Grey College', 'Eunice High School'],
      'Welkom': ['Welkom Primary School', 'Welkom High School', 'Welkom Secondary School'],
      'Bethlehem': ['Bethlehem Primary School', 'Bethlehem High School', 'Bethlehem Secondary School'],
      'Kroonstad': ['Kroonstad Primary School', 'Kroonstad High School', 'Kroonstad Secondary School'],
      'Sasolburg': ['Sasolburg Primary School', 'Sasolburg High School', 'Sasolburg Secondary School'],
      'Parys': ['Parys Primary School', 'Parys High School', 'Parys Secondary School'],
      'Harrismith': ['Harrismith Primary School', 'Harrismith High School', 'Harrismith Secondary School'],
      'Virginia': ['Virginia Primary School', 'Virginia High School', 'Virginia Secondary School'],
      'Bothaville': ['Bothaville Primary School', 'Bothaville High School', 'Bothaville Secondary School'],
      'Ficksburg': ['Ficksburg Primary School', 'Ficksburg High School', 'Ficksburg Secondary School'],
      'Phuthaditjhaba': ['Phuthaditjhaba Primary School', 'Phuthaditjhaba High School', 'Phuthaditjhaba Secondary School']
    },
    'Limpopo': {
      'Polokwane': ['Polokwane Primary School', 'Polokwane High School', 'Polokwane Secondary School'],
      'Tzaneen': ['Tzaneen Primary School', 'Tzaneen High School', 'Tzaneen Secondary School'],
      'Mokopane': ['Mokopane Primary School', 'Mokopane High School', 'Mokopane Secondary School'],
      'Thohoyandou': ['Thohoyandou Primary School', 'Thohoyandou High School', 'Thohoyandou Secondary School'],
      'Musina': ['Musina Primary School', 'Musina High School', 'Musina Secondary School'],
      'Bela-Bela': ['Bela-Bela Primary School', 'Bela-Bela High School', 'Bela-Bela Secondary School'],
      'Phalaborwa': ['Phalaborwa Primary School', 'Phalaborwa High School', 'Phalaborwa Secondary School'],
      'Makhado': ['Makhado Primary School', 'Makhado High School', 'Makhado Secondary School'],
      'Modimolle': ['Modimolle Primary School', 'Modimolle High School', 'Modimolle Secondary School'],
      'Lephalale': ['Lephalale Primary School', 'Lephalale High School', 'Lephalale Secondary School'],
      'Giyani': ['Giyani Primary School', 'Giyani High School', 'Giyani Secondary School']
    },
    'Mpumalanga': {
      'Mbombela': ['Mbombela Primary School', 'Mbombela High School', 'Mbombela Secondary School'],
      'eMalahleni': ['eMalahleni Primary School', 'eMalahleni High School', 'eMalahleni Secondary School'],
      'Middelburg': ['Middelburg Primary School', 'Middelburg High School', 'Middelburg Secondary School'],
      'Secunda': ['Secunda Primary School', 'Secunda High School', 'Secunda Secondary School'],
      'Standerton': ['Standerton Primary School', 'Standerton High School', 'Standerton Secondary School'],
      'Ermelo': ['Ermelo Primary School', 'Ermelo High School', 'Ermelo Secondary School'],
      'Barberton': ['Barberton Primary School', 'Barberton High School', 'Barberton Secondary School'],
      'White River': ['White River Primary School', 'White River High School', 'White River Secondary School'],
      'Sabie': ['Sabie Primary School', 'Sabie High School', 'Sabie Secondary School'],
      'Piet Retief': ['Piet Retief Primary School', 'Piet Retief High School', 'Piet Retief Secondary School']
    },
    'North West': {
      'Rustenburg': ['Rustenburg College', 'Rustenburg High School', 'Hoërskool Rustenburg'],
      'Potchefstroom': ['Potchefstroom High', 'Gimnasium High School', 'Hoërskool Ferdinand Postma'],
      'Mahikeng': ['Mahikeng Primary School', 'Mahikeng High School', 'Mahikeng Secondary School'],
      'Klerksdorp': ['Klerksdorp Primary School', 'Klerksdorp High School', 'Klerksdorp Secondary School'],
      'Brits': ['Brits Primary School', 'Brits High School', 'Brits Secondary School'],
      'Vryburg': ['Vryburg Primary School', 'Vryburg High School', 'Vryburg Secondary School'],
      'Lichtenburg': ['Lichtenburg Primary School', 'Lichtenburg High School', 'Lichtenburg Secondary School'],
      'Zeerust': ['Zeerust Primary School', 'Zeerust High School', 'Zeerust Secondary School'],
      'Ventersdorp': ['Ventersdorp Primary School', 'Ventersdorp High School', 'Ventersdorp Secondary School'],
      'Koster': ['Koster Primary School', 'Koster High School', 'Koster Secondary School'],
      'Wolmaransstad': ['Wolmaransstad Primary School', 'Wolmaransstad High School', 'Wolmaransstad Secondary School']
    },
    'Northern Cape': {
      'Kimberley': ['Kimberley Primary School', 'Kimberley High School', 'Kimberley Secondary School'],
      'Upington': ['Upington Primary School', 'Upington High School', 'Upington Secondary School'],
      'Springbok': ['Springbok Primary School', 'Springbok High School', 'Springbok Secondary School'],
      'Kuruman': ['Kuruman Primary School', 'Kuruman High School', 'Kuruman Secondary School'],
      'De Aar': ['De Aar Primary School', 'De Aar High School', 'De Aar Secondary School'],
      'Colesberg': ['Colesberg Primary School', 'Colesberg High School', 'Colesberg Secondary School'],
      'Postmasburg': ['Postmasburg Primary School', 'Postmasburg High School', 'Postmasburg Secondary School'],
      'Kathu': ['Kathu Primary School', 'Kathu High School', 'Kathu Secondary School'],
      'Prieska': ['Prieska Primary School', 'Prieska High School', 'Prieska Secondary School']
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    if (checked && !isAuthenticated) {
      useAuthPromptStore.getState().showPrompt('use nearby schools');
      return;
    }
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
      setLocationStatus('Using your current location...');
      const location = await LocationService.getCurrentLocation();
      setLocationStatus('Searching nearby schools...');

      const schools = await LocationService.searchNearbySchools(location, 10);
      const address = await LocationService.getAddressFromCoords(location.lat, location.lng);
      const localSchools = getLocalSchoolsFromAddress(address);

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

  return (
    <div>

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
                      <img src={schoolIcon} alt="school" slot="start" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
              {SA_PROVINCES.map(province => (
                <IonSelectOption key={province} value={province}>{province}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {selectedProvince && availableTowns.length > 0 && (
            <IonItem style={{ marginBottom: '16px' }}>
              <IonLabel position="stacked">Town/City</IonLabel>
              <IonSelect value={selectedTown} onIonChange={e => handleTownChange(e.detail.value)} placeholder="Select Town">
                {availableTowns.map(town => (
                  <IonSelectOption key={town} value={town}>{town}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          )}

          {selectedProvince && availableTowns.length === 0 && (
            <div>
              <div style={{ padding: '0 16px 8px', fontSize: '12px', color: '#666' }}>
                No listed towns for {selectedProvince} yet — enter your school name below.
              </div>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput
                  label="School Name"
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
                    }
                  }}
                >
                  Add
                </IonButton>
              </IonItem>
            </div>
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
                      <img src={schoolIcon} alt="school" slot="start" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolSelector;