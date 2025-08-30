"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { maskPid } from '../utils/maskPid';
import * as XLSX from 'xlsx';

const Export = () => {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [sendingToWMATA, setSendingToWMATA] = useState(false);
  const [sendToWMATASuccess, setSendToWMATASuccess] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      // User is not logged in, redirect to login page
      router.push('/');
      return;
    }
    
    // User is logged in, continue loading the page
    setCheckingSession(false);
  }, [router]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [filters, setFilters] = useState({
    First_Name: '',
    Last_Name: '',
    Email: '',
    Active_U_Pass_Card: '',
    Disclaimer_Signed: '',
    Metro_Acct: '',
    Distribution_Date: '',
    Picked_Up_By: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    Student_ID: true,
    First_Name: true,
    Last_Name: true,
    Email: true,
    Active_U_Pass_Card: true,
    Replaced_U_Pass_Card: true,
    Disclaimer_Signed: true,
    Metro_Acct: true,
    Distribution_Date: true,
    Picked_Up_By: true,
    Notes: true,
    U_Pass_ID: true
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Column definitions with display names
  const columnDefs = [
    { key: 'Student_ID', label: 'Student_ID' },
    { key: 'First_Name', label: 'First Name' },
    { key: 'Last_Name', label: 'Last Name' },
    { key: 'Email', label: 'Email' },
    { key: 'Active_U_Pass_Card', label: 'Active U-Pass' },
    { key: 'Replaced_U_Pass_Card', label: 'Replaced U-Pass' },
    { key: 'Disclaimer_Signed', label: 'Disclaimer' },
    { key: 'Metro_Acct', label: 'Metro Account' },
    { key: 'Distribution_Date', label: 'Distribution Date' },
    { key: 'Picked_Up_By', label: 'Picked Up By' },
    { key: 'Notes', label: 'Notes' },
    { key: 'U_Pass_ID', label: 'U-Pass ID' }
  ];

  // Fetch records on component mount and when pagination or filters change
  useEffect(() => {
    fetchRecords();
  }, [pagination.page, pagination.limit, filters]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string with pagination and filters
      let queryString = `page=${pagination.page}&limit=${pagination.limit}`;
      
      // Add filters to query string
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          queryString += `&${key}=${encodeURIComponent(value)}`;
        }
      });
      
      const response = await fetch(`/api/get-all-records?${queryString}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch records');
      }
      
      setRecords(data.records);
      setPagination(prev => ({
        ...prev,
        ...data.pagination
      }));
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.message || 'An error occurred while fetching records');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

  const handleSelectRecord = (id) => {
    setSelectedRecords(prev => {
      if (prev.includes(id)) {
        return prev.filter(recordId => recordId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(record => record.Student_ID));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when applying filters
    }));
  };

  const resetFilters = () => {
    setFilters({
      First_Name: '',
      Last_Name: '',
      Email: '',
      Active_U_Pass_Card: '',
      Disclaimer_Signed: '',
      Metro_Acct: '',
      Distribution_Date: '',
      Picked_Up_By: ''
    });
  };

  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Function to format date from YYYY-MM-DD to MM-DD-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Function to prepare data for export
  const prepareDataForExport = async () => {
    setError(null);
    
    try {
      // Fetch all records for export (no pagination)
      let queryString = 'limit=100000'; // Set a very high limit to ensure we get all records
      
      // Add filters to query string
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') {
          queryString += `&${key}=${encodeURIComponent(value)}`;
        }
      });
      
      const response = await fetch(`/api/get-all-records?${queryString}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch records for export');
      }
      
      // Filter records if any are selected
      let recordsToExport = data.records;
      if (selectedRecords.length > 0) {
        recordsToExport = recordsToExport.filter(record => 
          selectedRecords.includes(record.Student_ID)
        );
      }
      
      // Filter columns based on visibility
      const visibleColumnKeys = Object.keys(visibleColumns).filter(key => visibleColumns[key]);
      
      // Create worksheet data
      const worksheetData = recordsToExport.map(record => {
        const row = {};
        
        visibleColumnKeys.forEach(key => {
          // Format date fields
          if (key === 'Distribution_Date' && record[key]) {
            row[key] = formatDate(record[key]);
          } 
          // Format boolean fields
          else if (key === 'Disclaimer_Signed') {
            row[key] = record[key] ? 'Yes' : 'No';
          } 
          // Regular fields
          else {
            row[key] = record[key] || '';
          }
        });
        
        return row;
      });
      
      // Create column headers with display names
      const headers = {};
      visibleColumnKeys.forEach(key => {
        const column = columnDefs.find(col => col.key === key);
        headers[key] = column ? column.label : key;
      });
      
      return { headers, worksheetData };
    } catch (err) {
      console.error('Error preparing data for export:', err);
      setError(err.message || 'An error occurred while preparing data for export');
      throw err;
    }
  };

  // Function to export data to Excel
  const exportToExcel = async () => {
    setExporting(true);
    
    try {
      const { headers, worksheetData } = await prepareDataForExport();
      
      // Create worksheet with headers
      const worksheet = XLSX.utils.json_to_sheet([headers, ...worksheetData], {
        skipHeader: true // Skip default headers since we're providing custom ones
      });
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
      
      // Generate Excel file
      XLSX.writeFile(workbook, 'upass_students_export.xlsx');
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      setError(err.message || 'An error occurred while exporting to Excel');
    } finally {
      setExporting(false);
    }
  };

  // Function to send data to WMATA
  const sendToWMATA = async () => {
    setSendingToWMATA(true);
    
    try {
      const { headers, worksheetData } = await prepareDataForExport();
      
      // This is a placeholder for the actual API call
      // In a real implementation, you would send the data to the WMATA API
      console.log('Sending data to WMATA API:', { headers, worksheetData });
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just log success
      console.log('Successfully sent data to WMATA');
      
      setSendToWMATASuccess(true);
      setTimeout(() => setSendToWMATASuccess(false), 3000);
    } catch (err) {
      console.error('Error sending data to WMATA:', err);
      setError(err.message || 'An error occurred while sending data to WMATA');
    } finally {
      setSendingToWMATA(false);
    }
  };

  // If still checking session, show loading spinner
  if (checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#861F41] mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading export tools...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#861F41]">Export Student Data</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {exportSuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
            Data exported successfully!
          </div>
        )}
        
        {sendToWMATASuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
            Data sent to WMATA successfully!
          </div>
        )}
        
        {/* Filter Panel */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-[#861F41] hover:text-[#6e1935] transition"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="flex items-center text-[#861F41] hover:text-[#6e1935] transition"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {showColumnSelector ? 'Hide Columns' : 'Show/Hide Columns'}
            </button>
          </div>
          
          {showFilters && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={filters.First_Name}
                    onChange={(e) => handleFilterChange('First_Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                    placeholder="Filter by first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={filters.Last_Name}
                    onChange={(e) => handleFilterChange('Last_Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                    placeholder="Filter by last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="text"
                    value={filters.Email}
                    onChange={(e) => handleFilterChange('Email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                    placeholder="Filter by email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">U-Pass ID</label>
                  <input
                    type="text"
                    value={filters.Active_U_Pass_Card}
                    onChange={(e) => handleFilterChange('Active_U_Pass_Card', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                    placeholder="Filter by U-Pass ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disclaimer Signed</label>
                  <select
                    value={filters.Disclaimer_Signed}
                    onChange={(e) => handleFilterChange('Disclaimer_Signed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                  >
                    <option value="">All</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Reset Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-[#861F41] text-white rounded hover:bg-[#6e1935] transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          {showColumnSelector && (
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Show/Hide Columns</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {columnDefs.map(column => (
                  <div key={column.key} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`column-${column.key}`}
                      checked={visibleColumns[column.key]}
                      onChange={() => toggleColumnVisibility(column.key)}
                      className="h-4 w-4 text-[#861F41] focus:ring-[#861F41] border-gray-300 rounded"
                    />
                    <label htmlFor={`column-${column.key}`} className="ml-2 text-sm text-gray-700">
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#861F41] focus:ring-[#861F41] border-gray-300 rounded"
                        checked={selectedRecords.length === records.length && records.length > 0}
                        onChange={handleSelectAll}
                      />
                      <span className="ml-2">Select</span>
                    </div>
                  </th>
                  {columnDefs.map(column => (
                    visibleColumns[column.key] && (
                      <th 
                        key={column.key}
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#861F41]"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading records...</p>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                      No records found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.Student_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-[#861F41] focus:ring-[#861F41] border-gray-300 rounded"
                          checked={selectedRecords.includes(record.Student_ID)}
                          onChange={() => handleSelectRecord(record.Student_ID)}
                        />
                      </td>
                      {visibleColumns.Student_ID && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {maskPid(record.Student_ID)}
                        </td>
                      )}
                      {visibleColumns.First_Name && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.First_Name}
                        </td>
                      )}
                      {visibleColumns.Last_Name && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Last_Name}
                        </td>
                      )}
                      {visibleColumns.Email && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Email}
                        </td>
                      )}
                      {visibleColumns.Active_U_Pass_Card && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Active_U_Pass_Card || 'Not Allocated'}
                        </td>
                      )}
                      {visibleColumns.Replaced_U_Pass_Card && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Replaced_U_Pass_Card || 'None'}
                        </td>
                      )}
                      {visibleColumns.Disclaimer_Signed && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.Disclaimer_Signed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.Disclaimer_Signed ? 'Signed' : 'Not Signed'}
                          </span>
                        </td>
                      )}
                      {visibleColumns.Metro_Acct && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Metro_Acct || 'None'}
                        </td>
                      )}
                      {visibleColumns.Distribution_Date && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Distribution_Date ? formatDate(record.Distribution_Date) : 'Not Distributed'}
                        </td>
                      )}
                      {visibleColumns.Picked_Up_By && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Picked_Up_By || 'Not Picked Up'}
                        </td>
                      )}
                      {visibleColumns.Notes && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Notes || 'No Notes'}
                        </td>
                      )}
                      {visibleColumns.U_Pass_ID && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.U_Pass_ID || 'None'}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{records.length}</span> of{' '}
                  <span className="font-medium">{pagination.totalRecords}</span> results
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-1 rounded ${
                    pagination.hasPrevPage 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1 bg-[#861F41] text-white rounded">
                  {pagination.page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-1 rounded ${
                    pagination.hasNextPage 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Export buttons */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">Export Data</h2>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedRecords.length > 0 
                ? `${selectedRecords.length} record${selectedRecords.length !== 1 ? 's' : ''} selected for export` 
                : 'All records will be exported'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToExcel}
                disabled={exporting || sendingToWMATA || records.length === 0}
                className={`px-4 py-2 rounded flex items-center ${
                  exporting || sendingToWMATA || records.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#861F41] text-white hover:bg-[#6e1935]'
                } transition`}
              >
                <svg 
                  className="h-5 w-5 mr-2" 
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
                {exporting ? 'Exporting...' : 'Download Excel'}
              </button>
              
              <button
                onClick={sendToWMATA}
                disabled={true} // Greyed out as requested
                className="px-4 py-2 rounded flex items-center bg-gray-300 text-gray-500 cursor-not-allowed transition"
              >
                <svg 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                  />
                </svg>
                {sendingToWMATA ? 'Sending...' : 'Send to WMATA'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Export;
