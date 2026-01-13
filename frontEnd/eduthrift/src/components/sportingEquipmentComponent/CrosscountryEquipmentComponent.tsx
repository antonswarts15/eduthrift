import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface CrossCountryEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const CrosscountryEquipmentComponent: React.FC< CrossCountryEquipmentProps > = (props) => {
  const crossCountryCategories = {
    'Equipment': {
      items: ['Stopwatch', 'Training Cones', 'Hurdles', 'Starting Blocks'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Running Vest', 'Running Shorts', 'Running Tights', 'Training Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Footwear': {
      items: ['Running Shoes', 'Spikes', 'Cross Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Hydration Pack', 'Reflective Gear', 'Water Bottle', 'Running Belt'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Crosscountry"
          sportCategories={crossCountryCategories}
      />
  );
};
export default CrosscountryEquipmentComponent;
