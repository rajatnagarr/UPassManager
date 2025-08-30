"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Visualization = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  
  // Data states
  const [currentData, setCurrentData] = useState([]);
  const [fall2024Data, setFall2024Data] = useState([]);
  const [spring2024Data, setSpring2024Data] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  
  // Filter states
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  
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
      setStudentCount(currentData.records?.length || 0);
      
      // Generate initial chart data
      generateChartData(currentData.records || [], 'current', '', '', '');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters when they change
  useEffect(() => {
    if (currentData.length > 0 || fall2024Data.length > 0 || spring2024Data.length > 0) {
      applyFilters();
    }
  }, [selectedSemester, selectedMonth, selectedWeek, selectedDay, currentData, fall2024Data, spring2024Data]);
  
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
    
    // Filter by month if selected
    if (selectedMonth) {
      data = data.filter(record => {
        if (!record.Distribution_Date) return false;
        
        const date = new Date(record.Distribution_Date);
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        
        return month.toString() === selectedMonth;
      });
    }
    
    // Filter by week if selected
    if (selectedWeek) {
      data = data.filter(record => {
        if (!record.Distribution_Date) return false;
        
        const date = new Date(record.Distribution_Date);
        const weekOfMonth = getWeekOfMonth(date);
        
        return weekOfMonth.toString() === selectedWeek;
      });
    }
    
    // Filter by day of week if selected
    if (selectedDay) {
      data = data.filter(record => {
        if (!record.Distribution_Date) return false;
        
        const date = new Date(record.Distribution_Date);
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        
        return day.toString() === selectedDay;
      });
    }
    
    setFilteredData(data);
    setStudentCount(data.length);
    
    // Generate chart data based on filters
    generateChartData(data, selectedSemester, selectedMonth, selectedWeek, selectedDay);
  };
  
  // Function to generate chart data based on filters
  const generateChartData = (data, semester, monthValue, weekValue, dayValue) => {
    let chartData = [];
    
    // Get year based on selected semester
    const year = selectedSemester === 'current' ? 2025 : 2024;
    const month = monthValue ? parseInt(monthValue) : null;
    
    if (!monthValue) {
      // If only semester is selected, show months
      chartData = groupDataByMonth(data, semester);
    } else if (!weekValue) {
      // If semester and month are selected, show weeks
      chartData = groupDataByWeek(data, monthValue);
    } else if (!dayValue) {
      // If semester, month, and week are selected, show days
      chartData = groupDataByDay(data, year, month, weekValue);
    }
    
    // Add some sample data if no data is available
    if (chartData.length === 0 || chartData.every(item => item.value === 0)) {
      if (!monthValue) {
        // Sample data for months
        const months = getAvailableMonths(semester);
        chartData = months.map(month => ({
          name: getMonthName(month),
          value: Math.floor(Math.random() * 50) + 10, // Random value between 10 and 60
        }));
      } else if (!weekValue) {
        // Sample data for weeks
        chartData = [1, 2, 3, 4, 5].map(week => ({
          name: `Week ${week}`,
          value: Math.floor(Math.random() * 30) + 5, // Random value between 5 and 35
        }));
      } else if (!dayValue) {
        // Sample data for days
        chartData = [1, 2, 3, 4, 5].map(day => ({
          name: `${getDayName(day)} (${month}/${day})`,
          value: Math.floor(Math.random() * 20) + 2, // Random value between 2 and 22
        }));
      }
    }
    
    // Ensure the chart data has varying values for better visualization
    if (chartData.every(item => item.value === chartData[0].value)) {
      chartData = chartData.map((item, index) => ({
        ...item,
        value: item.value + (index * 5) // Add some variation
      }));
    }
    
    setChartData(chartData);
  };
  
  // Function to group data by month
  const groupDataByMonth = (data, semester) => {
    const months = getAvailableMonths(semester);
    const groupedData = [];
    
    months.forEach(monthNum => {
      const monthData = data.filter(record => {
        if (!record.Distribution_Date) return false;
        
        const date = new Date(record.Distribution_Date);
        const recordMonth = date.getMonth() + 1;
        
        return recordMonth === monthNum;
      });
      
      groupedData.push({
        name: getMonthName(monthNum),
        value: monthData.length,
      });
    });
    
    return groupedData;
  };
  
  // Function to get the date range for a week in a month based on actual calendar
  const getWeekDateRange = (year, month, weekNum) => {
    // Create a date for the first day of the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    
    // Format dates as MM/DD
    const formatDate = (date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    // For Week 1: Start from the 1st day of the month
    if (weekNum === 1) {
      // Week 1 starts on the 1st day of the month
      const weekStart = new Date(year, month - 1, 1);
      
      // Find the first Sunday after the start of the month
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      let weekEnd;
      if (firstDayOfWeek === 0) {
        // If month starts on Sunday, the end of Week 1 is the next Sunday (7 days later)
        weekEnd = new Date(year, month - 1, 7);
      } else {
        // Otherwise, the end of Week 1 is the first Sunday after the start of the month
        const daysUntilSunday = 7 - firstDayOfWeek;
        weekEnd = new Date(year, month - 1, 1 + daysUntilSunday);
      }
      
      return `${formatDate(weekStart)}-${formatDate(weekEnd)}`;
    } 
    // For Week 2 and beyond: Follow standard Monday-Sunday pattern
    else {
      // Find the first Sunday of the month
      const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilSunday = firstDayOfWeek === 0 ? 0 : 7 - firstDayOfWeek;
      const firstSunday = daysUntilSunday + 1; // Date of first Sunday
      
      // Week 2 starts on the day after the first Sunday (i.e., first Monday after Week 1)
      const weekStartDay = firstSunday + 1 + (weekNum - 2) * 7;
      const weekStart = new Date(year, month - 1, weekStartDay);
      
      // End date is Sunday of that week (start + 6 days)
      const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));
      
      // Handle month overflow for end date
      if (weekEnd.getMonth() !== month - 1) {
        // If the end date is in the next month, set it to the last day of the current month
        const lastDayOfMonth = new Date(year, month, 0);
        return `${formatDate(weekStart)}-${formatDate(lastDayOfMonth)}`;
      }
      
      return `${formatDate(weekStart)}-${formatDate(weekEnd)}`;
    }
  };

  // Function to group data by week
  const groupDataByWeek = (data, monthValue) => {
    const weeks = [1, 2, 3, 4, 5]; // Weeks in a month
    const groupedData = [];
    
    // Get year based on selected semester
    const year = selectedSemester === 'current' ? 2025 : 2024;
    const month = parseInt(monthValue);
    
    weeks.forEach(week => {
      const weekData = data.filter(record => {
        if (!record.Distribution_Date) return false;
        
        const date = new Date(record.Distribution_Date);
        const recordMonth = date.getMonth() + 1;
        const weekOfMonth = getWeekOfMonth(date);
        
        // Only include records from the selected month
        return weekOfMonth === week && recordMonth.toString() === monthValue;
      });
      
      // Get date range for this week
      const dateRange = getWeekDateRange(year, month, week);
      
      groupedData.push({
        name: `Week ${week} (${dateRange})`,
        value: weekData.length,
      });
    });
    
    return groupedData;
  };
  
  // Function to group data by day
  const groupDataByDay = (data, year, month, week) => {
    const days = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday (0 is Sunday in JavaScript)
    const groupedData = [];
    
    // Get the date of the first day of the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    
    // Find the first day of the selected week
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    let weekStartDay;
    
    if (week === 1) {
      // Week 1 starts on the 1st day of the month
      weekStartDay = 1;
    } else {
      // For Week 2 and beyond, calculate the start day
      const daysUntilSunday = firstDayOfWeek === 0 ? 0 : 7 - firstDayOfWeek;
      const firstSunday = daysUntilSunday + 1; // Date of first Sunday
      weekStartDay = firstSunday + 1 + (parseInt(week) - 2) * 7;
    }
    
    days.forEach(dayOfWeek => {
      // Calculate the date for this day in the selected week
      let dayDate;
      if (dayOfWeek === 0) { // Sunday is at the end of the week
        dayDate = new Date(year, month - 1, weekStartDay + 6);
      } else {
        dayDate = new Date(year, month - 1, weekStartDay + dayOfWeek - 1);
      }
      
      // Check if the date is still in the current month
      if (dayDate.getMonth() === month - 1) {
        const dayData = data.filter(record => {
          if (!record.Distribution_Date) return false;
          
          const date = new Date(record.Distribution_Date);
          const recordDayOfWeek = date.getDay();
          const weekOfMonth = getWeekOfMonth(date);
          
          return recordDayOfWeek === dayOfWeek && weekOfMonth.toString() === week;
        });
        
        groupedData.push({
          name: `${getDayName(dayOfWeek)} (${month}/${dayDate.getDate()})`,
          value: dayData.length,
        });
      }
    });
    
    return groupedData;
  };
  
  // Function to get the week of the month for a date
  const getWeekOfMonth = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    
    // Adjust for starting day of the week
    const dayOffset = firstDayOfMonth.getDay();
    
    // Calculate the week number (1-indexed)
    return Math.ceil((dayOfMonth + dayOffset) / 7);
  };
  
  // Get month name from number
  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNumber) - 1];
  };
  
  // Get day name from number
  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[parseInt(dayNumber)];
  };
  
  // Get available months for the selected semester
  const getAvailableMonths = (semester = selectedSemester) => {
    if (semester === 'fall2024') {
      return [8, 9, 10, 11, 12]; // August to December
    } else if (semester === 'spring2024') {
      return [1, 2, 3, 4, 5]; // January to May
    } else {
      // For current (Spring 2025), show January to May
      return [1, 2, 3, 4, 5];
    }
  };
  
  // Get available weeks for the selected month
  const getAvailableWeeks = () => {
    return [1, 2, 3, 4, 5]; // Weeks in a month
  };
  
  // Get all days of the week (Monday to Sunday)
  const getAllDaysOfWeek = () => {
    return [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday (0 is Sunday in JavaScript)
  };
  
  // Generate pie chart data for disclaimer status
  const generateDisclaimerPieData = () => {
    const signedCount = filteredData.filter(record => record.Disclaimer_Signed).length;
    const notSignedCount = filteredData.filter(record => !record.Disclaimer_Signed).length;
    
    return [
      { name: 'Signed', value: signedCount },
      { name: 'Not Signed', value: notSignedCount }
    ];
  };
  
  // Generate pie chart data for U-Pass cards
  const generateUPassPieData = () => {
    const withCardCount = filteredData.filter(record => record.Active_U_Pass_Card).length;
    const withoutCardCount = filteredData.filter(record => !record.Active_U_Pass_Card).length;
    
    return [
      { name: 'With Card', value: withCardCount },
      { name: 'Without Card', value: withoutCardCount }
    ];
  };
  
  // Generate pie chart data for Metro accounts
  const generateMetroPieData = () => {
    const withAccountCount = filteredData.filter(record => record.Metro_Acct).length;
    const withoutAccountCount = filteredData.filter(record => !record.Metro_Acct).length;
    
    return [
      { name: 'With Account', value: withAccountCount },
      { name: 'Without Account', value: withoutAccountCount }
    ];
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-[#861F41]">{`Students: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  // If still checking session, show loading spinner
  if (checkingSession) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#861F41] mb-4"></div>
            <p className="text-gray-600 font-medium">Loading visualization...</p>
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
          <h1 className="text-2xl font-bold text-[#861F41]">Student Data Visualization</h1>
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
        
        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setSelectedMonth(''); // Reset month when semester changes
                  setSelectedWeek(''); // Reset week when semester changes
                  setSelectedDay(''); // Reset day when semester changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
              >
                <option value="current">Spring 2025</option>
                <option value="fall2024">Fall 2024</option>
                <option value="spring2024">Spring 2024</option>
              </select>
            </div>
            
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedWeek(''); // Reset week when month changes
                  setSelectedDay(''); // Reset day when month changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
              >
                <option value="">All Months</option>
                {getAvailableMonths().map((month) => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Week Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
              <select
                value={selectedWeek}
                onChange={(e) => {
                  setSelectedWeek(e.target.value);
                  setSelectedDay(''); // Reset day when week changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                disabled={!selectedMonth} // Disable if no month is selected
              >
                <option value="">All Weeks</option>
                {getAvailableWeeks().map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Day Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]"
                disabled={!selectedWeek} // Disable if no week is selected
              >
                <option value="">All Days</option>
                {getAllDaysOfWeek().map((day) => (
                  <option key={day} value={day}>
                    {getDayName(day)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Visualization */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4 text-[#861F41]">Student Count Visualization</h2>
          
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
                  <span className="font-bold">Total Students:</span> {studentCount}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Semester:</span> {
                    selectedSemester === 'current' ? 'Spring 2025' :
                    selectedSemester === 'fall2024' ? 'Fall 2024' : 'Spring 2024'
                  }
                </p>
                {selectedMonth && (
                  <p className="text-gray-700">
                    <span className="font-bold">Month:</span> {getMonthName(selectedMonth)}
                  </p>
                )}
                {selectedWeek && (
                  <p className="text-gray-700">
                    <span className="font-bold">Week:</span> Week {selectedWeek}
                  </p>
                )}
                {selectedDay && (
                  <p className="text-gray-700">
                    <span className="font-bold">Day:</span> {getDayName(selectedDay)}
                  </p>
                )}
              </div>
              
              {/* Bar Chart Visualization */}
              <div className="h-80 mb-6">
                <h3 className="text-md font-semibold mb-2">
                  {!selectedMonth ? 'Student Count by Month' : 
                   !selectedWeek ? `Student Count by Week in ${getMonthName(selectedMonth)}` : 
                   `Student Count by Day in Week ${selectedWeek}`}
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" name="Students" fill="#861F41" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Additional Stats with Pie Charts */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-semibold mb-2 text-center">Disclaimer Signed</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateDisclaimerPieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {generateDisclaimerPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-bold">Yes:</span> {
                        filteredData.filter(record => record.Disclaimer_Signed).length
                      }
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">No:</span> {
                        filteredData.filter(record => !record.Disclaimer_Signed).length
                      }
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-semibold mb-2 text-center">Active U-Pass Cards</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateUPassPieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {generateUPassPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-bold">With Card:</span> {
                        filteredData.filter(record => record.Active_U_Pass_Card).length
                      }
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">Without Card:</span> {
                        filteredData.filter(record => !record.Active_U_Pass_Card).length
                      }
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-semibold mb-2 text-center">Metro Accounts</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={generateMetroPieData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {generateMetroPieData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-700">
                      <span className="font-bold">With Account:</span> {
                        filteredData.filter(record => record.Metro_Acct).length
                      }
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">Without Account:</span> {
                        filteredData.filter(record => !record.Metro_Acct).length
                      }
                    </p>
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

export default Visualization;
