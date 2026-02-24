import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonAccordion,
  IonAccordionGroup,
  IonToast
} from '@ionic/react';
import {
  imageOutline,
  manOutline,
  womanOutline,
  diamondOutline
} from 'ionicons/icons';
import { useCartStore } from '../../stores/cartStore';
import { useListingsStore } from '../../stores/listingsStore';

// ✅ Ensure this matches your CartItem type in cartStore
interface CartItem {
  id: string;
  name: string;
  description: string;
  school: string;
  price: number;
  size: string;
  condition: number;
  frontPhoto: string;
  backPhoto: string;
  gender: string;
  quantity: number;
  category: string;
  subcategory?: string;
  sport?: string;
}

interface MatricDanceProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: string;
}

const MatricDanceComponent: React.FC<MatricDanceProps> = ({
                                                            userType,
                                                            onItemSelect
                                                          }) => {
  const { addToCart } = useCartStore();
  const { listings, fetchListings } = useListingsStore();

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);

  const [size, setSize] = useState('');
  const [condition, setCondition] = useState<number>();
  const [price, setPrice] = useState('');
  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [backPhoto, setBackPhoto] = useState<string | null>(null);

  const [viewItem, setViewItem] = useState<any>(null);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const sizes = ['XS','S','M','L','XL','XXL','4','6','8','10','12','14','16'];

  const getConditionText = (c: number) =>
      ({1:'Brand new',2:'Like new',3:'Used but good',4:'Used and worn'} as any)[c] || 'Unknown';

  const categoryMap = {
    Girls: ['Evening dress','Cocktail dress','Ball gown','A-line dress','Mermaid dress','Prom dress'],
    Boys: ['Tuxedo','Suit','Blazer','Dress shirt','Bow tie','Tie','Waistcoat','Dress pants'],
    Accessories: ['Formal shoes','Heels','Clutch bag','Jewelry','Cufflinks','Pocket square','Belt']
  };

  // ✅ Map listings → UI items
  const getItems = (type: 'Girls'|'Boys'|'Accessories') => {
    const items = listings
        .filter(l => {
          if (l.category !== 'Matric dance clothing') return false;
          if (type === 'Accessories') return l.gender === 'Unisex';
          if (type === 'Girls') return l.gender === 'Girls';
          if (type === 'Boys') return l.gender === 'Boys';
          return false;
        })
        .map(l => ({
          id: l.id,
          item: l.name,
          description: l.description,
          school: l.school,
          subcategory: l.subcategory,
          sport: l.sport,
          size: l.size,
          condition: l.condition,
          price: l.price,
          frontPhoto: l.frontPhoto,
          backPhoto: l.backPhoto,
          quantity: l.quantity,
          gender: l.gender
        }));

    return items;
  };

  const handleItemClick = (item: string, gender: string) => {
    setSelectedItem(item);
    setSelectedGender(gender);
    setShowItemDetails(true);
  };

  const handleSubmit = () => {
    onItemSelect?.({
      item: selectedItem,
      size,
      condition,
      price,
      frontPhoto,
      backPhoto,
      gender: selectedGender
    });

    setShowItemDetails(false);
    setSelectedItem('');
    setSize('');
  };

  const uploadPhoto = (type:'front'|'back') => {
    const input = document.createElement('input');
    input.type='file';
    input.accept='image/*';
    input.onchange = e=>{
      const file=(e.target as HTMLInputElement).files?.[0];
      if(!file) return;
      const r=new FileReader();
      r.onload = ev=>{
        if(type==='front') setFrontPhoto(ev.target?.result as string);
        else setBackPhoto(ev.target?.result as string);
      };
      r.readAsDataURL(file);
    };
    input.click();
  };

  const handleAddToCart = (item: any) => {
    if (item.quantity === 0) {
      setToastMessage(`${item.item} is sold out`);
      setShowToast(true);
      return;
    }

    const cartItem: CartItem = {
      id: String(item.id),
      name: item.item ?? "",
      description: item.description ?? `${item.item} - Size ${item.size}`,
      price: Number(item.price ?? 0),
      condition: Number(item.condition ?? 3),
      school: item.school ?? "",
      size: item.size ?? "",
      gender: item.gender ?? "",
      category: "Matric dance clothing",
      subcategory: item.subcategory,
      sport: item.sport,
      frontPhoto: item.frontPhoto ?? "",
      backPhoto: item.backPhoto ?? "",
      quantity: 1
    };

    addToCart(cartItem);
    setToastMessage("Added to cart");
    setShowToast(true);
  };

  // ---------- ITEM VIEW ----------
  if(viewItem){
    return (
        <div style={{padding:16}}>
          <IonButton fill="clear" onClick={()=>setViewItem(null)}>← Back</IonButton>
          <h2 style={{textAlign:'center'}}>{viewItem.item}</h2>

          <div style={{display:'flex',gap:16,justifyContent:'center'}}>
            <img src={viewItem.frontPhoto} style={{width:150,height:200,objectFit:'cover'}} onClick={()=>setZoomedPhoto(viewItem.frontPhoto)}/>
            <img src={viewItem.backPhoto} style={{width:150,height:200,objectFit:'cover'}} onClick={()=>setZoomedPhoto(viewItem.backPhoto)}/>
          </div>

          <div style={{marginTop:16}}>
            <div><b>Size:</b> {viewItem.size}</div>
            <div><b>Condition:</b> {getConditionText(viewItem.condition)}</div>
            <div style={{color:'#E74C3C',fontSize:20,fontWeight:'bold'}}>R{viewItem.price}</div>
          </div>

          <IonButton expand="full" onClick={()=>handleAddToCart(viewItem)}>
            Add to Cart
          </IonButton>
        </div>
    );
  }

  // ---------- SELLER DETAILS ----------
  if(showItemDetails){
    return (
        <div style={{padding:16}}>
          <IonButton fill="clear" onClick={()=>setShowItemDetails(false)}>← Back</IonButton>
          <h2>{selectedItem}</h2>

          <IonItem>
            <IonLabel position="stacked">Size</IonLabel>
            <IonSelect value={size} onIonChange={e=>setSize(e.detail.value)}>
              {sizes.map(s=><IonSelectOption key={s} value={s}>{s}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Condition</IonLabel>
            <IonSelect value={condition} onIonChange={e=>setCondition(parseInt(e.detail.value))}>
              <IonSelectOption value={1}>Brand new</IonSelectOption>
              <IonSelectOption value={2}>Like new</IonSelectOption>
              <IonSelectOption value={3}>Used but good</IonSelectOption>
              <IonSelectOption value={4}>Used and worn</IonSelectOption>
            </IonSelect>
          </IonItem>

          {userType==='seller' && (
              <>
                <IonItem>
                  <IonInput label="Price" type="number" value={price} onIonChange={e=>setPrice(e.detail.value!)} />
                </IonItem>

                <div style={{display:'flex',gap:16,marginTop:16}}>
                  <div onClick={()=>uploadPhoto('front')} style={{width:120,height:150,border:'2px dashed #ccc',backgroundImage:frontPhoto?`url(${frontPhoto})`:''}}/>
                  <div onClick={()=>uploadPhoto('back')} style={{width:120,height:150,border:'2px dashed #ccc',backgroundImage:backPhoto?`url(${backPhoto})`:''}}/>
                </div>
              </>
          )}

          <IonButton expand="full" onClick={handleSubmit}>
            {userType==='seller'?'List Item':'Add to Cart'}
          </IonButton>
        </div>
    );
  }

  // ---------- MAIN ----------
  return (
      <div>
        <h2>Matric Dance</h2>

        {userType==='buyer' && (
            <IonAccordionGroup>

              <IonAccordion value="Girls">
                <IonItem slot="header">
                  <IonIcon icon={womanOutline} style={{marginRight:8,color:'#E74C3C'}}/>
                  <IonLabel>Girls</IonLabel>
                </IonItem>
                <div slot="content">
                  {getItems('Girls').map(i=>(
                      <IonCard key={i.id} button onClick={()=>setViewItem(i)}>
                        <IonCardContent>
                          <img src={i.frontPhoto} style={{width:60,height:80,objectFit:'cover'}}/>
                          <div>{i.item}</div>
                          <div>Size {i.size}</div>
                          <div>R{i.price}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

              <IonAccordion value="Boys">
                <IonItem slot="header">
                  <IonIcon icon={manOutline} style={{marginRight:8,color:'#2C3E50'}}/>
                  <IonLabel>Boys</IonLabel>
                </IonItem>
                <div slot="content">
                  {getItems('Boys').map(i=>(
                      <IonCard key={i.id} button onClick={()=>setViewItem(i)}>
                        <IonCardContent>
                          <img src={i.frontPhoto} style={{width:60,height:80,objectFit:'cover'}}/>
                          <div>{i.item}</div>
                          <div>Size {i.size}</div>
                          <div>R{i.price}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

              <IonAccordion value="Accessories">
                <IonItem slot="header">
                  <IonIcon icon={diamondOutline} style={{marginRight:8,color:'#8E44AD'}}/>
                  <IonLabel>Accessories</IonLabel>
                </IonItem>
                <div slot="content">
                  {getItems('Accessories').map(i=>(
                      <IonCard key={i.id} button onClick={()=>setViewItem(i)}>
                        <IonCardContent>
                          <img src={i.frontPhoto} style={{width:60,height:80,objectFit:'cover'}}/>
                          <div>{i.item}</div>
                          <div>Size {i.size}</div>
                          <div>R{i.price}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

            </IonAccordionGroup>
        )}

        {userType==='seller' && (
            <IonAccordionGroup>

              <IonAccordion value="Girls">
                <IonItem slot="header">
                  <IonIcon icon={womanOutline} style={{marginRight:8,color:'#E74C3C'}}/>
                  <IonLabel>Girls</IonLabel>
                </IonItem>
                <div slot="content">
                  {categoryMap.Girls.map(item=>(
                      <IonCard key={item} button onClick={()=>handleItemClick(item,'Girls')}>
                        <IonCardContent style={{textAlign:'center'}}>
                          <IonIcon icon={imageOutline}/>
                          <div>{item}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

              <IonAccordion value="Boys">
                <IonItem slot="header">
                  <IonIcon icon={manOutline} style={{marginRight:8,color:'#2C3E50'}}/>
                  <IonLabel>Boys</IonLabel>
                </IonItem>
                <div slot="content">
                  {categoryMap.Boys.map(item=>(
                      <IonCard key={item} button onClick={()=>handleItemClick(item,'Boys')}>
                        <IonCardContent style={{textAlign:'center'}}>
                          <IonIcon icon={imageOutline}/>
                          <div>{item}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

              <IonAccordion value="Accessories">
                <IonItem slot="header">
                  <IonIcon icon={diamondOutline} style={{marginRight:8,color:'#8E44AD'}}/>
                  <IonLabel>Accessories</IonLabel>
                </IonItem>
                <div slot="content">
                  {categoryMap.Accessories.map(item=>(
                      <IonCard key={item} button onClick={()=>handleItemClick(item,'Unisex')}>
                        <IonCardContent style={{textAlign:'center'}}>
                          <IonIcon icon={imageOutline}/>
                          <div>{item}</div>
                        </IonCardContent>
                      </IonCard>
                  ))}
                </div>
              </IonAccordion>

            </IonAccordionGroup>
        )}

        <IonToast
            isOpen={showToast}
            message={toastMessage}
            duration={2000}
            onDidDismiss={()=>setShowToast(false)}
        />

        {zoomedPhoto && (
            <div onClick={()=>setZoomedPhoto(null)}
                 style={{position:'fixed',top:0,left:0,right:0,bottom:0,
                   background:'rgba(0,0,0,0.8)',display:'flex',
                   justifyContent:'center',alignItems:'center'}}>
              <img src={zoomedPhoto} style={{maxHeight:'80vh'}}/>
            </div>
        )}
      </div>
  );
};

export default MatricDanceComponent;
