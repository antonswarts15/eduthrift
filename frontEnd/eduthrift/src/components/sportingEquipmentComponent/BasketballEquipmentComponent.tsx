import React from 'react';
import { constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline } from 'ionicons/icons';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';

interface BasketballEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const BasketballEquipmentComponent: React.FC<BasketballEquipmentProps> = (props) => {
  const basketballCategories = {
    'Equipment': {
      items: ['Basketball', 'Basketball Hoop', 'Training Cones', 'Agility Ladders', 'Ball Pump', 'Training Bibs'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Boys Clothing': {
      items: ['Basketball Jersey', 'Basketball Shorts', 'Training Shirt', 'Warm-up Jacket', 'Compression Shirt', 'Base Layer', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Training Vest'],
      icon: shirtOutline,
      color: '#3498DB'
    },
    'Girls Clothing': {
      items: ['Basketball Jersey', 'Basketball Shorts', 'Training Shirt', 'Warm-up Jacket', 'Compression Shirt', 'Base Layer', 'Tracksuit Top', 'Tracksuit Pants', 'Team Hoodie', 'Training Vest'],
      icon: shirtOutline,
      color: '#E74C3C'
    },
    'Protective Gear': {
      items: ['Knee Pads', 'Ankle Guards', 'Mouthguards', 'Elbow Pads'],
      icon: shieldOutline,
      color: '#27AE60'
    },
    'Footwear': {
      items: ['Basketball Shoes', 'Training Shoes', 'High-top Sneakers'],
      icon: footstepsOutline,
      color: '#8E44AD'
    },
    'Accessories': {
      items: ['Water Bottle', 'Kit Bag', 'Sweatbands', 'Captain Armband', 'Towel'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
    <GenericSportEquipmentComponent
      {...props}
      sportName="Basketball"
      sportCategories={basketballCategories}
    />
  );
};

export default BasketballEquipmentComponent;