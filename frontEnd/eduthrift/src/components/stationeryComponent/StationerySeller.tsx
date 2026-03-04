import React, { useState } from 'react';
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
  IonToast
} from '@ionic/react';
import { pencilOutline, bookOutline, colorPaletteOutline, cutOutline, bagOutline, imageOutline } from 'ionicons/icons';
import { useListingsStore } from '../../stores/listingsStore';
import { validateImageFile } from '../../utils/imageEnhancer';

const StationerySeller: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [condition, setCondition] = useState<number | undefined>();
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addListing } = useListingsStore();

  const stationeryCategories = {
    'Writing Instruments': {
      items: ['HB Pencils', '2B Pencils (Art)', 'Blue ballpoint pens', 'Black ballpoint pens', 'Red ballpoint pens', 'Highlighters (assorted colours)', 'Whiteboard markers', 'Permanent markers'],
      icon: pencilOutline,
      color: '#3498DB'
    },
    'Paper & Books': {
      items: ['A4 exercise books (72-page)', 'A4 exercise books (192-page)', 'A4 hardcover books', 'A4 exam pads (punched)', 'A5 exercise books', 'Flip file (30 pocket)', 'Flip file (50 pocket)', 'Scrapbook'],
      icon: bookOutline,
      color: '#E74C3C'
    },
    'Drawing & Colouring': {
      items: ['Colouring pencils (12-pack)', 'Crayons (12-pack)', 'Oil pastels (12-pack)', 'Watercolour paint set', 'Paintbrushes (various sizes)', 'Erasers (white, soft)', 'Sharpener (with container)'],
      icon: colorPaletteOutline,
      color: '#27AE60'
    },
    'Measuring & Cutting': {
      items: ['30cm ruler', '15cm ruler', 'Pair of scissors (blunt tip for juniors)', 'Pair of scissors (sharp tip for seniors)', 'Mathematical set (compass, protractor, etc.)'],
      icon: cutOutline,
      color: '#F39C12'
    },
    'Adhesives': {
      items: ['Glue stick', 'White liquid glue', 'Sticky tape (clear)', 'Masking tape'],
      icon: pencilOutline,
      color: '#8E44AD'
    },
    'Storage & Organisation': {
      items: ['Pencil case', 'Book covers (plastic)', 'Labels (self-adhesive)', 'School bag'],
      icon: bagOutline,
      color: '#1ABC9C'
    }
  };

  const handleItemClick = (item: string) => {
    setSelectedItem(item);
    setShowItemDetails(true);
  };

  const handlePhotoUpload = (type: 'front' | 'back') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setToastMessage(validation.error || 'Invalid image file');
          setShowToast(true);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          if (type === 'front') {
            setFrontPhoto(event.target?.result as string);
          } else {
            setBackPhoto(event.target?.result as string);
          }
        };
        reader.onerror = () => {
          setToastMessage('Failed to read image file. Please try a different image.');
          setShowToast(true);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    console.log('StationerySeller: handleSubmit called');
    const missingFields = [];
    if (!condition) missingFields.push('Condition');
    if (!price) missingFields.push('Price');
    if (!quantity) missingFields.push('Quantity');
    if (!frontPhoto) missingFields.push('Front Photo');
    if (!backPhoto) missingFields.push('Back Photo');
    
    if (missingFields.length > 0) {
      console.log('StationerySeller: Missing fields:', missingFields);
      setToastMessage(`Please fill in: ${missingFields.join(', ')}`);
      setShowToast(true);
      return;
    }

    const itemData = {
      id: Date.now().toString(),
      name: selectedItem,
      description: `${selectedItem} - Quantity: ${quantity}`,
      school: '',
      gender: 'Unisex',
      size: 'Standard',
      condition: condition || 1,
      price: parseInt(price),
      frontPhoto: frontPhoto || '',
      backPhoto: backPhoto || '',
      category: 'Stationery',
      dateCreated: new Date().toLocaleDateString(),
      quantity: parseInt(quantity)
    };

    console.log('StationerySeller: Submitting item:', itemData.name);
    setIsSubmitting(true);
    
    try {
      await addListing(itemData);
      console.log('StationerySeller: Item listed successfully');
      setToastMessage(`${selectedItem} listed successfully!`);
      setShowToast(true);
      setShowItemDetails(false);
      setSelectedItem('');
      setCondition(undefined);
      setPrice('');
      setQuantity('1');
      setFrontPhoto(null);
      setBackPhoto(null);
    } catch (error: any) {
      console.error('StationerySeller: Error listing item:', error);
      setToastMessage(error.message || 'Failed to list item');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showItemDetails) {
    return (
      <div style={{ padding: '16px' }}>
        <IonButton fill="clear" onClick={() => setShowItemDetails(false)}>← Back</IonButton>
        
        <div style={{ textAlign: 'center', margin: '0 0 20px 0' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#666' }}>
            {selectedItem}
          </span>
        </div>
        
        <IonItem>
          <IonLabel position="stacked">Quantity *</IonLabel>
          <IonInput 
            type="number" 
            value={quantity} 
            onIonChange={e => setQuantity(e.detail.value!)} 
            placeholder="Enter quantity"
            min="1"
          />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Condition Grade *</IonLabel>
          <IonSelect value={condition} onIonChange={e => setCondition(parseInt(e.detail.value))}>
            <IonSelectOption value={1}>1 - Brand new</IonSelectOption>
            <IonSelectOption value={2}>2 - Like new</IonSelectOption>
            <IonSelectOption value={3}>3 - Used but good</IonSelectOption>
            <IonSelectOption value={4}>4 - Used and worn</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Price (ZAR) *</IonLabel>
          <IonInput 
            type="number" 
            value={price} 
            onIonChange={e => setPrice(e.detail.value!)} 
            placeholder="Enter selling price"
          />
        </IonItem>
        
        <div style={{ display: 'flex', gap: '16px', margin: '16px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div 
              onClick={() => handlePhotoUpload('front')}
              style={{
                width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backgroundImage: frontPhoto ? `url(${frontPhoto})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: !frontPhoto ? '#f0f0f0' : 'transparent'
              }}
            >
              {!frontPhoto && <IonIcon icon={imageOutline} size="large" />}
            </div>
            <p style={{ fontSize: '12px', margin: '4px 0' }}>Front Photo *</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div 
              onClick={() => handlePhotoUpload('back')}
              style={{
                width: '120px', height: '150px', border: '2px dashed #ccc', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                backgroundImage: backPhoto ? `url(${backPhoto})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                backgroundColor: !backPhoto ? '#f0f0f0' : 'transparent'
              }}
            >
              {!backPhoto && <IonIcon icon={imageOutline} size="large" />}
            </div>
            <p style={{ fontSize: '12px', margin: '4px 0' }}>Back Photo *</p>
          </div>
        </div>

        <IonButton expand="full" onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: '16px' }}>
          {isSubmitting ? 'Listing...' : 'List Item'}
        </IonButton>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2>List Stationery Item</h2>
      
      <IonAccordionGroup>
        {Object.entries(stationeryCategories).map(([category, categoryData]) => (
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
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="bottom"
        color={toastMessage.includes('successfully') ? 'success' : 'danger'}
      />
    </div>
  );
};

export default StationerySeller;
