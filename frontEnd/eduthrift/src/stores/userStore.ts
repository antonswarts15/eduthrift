import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name?: string; // Full name (computed from firstName + lastName)
  firstName?: string; // From backend
  lastName?: string; // From backend
  email: string;
  phone: string;
  address?: string; // Street address
  town?: string; // City/Town
  suburb?: string;
  province?: string;
  schoolName?: string;
  userType?: 'buyer' | 'seller' | 'both' | 'admin';
  sellerVerification?: {
    status: 'pending' | 'verified' | 'rejected';
    submittedAt?: string;
    verifiedAt?: string;
  };
  idDocumentPath?: string;
  proofOfResidencePath?: string;
}

interface UserStore {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  submitSellerVerification: (idDocument: string, proofOfResidence: string) => void; // This method might need refactoring or removal if uploads are handled directly by API calls
  isSellerVerified: () => boolean;
  fetchUserProfile: () => Promise<void>; // Added fetchUserProfile to the store
}

export const useUserStore = create<UserStore>((set, get) => ({
  userProfile: null, // Initialize as null, will be fetched
  
  setUserProfile: (profile: UserProfile) => set({ userProfile: profile }),

  updateProfile: (updates: Partial<UserProfile>) => {
    const { userProfile } = get();
    if (userProfile) {
      set({ userProfile: { ...userProfile, ...updates } });
    }
  },

  submitSellerVerification: (idDocument: string, proofOfResidence: string) => {
    const { userProfile } = get();
    if (userProfile) {
      set({
        userProfile: {
          ...userProfile,
          sellerVerification: {
            status: 'pending',
            submittedAt: new Date().toISOString()
          },
          idDocumentPath: idDocument, // Update direct path
          proofOfResidencePath: proofOfResidence // Update direct path
        }
      });
    }
  },

  isSellerVerified: () => {
    const { userProfile } = get();
    return userProfile?.sellerVerification?.status === 'verified';
  },

  fetchUserProfile: async () => {
    try {
      const response = await (await import('../services/api')).userApi.getProfile();
      const profileData = response.data;
      const profile: UserProfile = {
        ...profileData,
        name: profileData.firstName && profileData.lastName
          ? `${profileData.firstName} ${profileData.lastName}`
          : profileData.firstName || profileData.lastName || 'User',
        userType: profileData.userType?.toLowerCase(),
        sellerVerification: {
          status: profileData.sellerVerified ? 'verified'
                 : profileData.verificationStatus === 'rejected' ? 'rejected'
                 : profileData.verificationStatus === 'pending' ? 'pending'
                 : undefined,
        }
      };
      set({ userProfile: profile });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't clear the profile on error — keep existing state to avoid logout
    }
  }
}));
