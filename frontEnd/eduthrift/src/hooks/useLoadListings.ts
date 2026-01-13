import { useEffect } from 'react';
import { useListingsStore } from '../stores/listingsStore';

/**
 * Hook to load listings from backend when component mounts
 * Call this in your root App component or main pages
 */
export const useLoadListings = () => {
  const { fetchListings, isLoading, error } = useListingsStore();

  useEffect(() => {
    // Load listings on mount
    fetchListings();
  }, []);

  return { isLoading, error };
};
