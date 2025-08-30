"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const UPassCollectionStats = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Data states
  const [currentData, setCurrentData] = useState([]);
  const [fall2024Data, setFall2024Data] = useState([]);
  const [spring2024Data, setSpring2024Data] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('current');
  
  // Add a key state to force re-render of charts when semester changes
  const [chartKey, setChartKey] = useState(0);
  
  // Chart colors
  const COLORS = ['#861F41', '#CF4420', '#E87722', '#FFC82E', '#6EAE50'];
  
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
    
    // Fetch data for all semesters
    fetchData();
  }, [router]);
  
  // Fetch data for all semesters
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current semester data
      const currentResponse = await fetch('/api/get-all-records?table=u_pass_manager_current&limit=10000');
      const currentData = await currentResponse.json();
      
      // Fetch fall 2024 semester data
      const fall2024Response = await fetch('/api/get-all-records?table=u_pass_manager_fall_2024&limit=10000');
      const fall2024Data = await fall2024Response.json();
      
      // Fetch spring 2024 semester data
      const spring2024Response = await fetch('/api/get-all-records?table=u_pass_manager_spring_2024&limit=10000');
      const spring2024Data = await spring2024Response.json();
      
      if (!currentResponse.ok || !fall2024Response.ok || !spring2024Response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      setCurrentData(currentData.records || []);
      setFall2024Data(fall2024Data.records || []);
      setSpring2024Data(spring2024Data.records || []);
      
      // Set initial filtered data to current semester
      setFilteredData(currentData.records || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters when semester changes
  useEffect(() => {
    if (currentData.length > 0 || fall2024Data.length > 0 || spring2024Data.length > 0) {
      applyFilters();
      // Increment chart key to force re-render of charts
      setChartKey(prevKey => prevKey + 1);
    }
  }, [selectedSemester, currentData, fall2024Data, spring2024Data]);
  
  // Function to apply filters
  const applyFilters = () => {
    let data = [];
    
    // Select data based on semester
    switch (selectedSemester) {
      case 'current':
        data = [...currentData];
        break;
      case 'fall2024':
        data = [...fall2024Data];
        break;
      case 'spring2024':
        data = [...spring2024Data];
        break;
      default:
        data = [...currentData];
    }
    
    setFilteredData(data);
  };
  
  // Generate pie chart data for U-Pass collection
  const generateUPassCollectionData = () => {
    const collectedCount = filteredData.filter(record => record.Active_U_Pass_Card).length;
    const notCollectedCount = filteredData.filter(record => !record.Active_U_Pass_Card).length;
    const totalCount = collectedCount + notCollectedCount;
    
    const collectedPercentage = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;
    const notCollectedPercentage = totalCount > 0 ? (notCollectedCount / totalCount) * 100 : 0;
    
    return [
      { name: 'Collected', value: collectedCount, percentage: collectedPercentage.toFixed(1) },
      { name: 'Not Collected', value: notCollectedCount, percentage: notCollectedPercentage.toFixed(1) }
    ];
  };
  
  // Generate pie chart data for disclaimer signed status
  const generateDisclaimerSignedData = () => {
    // Handle different possible values for Disclaimer_Signed
    const signedCount = filteredData.filter(record => {
      if (record.Disclaimer_Signed === null || record.Disclaimer_Signed === undefined) {
        return false;
      }
      
      // Handle string values like "Yes" or "No"
      if (typeof record.Disclaimer_Signed === 'string') {
        return record.Disclaimer_Signed.toLowerCase() === 'yes';
      }
      
      // Handle numeric values (0 or 1)
      if (typeof record.Disclaimer_Signed === 'number') {
        return record.Disclaimer_Signed === 1;
      }
      
      // Handle boolean values
      if (typeof record.Disclaimer_Signed === 'boolean') {
        return record.Disclaimer_Signed;
      }
      
      // Default case
      return Boolean(record.Disclaimer_Signed);
    }).length;
    
    const notSignedCount = filteredData.length - signedCount;
    const totalCount = filteredData.length;
    
    const signedPercentage = totalCount > 0 ? (signedCount / totalCount) * 100 : 0;
    const notSignedPercentage = totalCount > 0 ? (notSignedCount / totalCount) * 100 : 0;
    
    return [
      { name: 'Signed', value: signedCount, percentage: signedPercentage.toFixed(1) },
      { name: 'Not Signed', value: notSignedCount, percentage: notSignedPercentage.toFixed(1) }
    ];
  };
  
  // Generate pie chart data for replacement status
  const generateReplacementData = () => {
    // Get the number of active U-Pass users
    const activeUPassUsers = filteredData.filter(record => record.Active_U_Pass_Card).length;
    
    // Get the number of students with replacements (non-empty Replaced_U_Pass_Card field)
    const replacedCount = filteredData.filter(record => {
      // Check if record has Active_U_Pass_Card
      if (!record.Active_U_Pass_Card) return false;
      
      // Check if Replaced_U_Pass_Card exists and is not empty
      // Handle null, undefined, or empty string cases
      if (!record.Replaced_U_Pass_Card) return false;
      
      // If it's a string, check if it's not just whitespace
      if (typeof record.Replaced_U_Pass_Card === 'string') {
        return record.Replaced_U_Pass_Card.trim() !== '';
      }
      
      // If it's not a string but has some value, consider it valid
      return true;
    }).length;
    
    const notReplacedCount = activeUPassUsers - replacedCount;
    
    const replacedPercentage = activeUPassUsers > 0 ? (replacedCount / activeUPassUsers) * 100 : 0;
    const notReplacedPercentage = activeUPassUsers > 0 ? (notReplacedCount / activeUPassUsers) * 100 : 0;
    
    return [
      { name: 'Replaced', value: replacedCount, percentage: replacedPercentage.toFixed(1) },
      { name: 'Not Replaced', value: notReplacedCount, percentage: notReplacedPercentage.toFixed(1) }
    ];
  };
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-[#861F41]">{`Count: ${payload[0].value}`}</p>
          <p className="text-[#861F41]">{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  
  // If still checking session, show loading spinner
  if (checkingSession) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#861F41] mb-4"></div>
            <p className="text-gray-600 font-medium">Loading statistics...</p>
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
          <h1 className="text-2xl font-bold text-[#861F41]">U-Pass Collection Statistics</h1>
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
        
        {/* Semester Filter */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
              >
                <option value="current">Spring 2025</option>
                <option value="fall2024">Fall 2024</option>
                <option value="spring2024">Spring 2024</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* U-Pass Collection Statistics */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">U-Pass Collection Statistics</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#861F41]"></div>
              <p className="ml-2 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div>
              {/* Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-md font-semibold mb-2">Summary</h3>
                <p className="text-gray-700">
                  <span className="font-bold">Total Students:</span> {filteredData.length}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Semester:</span> {
                    selectedSemester === 'current' ? 'Spring 2025' :
                    selectedSemester === 'fall2024' ? 'Fall 2024' : 'Spring 2024'
                  }
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Students with U-Pass:</span> {
                    filteredData.filter(record => record.Active_U_Pass_Card).length
                  }
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Students without U-Pass:</span> {
                    filteredData.filter(record => !record.Active_U_Pass_Card).length
                  }
                </p>
              </div>
              
              {/* Chart Grid with Sections and Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {/* U-Pass Collection Section */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-bold text-center mb-4">U-Pass Collection</h4>
                  <p className="text-sm text-gray-600 text-center mb-4">Shows the percentage of students who have collected their U-Pass cards.</p>
                  
                  {/* U-Pass Collection Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          key={`upass-collection-${chartKey}`}
                          data={generateUPassCollectionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {generateUPassCollectionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* U-Pass Collection Stats */}
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Collected:</span> {
                          filteredData.filter(record => record.Active_U_Pass_Card).length
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Not Collected:</span> {
                          filteredData.filter(record => !record.Active_U_Pass_Card).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Disclaimer Signed Section */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-bold text-center mb-4">Disclaimer Signed</h4>
                  <p className="text-sm text-gray-600 text-center mb-4">Shows the percentage of students who have signed the disclaimer.</p>
                  
                  {/* Disclaimer Signed Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          key={`disclaimer-signed-${chartKey}`}
                          data={generateDisclaimerSignedData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {generateDisclaimerSignedData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Disclaimer Signed Stats */}
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Signed:</span> {
                          filteredData.filter(record => record.Disclaimer_Signed).length
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Not Signed:</span> {
                          filteredData.filter(record => !record.Disclaimer_Signed).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Replacement Status Section */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <h4 className="font-bold text-center mb-4">Replacement Status</h4>
                  <p className="text-sm text-gray-600 text-center mb-4">Shows the percentage of active U-Pass users who have replacements.</p>
                  
                  {/* Replacement Status Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          key={`replacement-status-${chartKey}`}
                          data={generateReplacementData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={1000}
                        >
                          {generateReplacementData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Replacement Status Stats */}
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Replaced:</span> {
                          filteredData.filter(record => {
                            // Check if record has Active_U_Pass_Card
                            if (!record.Active_U_Pass_Card) return false;
                            
                            // Check if Replaced_U_Pass_Card exists and is not empty
                            if (!record.Replaced_U_Pass_Card) return false;
                            
                            // If it's a string, check if it's not just whitespace
                            if (typeof record.Replaced_U_Pass_Card === 'string') {
                              return record.Replaced_U_Pass_Card.trim() !== '';
                            }
                            
                            // If it's not a string but has some value, consider it valid
                            return true;
                          }).length
                        }
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-gray-700 text-sm">
                        <span className="font-bold">Not Replaced:</span> {
                          filteredData.filter(record => record.Active_U_Pass_Card).length - 
                          filteredData.filter(record => {
                            // Check if record has Active_U_Pass_Card
                            if (!record.Active_U_Pass_Card) return false;
                            
                            // Check if Replaced_U_Pass_Card exists and is not empty
                            if (!record.Replaced_U_Pass_Card) return false;
                            
                            // If it's a string, check if it's not just whitespace
                            if (typeof record.Replaced_U_Pass_Card === 'string') {
                              return record.Replaced_U_Pass_Card.trim() !== '';
                            }
                            
                            // If it's not a string but has some value, consider it valid
                            return true;
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UPassCollectionStats;
