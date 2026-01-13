import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface HorseRidingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const HorseRidingEquipmentComponent: React.FC< HorseRidingEquipmentProps > = (props) => {
  const horseRidingCategories = {
    'Equipment': {
      items: ['Saddle', 'Reins', 'Stirrups', 'Bridle', 'Saddle Pad', 'Crop'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Riding Pants (Jodhpurs)', 'Polo Shirt', 'Competition Jacket', 'Show Shirt'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Body Protector', 'Riding Gloves', 'Back Protector'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Riding Boots', 'Paddock Boots', 'Competition Boots'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Equipment Bag', 'Boot Polish', 'Grooming Kit', 'Water Bottle'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="HorseRiding"
          sportCategories={horseRidingCategories}
      />
  );
};

export default HorseRidingEquipmentComponent;
