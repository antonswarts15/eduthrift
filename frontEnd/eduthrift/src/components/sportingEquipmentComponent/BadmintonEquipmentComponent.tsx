import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface BadmintonEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}
const BadmintonEquipmentComponent: React.FC< BadmintonEquipmentProps >=(props)=> {
  const badmintonCategories = {
    'Equipment': {
      items: ['Badminton Racket', 'Shuttlecocks', 'Net', 'Court Lines'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Badminton Shirt', 'Badminton Shorts', 'Training Vest'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Wrist Support', 'Knee Support', 'Ankle Support'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Badminton Shoes', 'Court Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Badminton Bag', 'Grip Tape', 'String', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Badminton"
          sportCategories={badmintonCategories}
      />
  );
};
export default BadmintonEquipmentComponent;
