"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '../context/LoadingContext';

const VisualizationOptionsModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { isLoading, setLoading } = useLoading();

  // Prefetch the visualization pages to speed up navigation
  useEffect(() => {
    if (isOpen) {
      router.prefetch('/visualization');
      router.prefetch('/upass-stats');
    }
  }, [isOpen, router]);

  if (!isOpen && !isLoading) return null;

  const handleNavigation = (path, text) => {
    // Set loading state
    setLoading(text);
    
    // Close the modal but keep the loading overlay visible
    if (isOpen) {
      onClose();
    }
    
    // Add a longer delay to ensure the loading state is visible
    // and to prevent the brief flash of the dashboard
    setTimeout(() => {
      router.push(path);
    }, 500);
  };

  return (
    <>
      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-[#861F41]">Choose Visualization Type</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => handleNavigation('/visualization', 'Loading detailed visualization...')}
                className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                disabled={isLoading}
              >
                <div className="rounded-full p-3 mr-4 bg-[#861F41]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Detailed Visualization</h3>
                  <p className="text-sm text-gray-600">View student data by semester, month, week, and day with interactive charts.</p>
                </div>
              </button>
              
              <button
                onClick={() => handleNavigation('/upass-stats', 'Loading U-Pass statistics...')}
                className="w-full p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
                disabled={isLoading}
              >
                <div className="rounded-full p-3 mr-4 bg-[#CF4420]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-bold">U-Pass Collection Statistics</h3>
                  <p className="text-sm text-gray-600">View pie chart showing the percentage of students who have collected their U-Pass cards.</p>
                </div>
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VisualizationOptionsModal;
