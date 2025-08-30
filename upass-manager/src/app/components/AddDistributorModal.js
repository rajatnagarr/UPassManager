"use client";

import React, { useState } from 'react';

const AddDistributorModal = ({ isOpen, onClose, onConfirm }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
  
    try {
      // Create the payload
      const distributorName = email.split('@')[0]; 
      // Use the actual application URL for the set-password link
      const baseUrl = window.location.origin;
      const setPasswordLink = `${baseUrl}/set-password?email=${encodeURIComponent(email)}`;
  

      const response = await fetch('/api/notify-new-distributor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          distributorName: distributorName,
          setPasswordLink: setPasswordLink,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send distributor notification');
      }
  
      // Call onConfirm if needed
      if (onConfirm) {
        onConfirm(email);
      }
  
      setSuccess(true);
      setEmail('');
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
  
    } catch (err) {
      console.error('Error adding distributor:', err);
      setError(err.message || 'Failed to add distributor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-[#861F41] text-white py-4 px-6">
          <h2 className="text-xl font-bold">Add Distributor</h2>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-lg font-medium text-gray-800 mb-1">Distributor has been added!</p>
              <p className="text-gray-600">Please check email for confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41]"
                  placeholder="Enter distributor's email"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  The distributor will receive an invitation email with login instructions.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#861F41] text-white rounded hover:bg-[#6e1935] transition flex items-center justify-center min-w-[100px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Add Distributor'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDistributorModal;
