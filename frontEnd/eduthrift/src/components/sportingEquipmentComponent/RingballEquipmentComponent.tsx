import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const RingballEquipmentComponent: React.FC<any> = (props) => {
  const ringballCategories = {
    'Equipment': {
      items: ['Ringball', 'Ring Posts', 'Training Cones', 'Agility Ladders', 'Ball Pump', 'Training Bibs'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Ringball Jersey', 'Ringball Shorts', 'Training Shirt', 'Warm-up Jacket', 'Base Layer'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Knee Pads', 'Ankle Guards', 'Mouthguards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Ringball Shoes', 'Training Shoes', 'Court Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Ringball" sportCategories={ringballCategories} />;
};

export default RingballEquipmentComponent;