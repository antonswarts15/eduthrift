import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  userType?: 'buyer' | 'seller' | 'both';
  sellerVerification?: {
    status: 'pending' | 'verified' | 'rejected';
    idDocument?: string;
    proofOfResidence?: string;
    submittedAt?: string;
    verifiedAt?: string;
  };
}

interface UserContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  submitSellerVerification: (idDocument: string, proofOfResidence: string) => void;
  isSellerVerified: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0821234567',
    address: {
      street: '123 Main Street',
      suburb: 'Sandton',
      city: 'Johannesburg',
      province: 'Gauteng',
      postalCode: '2196',
      country: 'ZA'
    },
    userType: 'both'
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  const submitSellerVerification = (idDocument: string, proofOfResidence: string) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        sellerVerification: {
          status: 'pending',
          idDocument,
          proofOfResidence,
          submittedAt: new Date().toISOString()
        }
      });
    }
  };

  const isSellerVerified = () => {
    return userProfile?.sellerVerification?.status === 'verified';
  };

  return (
    <UserContext.Provider value={{
      userProfile,
      setUserProfile,
      updateProfile,
      submitSellerVerification,
      isSellerVerified
    }}>
      {children}
    </UserContext.Provider>
  );
};