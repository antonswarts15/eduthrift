import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const SoftballEquipmentComponent: React.FC<any> = (props) => {
  const softballCategories = {
    'Equipment': {
      items: ['Softball', 'Softball Bat', 'Softball Glove', 'Home Plate', 'Bases', 'Pitching Rubber'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Softball Jersey', 'Softball Pants', 'Softball Cap', 'Training Shirt', 'Warm-up Jacket'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Softball Helmet', 'Catcher Gear', 'Shin Guards', 'Chest Protector', 'Batting Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Softball Cleats', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Bat Bag', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Softball" sportCategories={softballCategories} />;
};

export default SoftballEquipmentComponent;