"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UploadModal from '../components/UploadModal';
import DisclaimerModal from '../components/DisclaimerModal';
import NFCModal from '../components/NFCModal';
import AddDistributorModal from '../components/AddDistributorModal';
import VisualizationOptionsModal from '../components/VisualizationOptionsModal';
import { maskPid } from '../utils/maskPid';
import AWS from 'aws-sdk';
const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const region = process.env.NEXT_PUBLIC_REGION;
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const [pid, setPid] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [isUpdatingDisclaimer, setIsUpdatingDisclaimer] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isNFCModalOpen, setIsNFCModalOpen] = useState(false);
  const [isAllocatingUPass, setIsAllocatingUPass] = useState(false);
  const [allocateSuccess, setAllocateSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAddDistributorModalOpen, setIsAddDistributorModalOpen] = useState(false);
  const [addDistributorSuccess, setAddDistributorSuccess] = useState(false);
  const [isVisualizationOptionsModalOpen, setIsVisualizationOptionsModalOpen] = useState(false);
  
  // Get user role from localStorage on component mount and check if user is logged in
  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem('userRole');
    console.log('Retrieved user role:', role);
    
    if (!role) {
      // User is not logged in, redirect to login page
      console.log('No role found, redirecting to login page');
      router.push('/');
      return;
    }
    
    // User is logged in, set the role
    setUserRole(role);
    
    // Mark initialization as complete
    setIsInitializing(false);
  }, [router]);

  const cardData = [
    {
      title: "Distributor",
      description: "The admin can add/remove distributors who can give/revoke access of specific individuals.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      bgColor: "var(--distributor-add-color)",
    },
    {
      title: "Upload File",
      description: "This option is only accessible to Distributors who can upload files for processing.",
      icon: (
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
            d="M12 19V6m0 0l-5 5m5-5l5 5"
          />
        </svg>
      ),
      bgColor: "var(--upload-file-color)",
    },
    {
      title: "Send Notification",
      description: "Send notifications to students about their U-Pass status. This option has a view of students.",
      icon: (
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      bgColor: "var(--notification-color)",
    },
    {
      title: "Export Data",
      description: "Export student data to Excel for further analysis.",
      icon: (
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
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      bgColor: "var(--upload-file-color)",
    },
    {
      title: "Visualize Data",
      description: "View student data visualizations by semester, month, and day.",
      icon: (
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
      ),
      bgColor: "var(--notification-color)",
    },
  ];

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Check if disclaimer is not signed and show modal
  useEffect(() => {
    if (searchResult && searchResult.Disclaimer_Signed === null) {
      setIsDisclaimerModalOpen(true);
    }
  }, [searchResult]);

  const handleAllocateUPass = (upassId) => {
    if (!searchResult || !searchResult.Student_ID) return;
    
    setIsAllocatingUPass(true);
    setError(null);
    
    fetch('/api/allocate-upass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        pid: searchResult.Student_ID,
        upassId: upassId
      }),
    })
    .then(response => {
      // First check if the response is ok
      if (!response.ok) {
        // If not ok, parse the JSON to get the error details
        return response.json().then(errorData => {
          // Throw an error with the detailed error message
          throw new Error(errorData.error || errorData.message || 'Failed to allocate U-Pass');
        });
      }
      // If ok, parse the JSON and return it
      return response.json();
    })
    .then(data => {
      console.log('Allocate U-Pass response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to allocate U-Pass');
      }
      
      // Refresh the data to get the updated record
      return fetch(`/api/search-by-pid?pid=${searchResult.Student_ID}`)
        .then(refreshResponse => refreshResponse.json())
        .then(refreshData => {
          // Update with fresh data from the database
          setSearchResult(refreshData.data);
          setAllocateSuccess(true);
          setTimeout(() => setAllocateSuccess(false), 3000); // Hide success message after 3 seconds
        });
    })
    .catch(err => {
      console.error('Error allocating U-Pass:', err);
      
      // Format the error message to be more user-friendly
      let userFriendlyError = err.message || 'An error occurred while allocating U-Pass';
      
      // Check if it's a duplicate entry error
      if (userFriendlyError.includes('Duplicate entry') && userFriendlyError.includes('Active_U_Pass_Card')) {
        // Extract the UPass ID from the error message if possible
        const upassIdMatch = userFriendlyError.match(/'(\d+)'/);
        const upassId = upassIdMatch ? upassIdMatch[1] : 'this UPass';
        
        userFriendlyError = `This UPass card (${upassId}) is already assigned to another student. Please use a different card.`;
      }
      
      // Set the formatted error message
      setError(userFriendlyError);
    })
    .finally(() => {
      setIsAllocatingUPass(false);
      setIsNFCModalOpen(false);
    });
  };

  const handleDisclaimerConfirm = async () => {
    if (!searchResult || !searchResult.Student_ID) return;
    
    setIsUpdatingDisclaimer(true);
    setError(null);
    
    try {
      console.log('Sending update request for PID:', searchResult.Student_ID);
      
      const response = await fetch('/api/update-disclaimer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pid: searchResult.Student_ID }),
      });
      
      const data = await response.json();
      console.log('Update response:', data);
      
      if (!response.ok) {
        // If the response is not ok, throw an error with the detailed error message
        throw new Error(data.error || data.message || 'Failed to update disclaimer status');
      }
      
      // Refresh the data to get the updated record
      const refreshResponse = await fetch(`/api/search-by-pid?pid=${searchResult.Student_ID}`);
      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok) {
        // If refresh fails, still update the local state with boolean 1 (true)
        setSearchResult(prev => ({
          ...prev,
          Disclaimer_Signed: 1
        }));
      } else {
        // Update with fresh data from the database
        setSearchResult(refreshData.data);
      }
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error('Error updating disclaimer status:', err);
      
      // Format the error message to be more user-friendly
      let userFriendlyError = err.message || 'An error occurred while updating disclaimer status';
      
      // Make the error message more user-friendly
      if (userFriendlyError.includes('database') || userFriendlyError.includes('SQL')) {
        userFriendlyError = 'There was a problem updating the disclaimer status. Please try again later.';
      }
      
      // Set the formatted error message
      setError(userFriendlyError);
    } finally {
      setIsUpdatingDisclaimer(false);
      setIsDisclaimerModalOpen(false);
    }
  };

  const handleAddDistributor = (email) => {
    console.log('Adding distributor with email:', email);
    // Here you would typically make an API call to add the distributor
    // For now, we'll just show a success message
    setAddDistributorSuccess(true);
    setTimeout(() => setAddDistributorSuccess(false), 3000);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
    });

    const s3 = new AWS.S3();
    const params = {
      Bucket: bucketName,
      Key: `raw_data/${selectedFile.name}`,
      Body: selectedFile,
      ContentType: selectedFile.type,
    };

    try {
      await s3.upload(params).promise();
      alert("File uploaded successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center mx-auto px-10 py-1">
        {/* Show loading indicator while initializing */}
        {isInitializing ? (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#861F41] mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
              <p className="text-sm text-gray-500 mt-2">Please wait...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Search functionality - only visible for distributors */}
            {userRole === 'distributor' && (
          <>
            <div className="flex flex-col items-center w-full max-w-lg mx-auto mb-6">
              <div className="flex items-center border border-gray-300 rounded-full py-2 px-4 w-full" style={{ minHeight: '50px' }}>
                <input
                  className="appearance-none bg-transparent border-none w-full text-gray-700 py-1 px-2 leading-tight focus:outline-none"
                  type="text"
                  placeholder="Enter Student ID"
                  aria-label="Enter Student ID"
                  value={pid}
                  onChange={(e) => setPid(e.target.value)}
                />
                <button className="flex-shrink-0 bg-transparent border-none text-gray-700 py-1 px-2">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <button 
                className="mt-4 bg-[#861F41] text-white font-bold py-2 px-4 rounded"
                disabled={isUpdatingDisclaimer}
                onClick={async () => {
                  if (!pid || pid.length !== 9) {
                    setError('Please enter a valid 9-digit PID');
                    setSearchResult(null);
                    return;
                  }
                  
                  setIsLoading(true);
                  setError(null);
                  
                  try {
                    const response = await fetch(`/api/search-by-pid?pid=${pid}`);
                    const data = await response.json();
                    
                    if (!response.ok) {
                      // If the response is not ok, throw an error with the detailed error message
                      throw new Error(data.error || data.message || 'Failed to fetch student data');
                    }
                    
                    setSearchResult(data.data);
                  } catch (err) {
                    console.error('Error fetching student data:', err);
                    
                    // Format the error message to be more user-friendly
                    let userFriendlyError = err.message || 'An error occurred while fetching student data';
                    
                    // Make the error message more user-friendly
                    if (userFriendlyError.includes('No record found')) {
                      userFriendlyError = `No student record found for ID ${pid}. Please check the ID and try again.`;
                    } else if (userFriendlyError.includes('database') || userFriendlyError.includes('SQL')) {
                      userFriendlyError = 'There was a problem searching for the student. Please try again later.';
                    }
                    
                    // Set the formatted error message
                    setError(userFriendlyError);
                    setSearchResult(null);
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md w-full max-w-lg">
                {error}
              </div>
            )}
            
            {searchResult && (
              <div className="mt-6 p-6 bg-white shadow-md border border-gray-200 rounded-lg w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4 text-[#861F41]">U-Pass Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">U-Pass ID</p>
                    <p className="font-medium">{searchResult.U_Pass_ID}</p>
                  </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-sm text-gray-500">Student ID</p>
                        <p className="font-medium">{maskPid(searchResult.Student_ID)}</p>
                      </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{searchResult.First_Name} {searchResult.Last_Name}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{searchResult.Email}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Active U-Pass Card</p>
                    <p className="font-medium">{searchResult.Active_U_Pass_Card}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Replaced U-Pass Card</p>
                    <p className="font-medium">{searchResult.Replaced_U_Pass_Card}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Metro Account</p>
                    <p className="font-medium">{searchResult.Metro_Acct}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Distribution Date</p>
                    <p className="font-medium">
                      {searchResult.Distribution_Date && searchResult.Distribution_Date.includes('T') 
                        ? searchResult.Distribution_Date.split('T')[0] 
                        : searchResult.Distribution_Date}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Picked Up By</p>
                    <p className="font-medium">{searchResult.Picked_Up_By}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-sm text-gray-500">Disclaimer Signed</p>
                    <p className={`font-medium ${searchResult.Disclaimer_Signed ? 'text-green-600' : 'text-red-600 font-bold'}`}>
                      {searchResult.Disclaimer_Signed ? 'Yes' : 'No'}
                      {!searchResult.Disclaimer_Signed && (
                        <button 
                          onClick={() => setIsDisclaimerModalOpen(true)}
                          disabled={isUpdatingDisclaimer}
                          className="ml-2 text-xs bg-[#861F41] text-white px-2 py-1 rounded"
                        >
                          {isUpdatingDisclaimer ? 'Updating...' : 'Update'}
                        </button>
                      )}
                    </p>
                  </div>
                  {searchResult.Notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="font-medium">{searchResult.Notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {searchResult && (
              <div className="mt-4 flex justify-center w-full max-w-lg">
                <button
                  onClick={() => searchResult.Disclaimer_Signed && setIsNFCModalOpen(true)}
                  disabled={isAllocatingUPass || !searchResult.Disclaimer_Signed}
                  className={`font-bold py-2 px-6 rounded w-full ${
                    searchResult.Disclaimer_Signed 
                      ? 'bg-[#861F41] text-white hover:bg-[#6e1935]' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  title={!searchResult.Disclaimer_Signed ? "Disclaimer must be signed before allocating U-Pass" : ""}
                >
                  {isAllocatingUPass ? 'Allocating...' : 'Allocate U-Pass'}
                </button>
              </div>
            )}
          </>
            )}

            {/* Admin buttons - only visible for admins */}
            {userRole === 'admin' && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
            {cardData.map((card, index) => (
              <button
                key={index}
                className="flex items-center p-3 bg-white shadow-md border border-gray-100 rounded-full cursor-pointer"
                style={{ borderRadius: '50px' }}
                onClick={() => {
                  if (index === 0) {
                    // Navigate to the distributors page
                    router.push('/distributors');
                  } else if (index === 1) {
                    setIsModalOpen(true);
                  } else if (index === 2) {
                    // Navigate to the notifications page
                    router.push('/notifications');
                  } else if (index === 3) {
                    // Navigate to the export page
                    router.push('/export');
                  } else if (index === 4) {
                    // Open visualization options modal
                    setIsVisualizationOptionsModalOpen(true);
                  }
                }}
              >
                <div className="rounded-full p-3 mr-4" style={{ backgroundColor: card.bgColor }}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-md font-bold mb-1 text-gray-900 text-left">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 text-xs text-left">{card.description}</p>
                </div>
              </button>
            ))}
          </div>
            )}
          </>
        )}
      </main>
      <Footer />


      {updateSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Disclaimer status updated successfully!</p>
        </div>
      )}
      
      {allocateSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>U-Pass allocated successfully!</p>
        </div>
      )}

      {addDistributorSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>Distributor added successfully!</p>
        </div>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        selectedFile={selectedFile}
      />

      <DisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
        onConfirm={handleDisclaimerConfirm}
        studentInfo={searchResult}
      />
      
      <NFCModal
        isOpen={isNFCModalOpen}
        onClose={() => setIsNFCModalOpen(false)}
        onConfirm={handleAllocateUPass}
        studentInfo={searchResult}
      />
      
      <AddDistributorModal
        isOpen={isAddDistributorModalOpen}
        onClose={() => setIsAddDistributorModalOpen(false)}
        onConfirm={handleAddDistributor}
      />
      
      <VisualizationOptionsModal
        isOpen={isVisualizationOptionsModalOpen}
        onClose={() => setIsVisualizationOptionsModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
