// Script to update all sport equipment components with standardized features
// Run this with: node updateAllComponents.js

const fs = require('fs');
const path = require('path');

const sportConfigs = {
  'Football': {
    categories: {
      'Equipment': { items: ['Football', 'Goal posts', 'Training cones', 'Bibs'], icon: 'constructOutline', color: '#E74C3C' },
      'Clothing': { items: ['Football jersey', 'Football shorts', 'Football socks', 'Training shirt'], icon: 'shirtOutline', color: '#3498DB' },
      'Protective Gear': { items: ['Shin guards', 'Goalkeeper gloves', 'Mouthguard'], icon: 'shieldOutline', color: '#27AE60' },
      'Footwear': { items: ['Football boots', 'Training shoes'], icon: 'footstepsOutline', color: '#8E44AD' },
      'Accessories': { items: ['Water bottle', 'Kit bag', 'Captain armband'], icon: 'bagOutline', color: '#F39C12' }
    },
    mockItems: [
      { id: 1, item: 'Football jersey', size: 'L', team: '1st Team', condition: 2, price: 110 },
      { id: 2, item: 'Football boots', size: 'UK 9', team: 'General', condition: 1, price: 190 },
      { id: 3, item: 'Shin guards', size: 'M', team: 'General', condition: 3, price: 45 }
    ]
  },
  'Athletics': {
    categories: {
      'Equipment': { items: ['Javelin', 'Shot put', 'Discus', 'Starting blocks'], icon: 'constructOutline', color: '#E74C3C' },
      'Clothing': { items: ['Running vest', 'Running shorts', 'Track suit'], icon: 'shirtOutline', color: '#3498DB' },
      'Footwear': { items: ['Spikes', 'Running shoes', 'Field event shoes'], icon: 'footstepsOutline', color: '#8E44AD' },
      'Accessories': { items: ['Water bottle', 'Kit bag', 'Stopwatch'], icon: 'bagOutline', color: '#F39C12' }
    },
    mockItems: [
      { id: 1, item: 'Running vest', size: 'M', team: '1st Team', condition: 2, price: 85 },
      { id: 2, item: 'Spikes', size: 'UK 8', team: 'General', condition: 1, price: 220 },
      { id: 3, item: 'Shot put', size: '4kg', team: 'General', condition: 3, price: 150 }
    ]
  },
  'Basketball': {
    categories: {
      'Equipment': { items: ['Basketball', 'Basketball hoop', 'Training cones'], icon: 'constructOutline', color: '#E74C3C' },
      'Clothing': { items: ['Basketball jersey', 'Basketball shorts', 'Compression shirt'], icon: 'shirtOutline', color: '#3498DB' },
      'Footwear': { items: ['Basketball shoes', 'Training shoes'], icon: 'footstepsOutline', color: '#8E44AD' },
      'Accessories': { items: ['Water bottle', 'Kit bag', 'Sweatbands'], icon: 'bagOutline', color: '#F39C12' }
    },
    mockItems: [
      { id: 1, item: 'Basketball jersey', size: 'L', team: '1st Team', condition: 2, price: 95 },
      { id: 2, item: 'Basketball shoes', size: 'UK 10', team: 'General', condition: 1, price: 180 },
      { id: 3, item: 'Basketball', size: 'Size 7', team: 'General', condition: 3, price: 65 }
    ]
  },
  'Cricket': {
    categories: {
      'Equipment': { items: ['Cricket bat', 'Cricket ball', 'Wickets', 'Stumps'], icon: 'constructOutline', color: '#E74C3C' },
      'Clothing': { items: ['Cricket whites', 'Cricket shirt', 'Cricket trousers'], icon: 'shirtOutline', color: '#3498DB' },
      'Protective Gear': { items: ['Batting pads', 'Batting gloves', 'Helmet', 'Box'], icon: 'shieldOutline', color: '#27AE60' },
      'Footwear': { items: ['Cricket spikes', 'Training shoes'], icon: 'footstepsOutline', color: '#8E44AD' },
      'Accessories': { items: ['Kit bag', 'Water bottle', 'Grip tape'], icon: 'bagOutline', color: '#F39C12' }
    },
    mockItems: [
      { id: 1, item: 'Cricket bat', size: 'SH', team: '1st Team', condition: 2, price: 280 },
      { id: 2, item: 'Cricket whites', size: 'M', team: '2nd Team', condition: 1, price: 120 },
      { id: 3, item: 'Batting pads', size: 'Youth', team: 'General', condition: 3, price: 95 }
    ]
  }
};

const generateComponentCode = (sportName, config) => {
  const componentName = `${sportName}EquipmentComponent`;
  const categoriesCode = Object.entries(config.categories).map(([name, data]) => 
    `    '${name}': {\n      items: ${JSON.stringify(data.items)},\n      icon: ${data.icon},\n      color: '${data.color}'\n    }`
  ).join(',\n');
  
  const mockItemsCode = config.mockItems.map(item => 
    `        {\n          id: ${item.id}, item: '${item.item}', size: '${item.size}', team: '${item.team}', condition: ${item.condition}, price: ${item.price},\n          frontPhoto: 'https://via.placeholder.com/120x150/3498DB/white?text=${item.item.replace(/ /g, '+')}+Front',\n          backPhoto: 'https://via.placeholder.com/120x150/3498DB/white?text=${item.item.replace(/ /g, '+')}+Back'\n        }`
  ).join(',\n');

  return `import React, { useState } from 'react';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/react';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
import SchoolSelector from '../SchoolSelector';

interface ${componentName}Props {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userType, onItemSelect, categoryFilter = 'all', schoolName: propSchoolName }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [organizationType, setOrganizationType] = useState<'school' | 'club' | ''>(propSchoolName ? 'school' : '');
  const [schoolName, setSchoolName] = useState(propSchoolName || '');
  const [clubName, setClubName] = useState('');
  const [size, setSize] = useState('');
  const [team, setTeam] = useState('');
  const [showItemView, setShowItemView] = useState(false);
  const [selectedAvailableItem, setSelectedAvailableItem] = useState<any>(null);
  const [sizeFilter, setSizeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const getAllAvailableItems = () => {
    if (userType === 'buyer' && (schoolName || clubName)) {
      return [
${mockItemsCode}
      ];
    }
    return [];
  };

  const getFilteredItems = () => {
    let items = getAllAvailableItems();
    
    if (sizeFilter) {
      items = items.filter(item => item.size.toLowerCase().includes(sizeFilter.toLowerCase()));
    }
    
    if (conditionFilter) {
      items = items.filter(item => item.condition === conditionFilter);
    }
    
    if (priceRange.min) {
      items = items.filter(item => item.price >= parseInt(priceRange.min));
    }
    
    if (priceRange.max) {
      items = items.filter(item => item.price <= parseInt(priceRange.max));
    }
    
    return items;
  };

  const getConditionText = (condition: number) => {
    const conditions = { 1: 'Brand new', 2: 'Like new', 3: 'Used but good', 4: 'Used and worn' };
    return conditions[condition as keyof typeof conditions] || 'Unknown';
  };

  const ${sportName.toLowerCase()}Categories = {
${categoriesCode}
  };

  const getFilteredCategories = () => {
    switch (categoryFilter) {
      case 'clothing':
        return { 'Clothing': ${sportName.toLowerCase()}Categories['Clothing'] };
      case 'footwear':
        return { 'Footwear': ${sportName.toLowerCase()}Categories['Footwear'] };
      case 'equipment-protective-accessories':
        return {
          'Equipment': ${sportName.toLowerCase()}Categories['Equipment'],
          ${config.categories['Protective Gear'] ? `'Protective Gear': ${sportName.toLowerCase()}Categories['Protective Gear'],` : ''}
          'Accessories': ${sportName.toLowerCase()}Categories['Accessories']
        };
      default:
        return ${sportName.toLowerCase()}Categories;
    }
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handleAvailableItemClick = (item: any) => {
    setSelectedAvailableItem(item);
    setShowItemView(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = () => {
    const itemData = {
      item: selectedItem,
      size,
      team,
      condition,
      price,
      frontPhoto,
      backPhoto,
      organizationType,
      schoolName: organizationType === 'school' ? schoolName : '',
      clubName: organizationType === 'club' ? clubName : ''
    };
    onItemSelect?.(itemData);
    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
    setTeam('');
  };

  if (showItemView && selectedAvailableItem) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemView(false)}>← Back</IonButton>
        
        {(schoolName || clubName) && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(52, 152, 219, 0.1)', 
            border: '2px solid #3498DB', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={schoolOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#3498DB', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#3498DB', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {organizationType === 'school' ? schoolName : clubName}
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              {organizationType === 'school' ? 'Selected School' : 'Selected Club'}
            </p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#666' 
          }}>
            {selectedAvailableItem.item}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div 
              onClick={() => setZoomedPhoto(selectedAvailableItem.frontPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                backgroundImage: \`url(\${selectedAvailableItem.frontPhoto})\`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid #ddd', cursor: 'pointer'
              }} 
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Front</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div 
              onClick={() => setZoomedPhoto(selectedAvailableItem.backPhoto)}
              style={{
                width: '150px', height: '200px', borderRadius: '8px',
                backgroundImage: \`url(\${selectedAvailableItem.backPhoto})\`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: '1px solid #ddd', cursor: 'pointer'
              }} 
            />
            <p style={{ fontSize: '12px', margin: '4px 0', fontWeight: 'bold' }}>Back</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
          <div style={{ marginBottom: '8px' }}><strong>Size:</strong> {selectedAvailableItem.size}</div>
          <div style={{ marginBottom: '8px' }}><strong>Team:</strong> {selectedAvailableItem.team}</div>
          <div style={{ marginBottom: '8px' }}><strong>Condition:</strong> {getConditionText(selectedAvailableItem.condition)}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#E74C3C' }}>R{selectedAvailableItem.price}</div>
        </div>

        <IonButton expand="full" onClick={() => onItemSelect?.(selectedAvailableItem)} style={{ marginTop: '16px' }}>
          Add to Cart
        </IonButton>
      </div>
    );
  }

  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>
        
        {schoolName && (
          <div style={{ 
            marginBottom: '20px', 
            textAlign: 'center', 
            backgroundColor: 'rgba(52, 152, 219, 0.1)', 
            border: '2px solid #3498DB', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <IonIcon 
              icon={schoolOutline} 
              style={{ 
                fontSize: '32px', 
                color: '#3498DB', 
                marginBottom: '8px' 
              }} 
            />
            <h2 style={{ 
              margin: '0', 
              color: '#3498DB', 
              fontSize: '18px', 
              fontWeight: 'bold' 
            }}>
              {schoolName}
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              color: '#666', 
              fontSize: '14px' 
            }}>
              Selected School
            </p>
          </div>
        )}
        
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#666' 
          }}>
            {selectedItem}
          </span>
        </div>
        
        <IonItem>
          <IonInput 
            label="Size" 
            labelPlacement="stacked" 
            value={size} 
            onIonChange={e => setSize(e.detail.value!)} 
            placeholder="Enter size (e.g., M, L, XL, UK 8, etc.)"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Team</IonLabel>
          <IonSelect value={team} onIonChange={e => setTeam(e.detail.value)} placeholder="Select Team">
            <IonSelectOption value="1st Team">1st Team</IonSelectOption>
            <IonSelectOption value="2nd Team">2nd Team</IonSelectOption>
            <IonSelectOption value="3rd Team">3rd Team</IonSelectOption>
            <IonSelectOption value="General">General</IonSelectOption>
          </IonSelect>
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Condition Grade</IonLabel>
          <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
            <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
            <IonSelectOption value={2}>2 - Like new</IonSelectOption>
            <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
            <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
          </IonSelect>
        </IonItem>

        {userType === 'seller' && (
          <>
            <IonItem>
              <IonInput label="Price (ZAR)" type="number" value={price} onIonChange={e => setPrice(e.detail.value!)} />
            </IonItem>
            
            <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div 
                  onClick={() => handlePhotoUpload('front')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: frontPhoto ? \`url(\${frontPhoto})\` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!frontPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div 
                  onClick={() => handlePhotoUpload('back')}
                  style={{
                    width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    backgroundImage: backPhoto ? \`url(\${backPhoto})\` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center'
                  }}
                >
                  {!backPhoto && <IonIcon icon={cameraOutline} size="large" />}
                </div>
                <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo</p>
              </div>
            </div>
          </>
        )}

        <IonButton expand="full" onClick={handleSubmit} style={{ marginTop: '16px' }}>
          {userType === 'seller' ? 'List Item' : 'Add to Cart'}
        </IonButton>
      </div>
    );
  }

  return (
    <div>
      {categoryFilter === 'all' && <h2>${sportName} Equipment</h2>}
      
      {propSchoolName && (
        <div style={{ 
          marginBottom: '20px', 
          textAlign: 'center', 
          backgroundColor: 'rgba(52, 152, 219, 0.1)', 
          border: '2px solid #3498DB', 
          borderRadius: '12px', 
          padding: '16px' 
        }}>
          <IonIcon 
            icon={schoolOutline} 
            style={{ 
              fontSize: '32px', 
              color: '#3498DB', 
              marginBottom: '8px' 
            }} 
          />
          <h2 style={{ 
            margin: '0', 
            color: '#3498DB', 
            fontSize: '18px', 
            fontWeight: 'bold' 
          }}>
            {propSchoolName}
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            color: '#666', 
            fontSize: '14px' 
          }}>
            Selected School
          </p>
        </div>
      )}
      
      {!propSchoolName && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#666', fontSize: '16px' }}>Select Organization Type</h3>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard 
                  button 
                  onClick={() => setOrganizationType('school')}
                  style={{
                    border: organizationType === 'school' ? '2px solid #3498DB' : '1px solid #444',
                    backgroundColor: 'transparent'
                  }}
                >
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={schoolOutline} 
                      size="large" 
                      style={{ 
                        color: organizationType === 'school' ? '#3498DB' : '#666',
                        marginBottom: '8px' 
                      }} 
                    />
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: organizationType === 'school' ? '#3498DB' : '#333'
                    }}>
                      School
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="6">
                <IonCard 
                  button 
                  onClick={() => setOrganizationType('club')}
                  style={{
                    border: organizationType === 'club' ? '2px solid #E74C3C' : '1px solid #444',
                    backgroundColor: 'transparent'
                  }}
                >
                  <IonCardContent style={{ textAlign: 'center', padding: '16px' }}>
                    <IonIcon 
                      icon={peopleOutline} 
                      size="large" 
                      style={{ 
                        color: organizationType === 'club' ? '#E74C3C' : '#666',
                        marginBottom: '8px' 
                      }} 
                    />
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: organizationType === 'club' ? '#E74C3C' : '#333'
                    }}>
                      Club
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
          
          {organizationType === 'school' && (
            <div style={{ marginTop: '16px' }}>
              <SchoolSelector 
                value={schoolName} 
                onSchoolChange={setSchoolName}
                placeholder="Select or enter school name"
              />
            </div>
          )}
          
          {organizationType === 'club' && (
            <IonItem style={{ marginTop: '16px' }}>
              <IonInput 
                label="Club Name" 
                labelPlacement="stacked" 
                value={clubName} 
                onIonChange={e => setClubName(e.detail.value!)} 
                placeholder="Enter club name"
              />
            </IonItem>
          )}
        </div>
      )}

      {userType === 'buyer' && (schoolName || clubName) ? (
        <div>
          <h3 style={{ margin: '16px 0', color: '#666' }}>Available Items from {organizationType === 'school' ? schoolName : clubName}</h3>
          
          <div style={{ backgroundColor: 'transparent', border: '1px solid #444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>Filters</h4>
            <IonGrid>
              <IonRow>
                <IonCol size="4">
                  <IonInput 
                    label="Size" 
                    labelPlacement="stacked" 
                    value={sizeFilter} 
                    onIonChange={e => setSizeFilter(e.detail.value!)} 
                    placeholder="e.g. L, M, UK 8"
                    style={{ fontSize: '12px' }}
                  />
                </IonCol>
                <IonCol size="4">
                  <IonSelect 
                    label="Condition" 
                    labelPlacement="stacked" 
                    value={conditionFilter} 
                    onIonChange={e => setConditionFilter(e.detail.value)} 
                    placeholder="Any"
                  >
                    <IonSelectOption value={undefined}>Any</IonSelectOption>
                    <IonSelectOption value={1}>Brand new</IonSelectOption>
                    <IonSelectOption value={2}>Like new</IonSelectOption>
                    <IonSelectOption value={3}>Used but good</IonSelectOption>
                    <IonSelectOption value={4}>Used and worn</IonSelectOption>
                  </IonSelect>
                </IonCol>
                <IonCol size="4">
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <IonInput 
                      label="Min Price" 
                      labelPlacement="stacked" 
                      type="number" 
                      value={priceRange.min} 
                      onIonChange={e => setPriceRange({...priceRange, min: e.detail.value!})} 
                      placeholder="0"
                    />
                    <IonInput 
                      label="Max Price" 
                      labelPlacement="stacked" 
                      type="number" 
                      value={priceRange.max} 
                      onIonChange={e => setPriceRange({...priceRange, max: e.detail.value!})} 
                      placeholder="999"
                    />
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>

          <IonGrid>
            <IonRow>
              {getFilteredItems().map((availableItem) => (
                <IonCol size="6" key={availableItem.id}>
                  <IonCard button onClick={() => handleAvailableItemClick(availableItem)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                    <IonCardContent style={{ padding: '8px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                        <div style={{
                          width: '50px', height: '60px', borderRadius: '4px',
                          backgroundImage: \`url(\${availableItem.frontPhoto})\`,
                          backgroundSize: 'cover', backgroundPosition: 'center'
                        }} />
                        <div style={{
                          width: '50px', height: '60px', borderRadius: '4px',
                          backgroundImage: \`url(\${availableItem.backPhoto})\`,
                          backgroundSize: 'cover', backgroundPosition: 'center'
                        }} />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                        {availableItem.item}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        Size: {availableItem.size} | {availableItem.team}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                        Condition: {getConditionText(availableItem.condition)}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#E74C3C' }}>
                        R{availableItem.price}
                      </div>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </div>
      ) : categoryFilter === 'clothing' ? (
        <IonGrid>
          <IonRow>
            {getFilteredCategories()['Clothing']?.items.map((item: string, index: number) => (
              <IonCol size="6" key={index}>
                <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                  <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                    <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      ) : (
        <IonAccordionGroup>
          {Object.entries(getFilteredCategories()).map(([category, categoryData]) => (
            <IonAccordion key={category} value={category}>
              <IonItem slot="header" style={{ '--background': 'transparent' }}>
                <IonIcon 
                  icon={categoryData.icon} 
                  style={{ 
                    fontSize: '24px', 
                    color: categoryData.color, 
                    marginRight: '12px'
                  }} 
                />
                <IonLabel>
                  <h3 style={{ 
                    margin: '0', 
                    fontWeight: 'bold', 
                    color: categoryData.color,
                    fontSize: '16px'
                  }}>
                    {category}
                  </h3>
                </IonLabel>
              </IonItem>
              <div slot="content" style={{ padding: '8px' }}>
                <IonGrid>
                  <IonRow>
                    {categoryData.items.map((item: string, index: number) => (
                      <IonCol size="6" key={index}>
                        <IonCard button onClick={() => handleItemClick(item)} style={{ backgroundColor: 'transparent', border: '1px solid #444' }}>
                          <IonCardContent style={{ textAlign: 'center', padding: '12px' }}>
                            <IonIcon icon={imageOutline} size="large" style={{ marginBottom: '8px', opacity: 0.5 }} />
                            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{item}</div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    ))}
                  </IonRow>
                </IonGrid>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>
      )}
      
      <IonModal isOpen={!!zoomedPhoto} onDidDismiss={() => setZoomedPhoto(null)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Photo View</IonTitle>
            <IonButton fill="clear" slot="end" onClick={() => setZoomedPhoto(null)}>Close</IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {zoomedPhoto && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '16px' }}>
              <img 
                src={zoomedPhoto} 
                alt="Zoomed view" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          )}
        </IonContent>
      </IonModal>
    </div>
  );
};

export default ${componentName};`;
};

// Generate components for key sports
Object.entries(sportConfigs).forEach(([sportName, config]) => {
  const componentCode = generateComponentCode(sportName, config);
  const fileName = `${sportName}EquipmentComponent.tsx`;
  const filePath = path.join(__dirname, fileName);
  
  try {
    fs.writeFileSync(filePath, componentCode);
    console.log(`Generated ${fileName}`);
  } catch (error) {
    console.error(`Failed to generate ${fileName}:`, error.message);
  }
});

console.log('Component generation complete!');