import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InventoryItem {
  id: string;
  quantity: number;
  category: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  updateInventory: (id: string, quantity: number, category: string) => void;
  decreaseInventory: (id: string, category: string) => void;
  increaseInventory: (id: string, category: string) => void;
  getItemQuantity: (id: string, category: string) => number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    // Stationery items
    { id: '1', quantity: 3, category: 'stationery' },
    { id: '2', quantity: 2, category: 'stationery' },
    { id: '3', quantity: 1, category: 'stationery' },
    { id: '4', quantity: 0, category: 'stationery' },
    { id: '5', quantity: 4, category: 'stationery' },
    
    // Club clothing items
    { id: '1', quantity: 2, category: 'club-clothing' },
    { id: '2', quantity: 1, category: 'club-clothing' },
    { id: '3', quantity: 3, category: 'club-clothing' },
    { id: '4', quantity: 0, category: 'club-clothing' },
    { id: '5', quantity: 1, category: 'club-clothing' },
    
    // Textbook items
    { id: '1', quantity: 2, category: 'textbooks' },
    { id: '2', quantity: 1, category: 'textbooks' },
    { id: '3', quantity: 0, category: 'textbooks' },
    
    // Training wear items
    { id: '1', quantity: 2, category: 'training-wear' },
    { id: '2', quantity: 1, category: 'training-wear' },
    { id: '3', quantity: 3, category: 'training-wear' },
    { id: '4', quantity: 0, category: 'training-wear' },
    { id: '5', quantity: 1, category: 'training-wear' },
    
    // School uniform items
    { id: '1', quantity: 2, category: 'school-uniform' },
    { id: '2', quantity: 1, category: 'school-uniform' },
    { id: '3', quantity: 3, category: 'school-uniform' },
    { id: '4', quantity: 0, category: 'school-uniform' },
    { id: '5', quantity: 1, category: 'school-uniform' },
    { id: '6', quantity: 2, category: 'school-uniform' },
    { id: '7', quantity: 1, category: 'school-uniform' },
  ]);

  const updateInventory = (id: string, quantity: number, category: string) => {
    setInventory(prev => {
      const existingIndex = prev.findIndex(item => item.id === id && item.category === category);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        return [...prev, { id, quantity, category }];
      }
    });
  };

  const decreaseInventory = (id: string, category: string) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id && item.category === category && item.quantity > 0
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const increaseInventory = (id: string, category: string) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === id && item.category === category
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const getItemQuantity = (id: string, category: string): number => {
    const item = inventory.find(item => item.id === id && item.category === category);
    return item ? item.quantity : 0;
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      updateInventory,
      decreaseInventory,
      increaseInventory,
      getItemQuantity
    }}>
      {children}
    </InventoryContext.Provider>
  );
};