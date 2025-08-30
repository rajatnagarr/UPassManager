"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddDistributorModal from '../components/AddDistributorModal';

const Distributors = () => {
  const router = useRouter();
  const [distributors, setDistributors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddDistributorModalOpen, setIsAddDistributorModalOpen] = useState(false);
  const [addDistributorSuccess, setAddDistributorSuccess] = useState(false);
  const [removeSuccess, setRemoveSuccess] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 6;

  // Check if user is logged in and has admin role
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    console.log('Retrieved user role:', role);
    
    if (!role) {
      // User is not logged in, redirect to login page
      console.log('No role found, redirecting to login page');
      router.push('/');
      return;
    }
    
    if (role !== 'admin') {
      // User is not an admin, redirect to dashboard
      console.log('User is not an admin, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    // User is logged in and is an admin, set the role
    setUserRole(role);
    
    // Mark initialization as complete
    setIsInitializing(false);
  }, [router]);

  // Fetch distributors when component mounts
  useEffect(() => {
    if (isInitializing) return;
    
    fetchDistributors();
  }, [isInitializing]);

  const fetchDistributors = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/get-distributors');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch distributors');
      }
      
      setDistributors(data.data);
    } catch (err) {
      console.error('Error fetching distributors:', err);
      setError(err.message || 'An error occurred while fetching distributors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDistributor = async (email) => {
    console.log('Adding distributor with email:', email);
    // Here you would typically make an API call to add the distributor
    // For now, we'll just show a success message and refresh the list
    setAddDistributorSuccess(true);
    setTimeout(() => setAddDistributorSuccess(false), 3000);
    
    // Refresh the list of distributors
    await fetchDistributors();
  };

  const handleRemoveDistributor = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) {
      return;
    }
    
    try {
      const response = await fetch('/api/remove-distributor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove distributor');
      }
      
      // Show success message
      setRemoveSuccess(true);
      setTimeout(() => setRemoveSuccess(false), 3000);
      
      // Refresh the list of distributors
      await fetchDistributors();
    } catch (err) {
      console.error('Error removing distributor:', err);
      setError(err.message || 'An error occurred while removing distributor');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center mx-auto px-10 py-1">
        {/* Show loading indicator while initializing */}
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#861F41] mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            <div className="w-full max-w-6xl mx-auto">
              <div className="flex justify-center items-center mb-6">
                <div></div>
                <div className="flex space-x-4">
                <button
                    onClick={() => setIsAddDistributorModalOpen(true)}
                    className="bg-[#861F41] text-white font-bold py-2 px-4 rounded flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Distributor
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded hover:bg-gray-300 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#861F41]"></div>
                </div>
              ) : distributors.length === 0 ? (
                <div className="text-center my-8 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">No distributors or admins found.</p>
                </div>
              ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <div style={{ overflowY: 'auto', flex: '1' }}>
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="bg-white divide-y divide-gray-200">
                          {distributors
                            .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                            .map((distributor, index) => (
                            <tr key={index} className="hover:bg-gray-50" style={{ height: '57px' }}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{distributor.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  distributor.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {distributor.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {distributor.role !== 'admin' && (
                                  <button
                                    onClick={() => handleRemoveDistributor(distributor.email)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Remove
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                            <tr>
                              <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                              </td>
                            </tr>
                          </tfoot>
                      </table>
                    </div>
                  </div>
                  {/* Pagination */}
                  {distributors.length > 0 && (
                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(distributors.length / recordsPerPage)))}
                          disabled={currentPage === Math.ceil(distributors.length / recordsPerPage)}
                          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                            currentPage === Math.ceil(distributors.length / recordsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{Math.min((currentPage - 1) * recordsPerPage + 1, distributors.length)}</span> to{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * recordsPerPage, distributors.length)}
                            </span>{' '}
                            of <span className="font-medium">{distributors.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Previous</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            
                            {/* Page numbers */}
                            {[...Array(Math.ceil(distributors.length / recordsPerPage)).keys()].map(number => (
                              <button
                                key={number + 1}
                                onClick={() => setCurrentPage(number + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === number + 1
                                    ? 'z-10 bg-[#861F41] border-[#861F41] text-white'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {number + 1}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(distributors.length / recordsPerPage)))}
                              disabled={currentPage === Math.ceil(distributors.length / recordsPerPage)}
                              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === Math.ceil(distributors.length / recordsPerPage) ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <span className="sr-only">Next</span>
                              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Removed the "Back to Dashboard" button from here as it's now at the top */}
            </div>
          </>
        )}
      </main>
      <Footer />
      
      {addDistributorSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Distributor added successfully!</p>
        </div>
      )}
      
      {removeSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Distributor removed successfully!</p>
        </div>
      )}
      
      <AddDistributorModal
        isOpen={isAddDistributorModalOpen}
        onClose={() => setIsAddDistributorModalOpen(false)}
        onConfirm={handleAddDistributor}
      />
    </div>
  );
};

export default Distributors;
