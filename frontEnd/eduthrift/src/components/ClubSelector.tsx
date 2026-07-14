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
import { useAuthStore } from '../stores/authStore';
import { useAuthPromptStore } from '../stores/authPromptStore';
import { SA_PROVINCES } from '../utils/provinces';

interface ClubSelectorProps {
  value: string;
  onClubChange: (clubName: string) => void;
  placeholder?: string;
}

const ClubSelector: React.FC<ClubSelectorProps> = ({ value, onClubChange, placeholder = "Select or enter club name" }) => {
  const { isAuthenticated } = useAuthStore();
  const [useNearbyClubs, setUseNearbyClubs] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [availableTowns, setAvailableTowns] = useState<string[]>([]);
  const [availableClubs, setAvailableClubs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClubs, setFilteredClubs] = useState<string[]>([]);
  const [customClubName, setCustomClubName] = useState('');

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
      'Sandton': ['Sandton Country Club', 'Bryanston Country Club', 'Wanderers Golf Club', 'Sandton Tennis Club'],
      'Soweto': ['Soweto Rugby Club', 'Soweto Cricket Club', 'Soweto Golf Club', 'Soweto Tennis Club'],
      'Randburg': ['Randburg Rugby Club', 'Randburg Cricket Club', 'Randburg Golf Club', 'Randburg Tennis Club'],
      'Roodepoort': ['Roodepoort Rugby Club', 'Roodepoort Cricket Club', 'Roodepoort Golf Club', 'Roodepoort Tennis Club'],
      'Boksburg': ['Boksburg Rugby Club', 'Boksburg Cricket Club', 'Boksburg Golf Club', 'Boksburg Tennis Club'],
      'Benoni': ['Benoni Rugby Club', 'Benoni Cricket Club', 'Benoni Golf Club', 'Benoni Tennis Club'],
      'Springs': ['Springs Rugby Club', 'Springs Cricket Club', 'Springs Golf Club', 'Springs Tennis Club'],
      'Germiston': ['Germiston Rugby Club', 'Germiston Cricket Club', 'Germiston Golf Club', 'Germiston Tennis Club'],
      'Alberton': ['Alberton Rugby Club', 'Alberton Cricket Club', 'Alberton Golf Club', 'Alberton Tennis Club'],
      'Midrand': ['Midrand Rugby Club', 'Midrand Cricket Club', 'Midrand Golf Club', 'Midrand Tennis Club'],
      'Centurion': ['Centurion Rugby Club', 'Centurion Cricket Club', 'Centurion Golf Club', 'Centurion Tennis Club'],
      'Vanderbijlpark': ['Vanderbijlpark Rugby Club', 'Vanderbijlpark Cricket Club', 'Vanderbijlpark Golf Club', 'Vanderbijlpark Tennis Club'],
      'Vereeniging': ['Vereeniging Rugby Club', 'Vereeniging Cricket Club', 'Vereeniging Golf Club', 'Vereeniging Tennis Club'],
      'Krugersdorp': ['Krugersdorp Rugby Club', 'Krugersdorp Cricket Club', 'Krugersdorp Golf Club', 'Krugersdorp Tennis Club'],
      'Carletonville': ['Carletonville Rugby Club', 'Carletonville Cricket Club', 'Carletonville Golf Club', 'Carletonville Tennis Club'],
      'Randfontein': ['Randfontein Rugby Club', 'Randfontein Cricket Club', 'Randfontein Golf Club', 'Randfontein Tennis Club']
    },
    'Western Cape': {
      'Cape Town': ['Western Province Rugby Club', 'Newlands Cricket Club', 'Royal Cape Golf Club', 'Cape Town Tennis Club'],
      'Stellenbosch': ['Stellenbosch Rugby Club', 'Boland Cricket Club', 'Stellenbosch Golf Club', 'Maties Tennis Club'],
      'Paarl': ['Paarl Rugby Club', 'Boland Park Cricket Club', 'Pearl Valley Golf Club', 'Paarl Tennis Club'],
      'Bellville': ['Bellville Rugby Club', 'Bellville Cricket Club', 'Bellville Golf Club', 'Bellville Tennis Club'],
      'George': ['George Rugby Club', 'George Cricket Club', 'George Golf Club', 'George Tennis Club'],
      'Worcester': ['Worcester Rugby Club', 'Worcester Cricket Club', 'Worcester Golf Club', 'Worcester Tennis Club'],
      'Mossel Bay': ['Mossel Bay Rugby Club', 'Mossel Bay Cricket Club', 'Mossel Bay Golf Club', 'Mossel Bay Tennis Club'],
      'Oudtshoorn': ['Oudtshoorn Rugby Club', 'Oudtshoorn Cricket Club', 'Oudtshoorn Golf Club', 'Oudtshoorn Tennis Club'],
      'Knysna': ['Knysna Rugby Club', 'Knysna Cricket Club', 'Knysna Golf Club', 'Knysna Tennis Club'],
      'Hermanus': ['Hermanus Rugby Club', 'Hermanus Cricket Club', 'Hermanus Golf Club', 'Hermanus Tennis Club'],
      'Somerset West': ['Somerset West Rugby Club', 'Somerset West Cricket Club', 'Somerset West Golf Club', 'Somerset West Tennis Club'],
      'Wellington': ['Wellington Rugby Club', 'Wellington Cricket Club', 'Wellington Golf Club', 'Wellington Tennis Club'],
      'Vredenburg': ['Vredenburg Rugby Club', 'Vredenburg Cricket Club', 'Vredenburg Golf Club', 'Vredenburg Tennis Club'],
      'Malmesbury': ['Malmesbury Rugby Club', 'Malmesbury Cricket Club', 'Malmesbury Golf Club', 'Malmesbury Tennis Club'],
      'Robertson': ['Robertson Rugby Club', 'Robertson Cricket Club', 'Robertson Golf Club', 'Robertson Tennis Club'],
      'Swellendam': ['Swellendam Rugby Club', 'Swellendam Cricket Club', 'Swellendam Golf Club', 'Swellendam Tennis Club'],
      'Beaufort West': ['Beaufort West Rugby Club', 'Beaufort West Cricket Club', 'Beaufort West Golf Club', 'Beaufort West Tennis Club']
    },
    'KwaZulu-Natal': {
      'Durban': ['Sharks Rugby Club', 'Kingsmead Cricket Club', 'Durban Country Club', 'Durban Tennis Club'],
      'Pietermaritzburg': ['Natal Sharks Rugby Club', 'Alexandra Park Cricket Club', 'Pietermaritzburg Golf Club', 'PMB Tennis Club'],
      'Newcastle': ['Newcastle Rugby Club', 'Newcastle Cricket Club', 'Newcastle Golf Club', 'Newcastle Tennis Club'],
      'Richards Bay': ['Richards Bay Rugby Club', 'Richards Bay Cricket Club', 'Richards Bay Golf Club', 'Richards Bay Tennis Club'],
      'Ladysmith': ['Ladysmith Rugby Club', 'Ladysmith Cricket Club', 'Ladysmith Golf Club', 'Ladysmith Tennis Club'],
      'Empangeni': ['Empangeni Rugby Club', 'Empangeni Cricket Club', 'Empangeni Golf Club', 'Empangeni Tennis Club'],
      'Pinetown': ['Pinetown Rugby Club', 'Pinetown Cricket Club', 'Pinetown Golf Club', 'Pinetown Tennis Club'],
      'Umhlanga': ['Umhlanga Rugby Club', 'Umhlanga Cricket Club', 'Umhlanga Golf Club', 'Umhlanga Tennis Club'],
      'Margate': ['Margate Rugby Club', 'Margate Cricket Club', 'Margate Golf Club', 'Margate Tennis Club'],
      'Vryheid': ['Vryheid Rugby Club', 'Vryheid Cricket Club', 'Vryheid Golf Club', 'Vryheid Tennis Club'],
      'Estcourt': ['Estcourt Rugby Club', 'Estcourt Cricket Club', 'Estcourt Golf Club', 'Estcourt Tennis Club'],
      'Kokstad': ['Kokstad Rugby Club', 'Kokstad Cricket Club', 'Kokstad Golf Club', 'Kokstad Tennis Club'],
      'Port Shepstone': ['Port Shepstone Rugby Club', 'Port Shepstone Cricket Club', 'Port Shepstone Golf Club', 'Port Shepstone Tennis Club'],
      'Dundee': ['Dundee Rugby Club', 'Dundee Cricket Club', 'Dundee Golf Club', 'Dundee Tennis Club'],
      'Howick': ['Howick Rugby Club', 'Howick Cricket Club', 'Howick Golf Club', 'Howick Tennis Club'],
      'Ballito': ['Ballito Rugby Club', 'Ballito Cricket Club', 'Ballito Golf Club', 'Ballito Tennis Club']
    },
    'Eastern Cape': {
      'Port Elizabeth': ['Port Elizabeth Rugby Club', 'Port Elizabeth Cricket Club', 'Port Elizabeth Golf Club', 'Port Elizabeth Tennis Club'],
      'East London': ['East London Rugby Club', 'East London Cricket Club', 'East London Golf Club', 'East London Tennis Club'],
      'Mthatha': ['Mthatha Rugby Club', 'Mthatha Cricket Club', 'Mthatha Golf Club', 'Mthatha Tennis Club'],
      'Queenstown': ['Queenstown Rugby Club', 'Queenstown Cricket Club', 'Queenstown Golf Club', 'Queenstown Tennis Club'],
      'Makhanda': ['Makhanda Rugby Club', 'Makhanda Cricket Club', 'Makhanda Golf Club', 'Makhanda Tennis Club'],
      'King William\'s Town': ['King William\'s Town Rugby Club', 'King William\'s Town Cricket Club', 'King William\'s Town Golf Club', 'King William\'s Town Tennis Club'],
      'Uitenhage': ['Uitenhage Rugby Club', 'Uitenhage Cricket Club', 'Uitenhage Golf Club', 'Uitenhage Tennis Club'],
      'Graaff-Reinet': ['Graaff-Reinet Rugby Club', 'Graaff-Reinet Cricket Club', 'Graaff-Reinet Golf Club', 'Graaff-Reinet Tennis Club'],
      'Butterworth': ['Butterworth Rugby Club', 'Butterworth Cricket Club', 'Butterworth Golf Club', 'Butterworth Tennis Club'],
      'Aliwal North': ['Aliwal North Rugby Club', 'Aliwal North Cricket Club', 'Aliwal North Golf Club', 'Aliwal North Tennis Club'],
      'Cradock': ['Cradock Rugby Club', 'Cradock Cricket Club', 'Cradock Golf Club', 'Cradock Tennis Club'],
      'Humansdorp': ['Humansdorp Rugby Club', 'Humansdorp Cricket Club', 'Humansdorp Golf Club', 'Humansdorp Tennis Club'],
      'Jeffreys Bay': ['Jeffreys Bay Rugby Club', 'Jeffreys Bay Cricket Club', 'Jeffreys Bay Golf Club', 'Jeffreys Bay Tennis Club']
    },
    'Free State': {
      'Bloemfontein': ['Bloemfontein Rugby Club', 'Bloemfontein Cricket Club', 'Bloemfontein Golf Club', 'Bloemfontein Tennis Club'],
      'Welkom': ['Welkom Rugby Club', 'Welkom Cricket Club', 'Welkom Golf Club', 'Welkom Tennis Club'],
      'Bethlehem': ['Bethlehem Rugby Club', 'Bethlehem Cricket Club', 'Bethlehem Golf Club', 'Bethlehem Tennis Club'],
      'Kroonstad': ['Kroonstad Rugby Club', 'Kroonstad Cricket Club', 'Kroonstad Golf Club', 'Kroonstad Tennis Club'],
      'Sasolburg': ['Sasolburg Rugby Club', 'Sasolburg Cricket Club', 'Sasolburg Golf Club', 'Sasolburg Tennis Club'],
      'Parys': ['Parys Rugby Club', 'Parys Cricket Club', 'Parys Golf Club', 'Parys Tennis Club'],
      'Harrismith': ['Harrismith Rugby Club', 'Harrismith Cricket Club', 'Harrismith Golf Club', 'Harrismith Tennis Club'],
      'Virginia': ['Virginia Rugby Club', 'Virginia Cricket Club', 'Virginia Golf Club', 'Virginia Tennis Club'],
      'Bothaville': ['Bothaville Rugby Club', 'Bothaville Cricket Club', 'Bothaville Golf Club', 'Bothaville Tennis Club'],
      'Ficksburg': ['Ficksburg Rugby Club', 'Ficksburg Cricket Club', 'Ficksburg Golf Club', 'Ficksburg Tennis Club'],
      'Phuthaditjhaba': ['Phuthaditjhaba Rugby Club', 'Phuthaditjhaba Cricket Club', 'Phuthaditjhaba Golf Club', 'Phuthaditjhaba Tennis Club']
    },
    'Limpopo': {
      'Polokwane': ['Polokwane Rugby Club', 'Polokwane Cricket Club', 'Polokwane Golf Club', 'Polokwane Tennis Club'],
      'Tzaneen': ['Tzaneen Rugby Club', 'Tzaneen Cricket Club', 'Tzaneen Golf Club', 'Tzaneen Tennis Club'],
      'Mokopane': ['Mokopane Rugby Club', 'Mokopane Cricket Club', 'Mokopane Golf Club', 'Mokopane Tennis Club'],
      'Thohoyandou': ['Thohoyandou Rugby Club', 'Thohoyandou Cricket Club', 'Thohoyandou Golf Club', 'Thohoyandou Tennis Club'],
      'Musina': ['Musina Rugby Club', 'Musina Cricket Club', 'Musina Golf Club', 'Musina Tennis Club'],
      'Bela-Bela': ['Bela-Bela Rugby Club', 'Bela-Bela Cricket Club', 'Bela-Bela Golf Club', 'Bela-Bela Tennis Club'],
      'Phalaborwa': ['Phalaborwa Rugby Club', 'Phalaborwa Cricket Club', 'Phalaborwa Golf Club', 'Phalaborwa Tennis Club'],
      'Makhado': ['Makhado Rugby Club', 'Makhado Cricket Club', 'Makhado Golf Club', 'Makhado Tennis Club'],
      'Modimolle': ['Modimolle Rugby Club', 'Modimolle Cricket Club', 'Modimolle Golf Club', 'Modimolle Tennis Club'],
      'Lephalale': ['Lephalale Rugby Club', 'Lephalale Cricket Club', 'Lephalale Golf Club', 'Lephalale Tennis Club'],
      'Giyani': ['Giyani Rugby Club', 'Giyani Cricket Club', 'Giyani Golf Club', 'Giyani Tennis Club']
    },
    'Mpumalanga': {
      'Mbombela': ['Mbombela Rugby Club', 'Mbombela Cricket Club', 'Mbombela Golf Club', 'Mbombela Tennis Club'],
      'eMalahleni': ['eMalahleni Rugby Club', 'eMalahleni Cricket Club', 'eMalahleni Golf Club', 'eMalahleni Tennis Club'],
      'Middelburg': ['Middelburg Rugby Club', 'Middelburg Cricket Club', 'Middelburg Golf Club', 'Middelburg Tennis Club'],
      'Secunda': ['Secunda Rugby Club', 'Secunda Cricket Club', 'Secunda Golf Club', 'Secunda Tennis Club'],
      'Standerton': ['Standerton Rugby Club', 'Standerton Cricket Club', 'Standerton Golf Club', 'Standerton Tennis Club'],
      'Ermelo': ['Ermelo Rugby Club', 'Ermelo Cricket Club', 'Ermelo Golf Club', 'Ermelo Tennis Club'],
      'Barberton': ['Barberton Rugby Club', 'Barberton Cricket Club', 'Barberton Golf Club', 'Barberton Tennis Club'],
      'White River': ['White River Rugby Club', 'White River Cricket Club', 'White River Golf Club', 'White River Tennis Club'],
      'Sabie': ['Sabie Rugby Club', 'Sabie Cricket Club', 'Sabie Golf Club', 'Sabie Tennis Club'],
      'Piet Retief': ['Piet Retief Rugby Club', 'Piet Retief Cricket Club', 'Piet Retief Golf Club', 'Piet Retief Tennis Club']
    },
    'North West': {
      'Rustenburg': ['Rustenburg Rugby Club', 'Rustenburg Cricket Club', 'Rustenburg Golf Club', 'Rustenburg Tennis Club'],
      'Potchefstroom': ['Potchefstroom Rugby Club', 'Potchefstroom Cricket Club', 'Potchefstroom Golf Club', 'Potchefstroom Tennis Club'],
      'Mahikeng': ['Mahikeng Rugby Club', 'Mahikeng Cricket Club', 'Mahikeng Golf Club', 'Mahikeng Tennis Club'],
      'Klerksdorp': ['Klerksdorp Rugby Club', 'Klerksdorp Cricket Club', 'Klerksdorp Golf Club', 'Klerksdorp Tennis Club'],
      'Brits': ['Brits Rugby Club', 'Brits Cricket Club', 'Brits Golf Club', 'Brits Tennis Club'],
      'Vryburg': ['Vryburg Rugby Club', 'Vryburg Cricket Club', 'Vryburg Golf Club', 'Vryburg Tennis Club'],
      'Lichtenburg': ['Lichtenburg Rugby Club', 'Lichtenburg Cricket Club', 'Lichtenburg Golf Club', 'Lichtenburg Tennis Club'],
      'Zeerust': ['Zeerust Rugby Club', 'Zeerust Cricket Club', 'Zeerust Golf Club', 'Zeerust Tennis Club'],
      'Ventersdorp': ['Ventersdorp Rugby Club', 'Ventersdorp Cricket Club', 'Ventersdorp Golf Club', 'Ventersdorp Tennis Club'],
      'Koster': ['Koster Rugby Club', 'Koster Cricket Club', 'Koster Golf Club', 'Koster Tennis Club'],
      'Wolmaransstad': ['Wolmaransstad Rugby Club', 'Wolmaransstad Cricket Club', 'Wolmaransstad Golf Club', 'Wolmaransstad Tennis Club']
    },
    'Northern Cape': {
      'Kimberley': ['Kimberley Rugby Club', 'Kimberley Cricket Club', 'Kimberley Golf Club', 'Kimberley Tennis Club'],
      'Upington': ['Upington Rugby Club', 'Upington Cricket Club', 'Upington Golf Club', 'Upington Tennis Club'],
      'Springbok': ['Springbok Rugby Club', 'Springbok Cricket Club', 'Springbok Golf Club', 'Springbok Tennis Club'],
      'Kuruman': ['Kuruman Rugby Club', 'Kuruman Cricket Club', 'Kuruman Golf Club', 'Kuruman Tennis Club'],
      'De Aar': ['De Aar Rugby Club', 'De Aar Cricket Club', 'De Aar Golf Club', 'De Aar Tennis Club'],
      'Colesberg': ['Colesberg Rugby Club', 'Colesberg Cricket Club', 'Colesberg Golf Club', 'Colesberg Tennis Club'],
      'Postmasburg': ['Postmasburg Rugby Club', 'Postmasburg Cricket Club', 'Postmasburg Golf Club', 'Postmasburg Tennis Club'],
      'Kathu': ['Kathu Rugby Club', 'Kathu Cricket Club', 'Kathu Golf Club', 'Kathu Tennis Club'],
      'Prieska': ['Prieska Rugby Club', 'Prieska Cricket Club', 'Prieska Golf Club', 'Prieska Tennis Club']
    }
  };

  // Load nearby clubs only when toggle is turned on
  // useEffect removed - clubs load only when user enables nearby toggle

  const handleToggleChange = async (checked: boolean) => {
    if (checked && !isAuthenticated) {
      useAuthPromptStore.getState().showPrompt('use nearby clubs');
      return;
    }
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
                No listed towns for {selectedProvince} yet — enter your club name below.
              </div>
              <IonItem style={{ marginBottom: '16px' }}>
                <IonInput
                  label="Club Name"
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
                    }
                  }}
                >
                  Add
                </IonButton>
              </IonItem>
            </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClubSelector;