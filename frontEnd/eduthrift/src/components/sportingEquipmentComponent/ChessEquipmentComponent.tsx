import React from 'react';
import GenericSportEquipmentComponent from './GenericSportEquipmentComponent';
import { cameraOutline, imageOutline, chevronDownOutline, constructOutline, shirtOutline, shieldOutline, footstepsOutline, bagOutline, schoolOutline, peopleOutline } from 'ionicons/icons';

interface ChessEquipmentProps {
  userType: 'seller' | 'buyer';
  onItemSelect?: (item: any) => void;
  categoryFilter?: 'clothing' | 'footwear' | 'equipment-protective-accessories' | 'all';
  schoolName?: string;
  hideSchoolClubSelection?:boolean;
}
const ChessEquipmentComponent: React.FC< ChessEquipmentProps > = (props) => {
  const chessCategories = {
    'Equipment': {
      items: ['Chess Board', 'Chess Pieces', 'Chess Clock', 'Chess Computer'],
      icon: constructOutline,
      color: '#E74C3C'
    },
    'Accessories': {
      items: ['Chess Books', 'Notation Pad', 'Travel Chess Set', 'Chess Bag'],
      icon: bagOutline,
      color: '#F39C12'
    }
  };

  return (
      <GenericSportEquipmentComponent
          {...props}
          sportName="Chess"
          sportCategories={chessCategories}
      />
  );
};
export default ChessEquipmentComponent;
