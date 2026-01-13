import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface AthleticsEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?: boolean;
}

const AthleticsEquipmentComponent: React.FC< AthleticsEquipmentProps > = (props) => {
const athleticsCategories = {
  'Equipment': {
    items: ['Stopwatch', 'Starting Blocks', 'Hurdles', 'Shot Put', 'Discus', 'Javelin'],
    icon: constructOutline,
    color: '#E74C3C'
  },
  'Clothing': {
    items: ['Running Vest', 'Running Shorts', 'Running Tights', 'Track Suit'],
    icon: shirtOutline,
    color: '#3498DB'
  },
  'Protective Gear': {
    items: ['Sunblock', 'Knee Support', 'Ankle Support'],
    icon: shieldOutline,
    color: '#27AE60'
  },
  'Footwear': {
    items: ['Running Spikes', 'Training Shoes', 'Cross Country Shoes'],
    icon: footstepsOutline,
    color: '#8E44AD'
  },
  'Accessories': {
    items: ['Water Bottle', 'Towel', 'Athletics Bag', 'Bib Numbers'],
    icon: bagOutline,
    color: '#F39C12'
  }
};

return (
    <GenericSportEquipmentComponent
        {...props}
        sportName="Athletics"
        sportCategories={athleticsCategories}
    />
);
};

export default AthleticsEquipmentComponent;

