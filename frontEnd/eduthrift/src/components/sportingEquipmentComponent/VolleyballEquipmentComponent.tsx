import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const VolleyballEquipmentComponent: React.FC<any> = (props) => {
  const volleyballCategories = {
    'Equipment': {
      items: ['Volleyball', 'Volleyball Net', 'Training Cones', 'Agility Ladders', 'Ball Pump', 'Training Bibs'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Boys Clothing': {
      items: ['Volleyball Jersey', 'Volleyball Shorts', 'Training Shirt', 'Warm-up Jacket', 'Compression Shirt', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Clothing': {
      items: ['Volleyball Jersey', 'Volleyball Shorts', 'Training Shirt', 'Warm-up Jacket', 'Compression Shirt', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Protective Gear': {
      items: ['Knee Pads', 'Ankle Guards', 'Mouthguards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Volleyball Shoes', 'Training Shoes', 'Court Shoes'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Captain Armband', 'Towel', 'Sweatbands'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Volleyball" sportCategories={volleyballCategories} />;
};

export default VolleyballEquipmentComponent;