import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface GymnasticsEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const GymnasticsEquipmentComponent: React.FC< GymnasticsEquipmentProps > = (props) => {

  const gymnasticsCategories = {
    'Equipment': {
      items: ['Gymnastics Mat', 'Balance Beam', 'Parallel Bars', 'Rings', 'Vault'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Leotard', 'Unitard', 'Gymnastics Shorts', 'Training Top'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Wrist Guards', 'Grips', 'Knee Pads', 'Ankle Support'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Gymnastics Shoes', 'Foot Undies', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Chalk', 'Grip Bag', 'Hair Ties', 'Water Bottle', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Gymnastics"
          sportCategories={gymnasticsCategories}
      />
  );
};
export default GymnasticsEquipmentComponent;
