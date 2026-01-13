import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface IceSkatingEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const IceSkatingEquipmentComponent: React.FC< IceSkatingEquipmentProps > = (props) => {

  const iceSkatingCategories = {
    'Equipment': {
      items: ['Training Cones', 'Balance Board', 'Practice Aids'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Thermal Layers', 'Warm Jacket', 'Thermal Pants', 'Practice Outfit'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Helmet', 'Gloves', 'Knee Pads', 'Wrist Guards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Ice Skates', 'Figure Skates', 'Speed Skates'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Equipment Bag', 'Blade Guards', 'Towel', 'Water Bottle'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };
  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="IceSkating"
          sportCategories={iceSkatingCategories}
      />
  );
};
export default IceSkatingEquipmentComponent;
