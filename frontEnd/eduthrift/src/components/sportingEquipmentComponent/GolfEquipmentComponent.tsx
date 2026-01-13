import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface GolfEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const GolfEquipmentComponent: React.FC< GolfEquipmentProps > = (props) => {
  const golfCategories = {
    'Equipment': {
      items: ['Golf Clubs', 'Golf Balls', 'Golf Tees', 'Golf Bag', 'Golf Cart'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Golf Polo Shirt', 'Golf Trousers', 'Golf Shorts', 'Golf Vest'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Golf Gloves', 'Sun Hat', 'Sunglasses'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Golf Shoes', 'Golf Spikes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Golf Towel', 'Ball Markers', 'Divot Tool', 'Water Bottle'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Golf"
          sportCategories={golfCategories}
      />
  );
};
export default GolfEquipmentComponent;
