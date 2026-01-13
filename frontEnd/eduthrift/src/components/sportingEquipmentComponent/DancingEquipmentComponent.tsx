import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';
interface DancingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const DancingEquipmentComponent: React.FC< DancingEquipmentProps > = (props) => {
  const dancingCategories = {
    'Equipment': {
      items: ['Dance Mat', 'Barre', 'Mirror', 'Sound System'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Leotard', 'Tights', 'Practice Skirt', 'Dance Top'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Footwear': {
      items: ['Ballet Shoes', 'Jazz Shoes', 'Tap Shoes', 'Contemporary Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Hair Accessories', 'Dance Bag', 'Water Bottle', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Dancing"
          sportCategories={dancingCategories}
      />
  );
};
export default DancingEquipmentComponent;
