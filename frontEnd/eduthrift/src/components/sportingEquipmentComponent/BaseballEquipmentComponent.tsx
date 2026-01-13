import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const BaseballEquipmentComponent: React.FC<any> = (props) => {
  const baseballCategories = {
    'Equipment': {
      items: ['Baseball', 'Baseball Bat', 'Baseball Glove', 'Home Plate', 'Bases', 'Pitching Mound'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Baseball Jersey', 'Baseball Pants', 'Baseball Cap', 'Training Shirt', 'Warm-up Jacket'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Baseball Helmet', 'Catcher Gear', 'Shin Guards', 'Chest Protector', 'Batting Gloves'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Baseball Cleats', 'Training Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Bat Bag', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Baseball" sportCategories={baseballCategories} />;
};

export default BaseballEquipmentComponent;