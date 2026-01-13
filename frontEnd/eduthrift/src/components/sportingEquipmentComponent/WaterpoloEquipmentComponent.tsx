import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

const WaterpoloEquipmentComponent: React.FC<any> = (props) => {
  const waterpoloCategories = {
    'Equipment': {
      items: ['Water Polo Ball', 'Goal Posts', 'Training Equipment', 'Ball Pump', 'Pool Markers'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Boys Clothing': {
      items: ['Water Polo Suit', 'Swimming Trunks', 'Rash Guard', 'Warm-up Jacket', 'Team Polo', 'Tracksuit Top', 'Tracksuit Pants'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Clothing': {
      items: ['Water Polo Suit', 'Swimming Costume', 'Rash Guard', 'Warm-up Jacket', 'Team Polo', 'Tracksuit Top', 'Tracksuit Pants'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Protective Gear': {
      items: ['Water Polo Cap', 'Ear Guards', 'Mouthguards'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Pool Shoes', 'Flip Flops'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Towel', 'Goggles', 'Swim Cap'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return <GenericSportEquipmentComponent {...props} sportName="Waterpolo" sportCategories={waterpoloCategories} />;
};

export default WaterpoloEquipmentComponent;