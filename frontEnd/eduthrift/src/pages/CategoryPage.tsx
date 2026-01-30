

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { 
  IonContent, 
  IonPage, 
  IonToast,
  IonCard,
  IonCardContent,
  IonText,
  IonIcon
} from '@ionic/react';
import { cameraOutline } from 'ionicons/icons';
import Categories from '../components/Categories';
import { useToast } from '../hooks/useToast';
import { itemsApi } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Item } from '../types/models';

const CategoryPage: React.FC = () => {
  const { category, subcategory, sport } = useParams<{
    category: string;
    subcategory?: string;
    sport?: string;
  }>();
  const history = useHistory();
  const { isOpen, message, color, hideToast } = useToast();
  const [categoryItems, setCategoryItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchCategoryItems = async () => {
      try {
        // Fetch items filtered by the current category/subcategory
        const filters: Record<string, string> = {};
        if (category) filters.category = category;
        if (subcategory) filters.subcategory = subcategory;
        if (sport) filters.sport = sport;

        const response = await itemsApi.getItems(filters);
        if (response.data && Array.isArray(response.data)) {
          setCategoryItems(response.data.slice(0, 10)); // Get top 10 items for this category
        }
      } catch (error) {
        console.error('Failed to fetch category items:', error);
      }
    };

    fetchCategoryItems();
  }, [category, subcategory, sport]);

  const handleCategorySelect = (selectedCategory: string, selectedSubcategory?: string, selectedSport?: string, selectedItem?: string) => {
    if (selectedItem) {
      // Navigate to item page
      const itemPath = selectedSport 
        ? `/item/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubcategory || '')}/${encodeURIComponent(selectedSport)}/${encodeURIComponent(selectedItem)}`
        : `/item/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubcategory || '')}/${encodeURIComponent(selectedItem)}`;
      history.push(itemPath);
    } else if (selectedSport) {
      // Navigate to sport category
      history.push(`/category/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubcategory || '')}/${encodeURIComponent(selectedSport)}`);
    } else if (selectedSubcategory) {
      // Navigate to subcategory
      history.push(`/category/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubcategory)}`);
    } else {
      // Navigate to main category
      history.push(`/category/${encodeURIComponent(selectedCategory)}`);
    }
  };

  return (
    <IonPage>
      <IonContent>
        {/* Featured Items Slider for this Category */}
        {categoryItems.length > 0 && (
          <div style={{ marginTop: '16px', marginBottom: '10px' }}>
            <h3 style={{ textAlign: 'left', marginLeft: '16px', color: '#2C3E50', marginBottom: '10px', fontSize: '16px' }}>
              Featured in {subcategory || category}
            </h3>
            <Swiper
              slidesPerView={2.2}
              spaceBetween={10}
              freeMode={true}
            >
              {categoryItems.map((item, index) => (
                <SwiperSlide key={index} onClick={() => history.push(`/item/${item.id}`)}>
                  <IonCard style={{ width: '100%', margin: '0', height: '160px' }}>
                    <div style={{ height: '90px', width: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.front_photo ? (
                        <img src={item.front_photo} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <IonIcon icon={cameraOutline} style={{ fontSize: '28px', color: '#ccc' }} />
                      )}
                    </div>
                    <IonCardContent style={{ padding: '8px', textAlign: 'left' }}>
                      <IonText style={{ fontSize: '11px', fontWeight: '600', color: '#333', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.item_name || item.name}
                      </IonText>
                      <IonText style={{ fontSize: '13px', fontWeight: 'bold', color: '#27AE60', marginTop: '2px', display: 'block' }}>
                        R{item.price}
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        <Categories 
          onCategorySelect={handleCategorySelect}
          userType="buyer"
        />
        
        <IonToast
          isOpen={isOpen}
          onDidDismiss={hideToast}
          message={message}
          duration={3000}
          position="bottom"
          color={color}
        />
      </IonContent>
    </IonPage>
  );
};

export default CategoryPage;