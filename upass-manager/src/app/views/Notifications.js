"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MessageTemplateModal from '../components/MessageTemplateModal';
import EditStudentModal from '../components/EditStudentModal';
import ViewStudentModal from '../components/ViewStudentModal';
import { maskPid } from '../utils/maskPid';

const Notifications = () => {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Template state
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [selectedEditTemplate, setSelectedEditTemplate] = useState(null);
  
  // Notification results state
  const [notificationResults, setNotificationResults] = useState(null);
  
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
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [recordUpdateSuccess, setRecordUpdateSuccess] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
    fetchTemplates();
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

  const handleSelectRecord = (email) => {
    setSelectedRecords(prev => {
      if (prev.includes(email)) {
        return prev.filter(recordEmail => recordEmail !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(record => record.Email));
    }
  };

  // Fetch message templates
  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    
    try {
      // Get userRole for authentication
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch('/api/message-templates', {
        headers: {
          'Authorization': userRole || '',
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch templates');
      }
      
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      // Silently fail for templates - not critical
    } finally {
      setLoadingTemplates(false);
    }
  };
  
  // Add a new template
  const handleAddTemplate = async (templateData) => {
    try {
      // Get userRole for authentication
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch('/api/message-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userRole || '',
        },
        body: JSON.stringify(templateData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create template');
      }
      
      // Add the new template to the state
      setTemplates(prev => [data.template, ...prev]);
      setShowAddTemplateModal(false);
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err.message || 'An error occurred while creating the template');
    }
  };
  
  // Update an existing template
  const handleUpdateTemplate = async (templateData) => {
    try {
      // Get userRole for authentication
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch('/api/message-templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userRole || '',
        },
        body: JSON.stringify(templateData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update template');
      }
      
      // Update the template in the state
      setTemplates(prev => 
        prev.map(template => 
          template.id === templateData.id ? data.template : template
        )
      );
      setShowEditTemplateModal(false);
      setSelectedEditTemplate(null);
    } catch (err) {
      console.error('Error updating template:', err);
      setError(err.message || 'An error occurred while updating the template');
    }
  };
  
  // Delete a template
  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      // Get userRole for authentication
      const userRole = localStorage.getItem('userRole');
      
      const response = await fetch(`/api/message-templates?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': userRole || '',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete template');
      }
      
      // Remove the template from the state
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err.message || 'An error occurred while deleting the template');
    }
  };
  
  // Use a template by setting the subject and message fields
  const handleUseTemplate = (template) => {
    setSubject(template.title);
    setMessage(template.message);
  };
  
  // Edit a template
  const handleEditTemplate = (template) => {
    setSelectedEditTemplate(template);
    setShowEditTemplateModal(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleSaveStudent = async (updatedStudent) => {
    try {
      const response = await fetch('/api/update-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update student record');
      }
      
      // Update the records state with the updated student
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.Student_ID === updatedStudent.Student_ID ? updatedStudent : record
        )
      );
      
      // Close the modal
      setEditModalOpen(false);
      setSelectedStudent(null);
      
      // Show success message for record update
      setRecordUpdateSuccess(true);
      setTimeout(() => {
        setRecordUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating student record:', err);
      setError(err.message || 'An error occurred while updating student record');
    }
  };

  const handleSendNotification = async () => {
    if (selectedRecords.length === 0) {
      setError('Please select at least one recipient');
      return;
    }
    
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setSendingNotification(true);
    setError(null);
    setNotificationResults(null);
    
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: selectedRecords,
          subject: subject,
          message: message
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send notification');
      }
      
      // Store the detailed results
      setNotificationResults(data);
      setNotificationSuccess(true);
      setSubject('');
      setMessage('');
      setSelectedRecords([]);
      
      // We'll no longer automatically hide the success message
      // The user can close it manually or send another notification
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.message || 'An error occurred while sending notification');
    } finally {
      setSendingNotification(false);
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

  // If still checking session, show loading spinner
  if (checkingSession) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#861F41] mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#861F41]">Send Notifications</h1>
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
        
        {notificationSuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
            Notification sent successfully!
          </div>
        )}
        
        {recordUpdateSuccess && (
          <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
            Record updated successfully!
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
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
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
                          checked={selectedRecords.includes(record.Email)}
                          onChange={() => handleSelectRecord(record.Email)}
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
                          {record.Distribution_Date 
                            ? (record.Distribution_Date.includes('T') 
                                ? record.Distribution_Date.split('T')[0] 
                                : record.Distribution_Date)
                            : 'Not Distributed'}
                        </td>
                      )}
                      {visibleColumns.Picked_Up_By && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.Picked_Up_By || 'Not Picked Up'}
                        </td>
                      )}
                      {visibleColumns.Notes && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative group">
                        <div className="relative">
                          {record.Notes ? (
                            <>
                              <span>{record.Notes.length > 10 ? record.Notes.substring(0, 10) + '..' : record.Notes}</span>
                              {record.Notes.length > 10 && (
                                <div
                                  className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 max-w-xs z-10 tooltip"
                                  style={{ whiteSpace: 'normal' }} // Allow wrapping of long text
                                >
                                  {record.Notes}
                                  <div className="absolute top-full left-4 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                </div>
                              )}
                            </>
                          ) : (
                            'No Notes'
                          )}
                        </div>
                      </td>
                      )}
                      {visibleColumns.U_Pass_ID && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.U_Pass_ID || 'None'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* View button */}
                          <button
                            onClick={() => handleViewStudent(record)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="View Student Record"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          
                          {/* Edit button */}
                          <button
                            onClick={() => handleEditStudent(record)}
                            className="text-[#861F41] hover:text-[#6e1935] transition"
                            title="Edit Student Record"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
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
        
        {/* Message Templates */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#861F41]">Message Templates</h2>
            <button
              onClick={() => setShowAddTemplateModal(true)}
              disabled={templates.length >= 6}
              className={`px-3 py-1 ${
                templates.length >= 6 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#861F41] hover:bg-[#6e1935]'
              } text-white rounded transition flex items-center`}
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Template
              {templates.length >= 6 && (
                <span className="ml-1 text-xs">(Limit reached)</span>
              )}
            </button>
          </div>
          
          {loadingTemplates ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#861F41]"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No templates found. Create a template to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-[#861F41] mb-2 flex-grow">{template.title}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-gray-500 hover:text-[#861F41] p-1"
                        title="Edit Template"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-gray-500 hover:text-red-600 p-1"
                        title="Delete Template"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {template.message.length > 150 
                      ? template.message.substring(0, 150) + '...' 
                      : template.message}
                  </p>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="text-sm text-[#861F41] hover:text-[#6e1935] transition"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Message input and send button */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">Compose Notification</h2>
          
          {/* Notification results displayed right above the form */}
          {notificationSuccess && notificationResults && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
              <div className="flex justify-between items-center">
                <div className="font-semibold mb-2">Notification Results:</div>
                <button 
                  onClick={() => setNotificationSuccess(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div>
                <p className="mb-2">
                  <span className="font-medium">Successfully sent to: </span> 
                  {notificationResults.sent} recipient(s)
                  {notificationResults.results?.successful?.length > 0 && (
                    <span className="block mt-1 text-sm">
                      {notificationResults.results.successful.join(', ')}
                    </span>
                  )}
                </p>
                
                {notificationResults.results?.failed?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Failed to send to: {notificationResults.results.failed.length} recipient(s)</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      {notificationResults.results.failed.map((failure, index) => (
                        <li key={index}>
                          {failure.email}: {failure.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter notification subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-transparent"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-transparent"
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedRecords.length} recipient{selectedRecords.length !== 1 ? 's' : ''} selected
            </div>
            <button
              onClick={handleSendNotification}
              disabled={sendingNotification || selectedRecords.length === 0 || !subject.trim() || !message.trim()}
              className={`px-4 py-2 rounded ${
                sendingNotification || selectedRecords.length === 0 || !subject.trim() || !message.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#861F41] text-white hover:bg-[#6e1935]'
              } transition`}
            >
              {sendingNotification ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStudent(null);
        }}
        onSave={handleSaveStudent}
        studentInfo={selectedStudent}
      />
      
      {/* View Student Modal */}
      <ViewStudentModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedStudent(null);
        }}
        studentInfo={selectedStudent}
      />
      
      {/* Template Modals */}
      <MessageTemplateModal
        isOpen={showAddTemplateModal}
        onClose={() => setShowAddTemplateModal(false)}
        onSave={handleAddTemplate}
        template={null}
      />
      
      <MessageTemplateModal
        isOpen={showEditTemplateModal}
        onClose={() => {
          setShowEditTemplateModal(false);
          setSelectedEditTemplate(null);
        }}
        onSave={handleUpdateTemplate}
        template={selectedEditTemplate}
      />
    </div>
  );
};

export default Notifications;
