"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Create the context
const LoadingContext = createContext({
  isLoading: false,
  loadingText: '',
  setLoading: () => {},
  clearLoading: () => {},
});

// Create a provider component
export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const pathname = usePathname();

  // Clear loading state when pathname changes (navigation completes)
  useEffect(() => {
    setIsLoading(false);
    setLoadingText('');
  }, [pathname]);

  // Function to set loading state
  const setLoading = (text) => {
    setIsLoading(true);
    setLoadingText(text || 'Loading...');
  };

  // Function to clear loading state
  const clearLoading = () => {
    setIsLoading(false);
    setLoadingText('');
  };

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, setLoading, clearLoading }}>
      {children}
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#861F41] mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">{loadingText}</p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
}

// Custom hook to use the loading context
export function useLoading() {
  return useContext(LoadingContext);
}
