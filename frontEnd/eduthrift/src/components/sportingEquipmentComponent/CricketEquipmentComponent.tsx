import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const CricketEquipmentComponent: React.FC<any> = (props) => {
  const cricketCategories = {
    'Equipment': {
      items: ['Cricket Bat', 'Cricket Ball', 'Wickets', 'Training Cones', 'Ball Pump', 'Boundary Markers'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Clothing': {
      items: ['Cricket Jersey', 'Cricket Pants', 'Cricket Shorts', 'Training Shirt', 'Warm-up Jacket', 'Sweater'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Protective Gear': {
      items: ['Cricket Helmet', 'Batting Pads', 'Wicket Keeping Gloves', 'Batting Gloves', 'Chest Guard', 'Thigh Guard'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Cricket Boots', 'Training Shoes', 'Spikes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Bat Cover', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Cricket" sportCategories={cricketCategories} />;
};

export default CricketEquipmentComponent;