import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface MartialArtsEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}

const MartialArtsEquipmentComponent: React.FC< MartialArtsEquipmentProps > = (props) => {

  const martialArtsCategories = {
    'Equipment': {
      items: ['Training Pads', 'Makiwara Board', 'Heavy Bag', 'Speed Bag'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Gi/Uniform', 'Belt', 'Training Shirt', 'Martial Arts Pants'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Sparring Gloves', 'Shin Guards', 'Headgear', 'Chest Protector', 'Groin Guard'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Martial Arts Shoes', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Equipment Bag', 'Water Bottle', 'Towel', 'Mouth Guard'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="MartialArts"
          sportCategories={martialArtsCategories}
      />
  );
};
export default MartialArtsEquipmentComponent;
