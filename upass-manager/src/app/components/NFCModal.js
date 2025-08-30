"use client";

import React, { useState, useEffect, useRef } from 'react';
import { maskPid } from '../utils/maskPid';
import { io } from 'socket.io-client';

const NFCModal = ({ isOpen, onClose, onConfirm, studentInfo }) => {
  const [upassId, setUpassId] = useState('');
  const [error, setError] = useState(null);
  const [nfcStatus, setNfcStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [readers, setReaders] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  
  // Determine if this is a replacement (student already has an active U-Pass)
  const isReplacement = studentInfo && studentInfo.Active_U_Pass_Card;
  
  // Connect to NFC bridge server when modal opens
  useEffect(() => {
    if (isOpen) {
      // Focus the input field
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 100);
      }
      
      // Connect to NFC bridge server
      connectToNfcServer();
    } else {
      // Disconnect from NFC bridge server when modal closes
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      // Reset state
      setUpassId('');
      setError(null);
      setNfcStatus('disconnected');
      setReaders([]);
      setStatusMessage('');
    }
  }, [isOpen]);
  
  // Function to connect to NFC bridge server
  const connectToNfcServer = () => {
    try {
      setNfcStatus('connecting');
      setStatusMessage('Connecting to NFC server...');
      
      // Connect to NFC bridge server
      const socket = io('http://localhost:3001');
      socketRef.current = socket;
      
      // Connection established
      socket.on('connect', () => {
        console.log('Connected to NFC bridge server');
        setNfcStatus('connected');
        setStatusMessage('Connected to NFC server. Waiting for card...');
      });
      
      // Connection error
      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setNfcStatus('error');
        setStatusMessage('Failed to connect to NFC server. Please make sure the NFC bridge server is running.');
      });
      
      // Readers available
      socket.on('readers', (readerList) => {
        console.log('Available readers:', readerList);
        setReaders(readerList);
        
        if (readerList.length === 0) {
          setStatusMessage('No NFC readers detected. Please connect an NFC reader.');
        } else {
          setStatusMessage(`NFC reader detected: ${readerList.join(', ')}. Waiting for card...`);
        }
      });
      
      // Reader connected
      socket.on('readerConnected', (data) => {
        console.log('Reader connected:', data.name);
        setReaders(prev => [...prev, data.name]);
        setStatusMessage(`NFC reader connected: ${data.name}. Waiting for card...`);
      });
      
      // Reader disconnected
      socket.on('readerDisconnected', (data) => {
        console.log('Reader disconnected:', data.name);
        setReaders(prev => {
          const updatedReaders = prev.filter(reader => reader !== data.name);
          
          // Use the updated readers array to set the status message
          if (updatedReaders.length === 0) {
            setStatusMessage('No NFC readers detected. Please connect an NFC reader.');
          } else {
            setStatusMessage(`NFC reader disconnected: ${data.name}`);
          }
          
          return updatedReaders;
        });
      });
      
      // Card detected
      socket.on('cardDetected', (data) => {
        console.log('Card detected:', data);
        
        // Set the U-Pass ID
        setUpassId(data.cardNumber);
        setStatusMessage(`Card detected: ${data.cardNumber}`);
        
        // Automatically submit after a short delay
        // setTimeout(() => {
        //   handleSubmit();
        // }, 500);
      });
      
      // Card removed
      socket.on('cardRemoved', (data) => {
        console.log('Card removed from reader:', data.reader);
        setStatusMessage('Card removed. Please scan again or enter U-Pass number manually.');
      });
      
      // Error
      socket.on('error', (data) => {
        console.error('NFC error:', data);
        setError(data.message);
        setStatusMessage(`Error: ${data.message}`);
      });
      
      // Disconnected
      socket.on('disconnect', () => {
        console.log('Disconnected from NFC bridge server');
        setNfcStatus('disconnected');
        setStatusMessage('Disconnected from NFC server.');
      });
    } catch (err) {
      console.error('Error connecting to NFC bridge server:', err);
      setNfcStatus('error');
      setStatusMessage('Failed to connect to NFC server. Please make sure the NFC bridge server is running.');
    }
  };
  
  const handleSubmit = () => {
    // Validate the input
    if (!upassId.trim()) {
      setError('Please enter a U-Pass number');
      return;
    }

    // Check if the U-Pass number is numeric and exactly 20 digits
    if (!/^\d{20}$/.test(upassId)) {
      setError('Please enter a 20-digit U-Pass number');
      return;
    }
    
    // Call the confirm handler with the numeric U-Pass ID
    onConfirm(upassId);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-[#861F41]">
          {isReplacement ? 'Replace U-Pass' : 'Allocate U-Pass'}
        </h2>
        
        {studentInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              {isReplacement ? 'Replacing U-Pass for:' : 'Allocating U-Pass for:'}
            </p>
            <div className="bg-gray-100 p-3 rounded">
              <p><span className="font-medium">Name:</span> {studentInfo.First_Name} {studentInfo.Last_Name}</p>
              <p><span className="font-medium">PID:</span> {maskPid(studentInfo.Student_ID)}</p>
              <p><span className="font-medium">Email:</span> {studentInfo.Email}</p>
              
              {/* Show current U-Pass number if this is a replacement */}
              {isReplacement && (
                <p><span className="font-medium">Current U-Pass:</span> {studentInfo.Active_U_Pass_Card}</p>
              )}
            </div>
            
            {/* Add replacement note */}
            {isReplacement && (
              <div className="mt-3 text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
                Do you want to replace the existing card with the new one? The old card will be moved to the replaced cards list.
              </div>
            )}
          </div>
        )}
        
        <div className="my-6">
          <label htmlFor="upassId" className="block text-sm font-medium text-gray-700 mb-2">
            U-Pass Number
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              id="upassId"
              name="upassId"
              value={upassId}
              onChange={(e) => setUpassId(e.target.value)}
              placeholder="Scan or enter U-Pass number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-transparent"
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
            </div>
          </div>
          
          {/* NFC Status */}
          <div className={`mt-2 text-sm ${
            nfcStatus === 'connected' ? 'text-green-600' : 
            nfcStatus === 'connecting' ? 'text-yellow-600' : 
            nfcStatus === 'error' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {statusMessage || 'Place the U-Pass card near the NFC reader or manually enter the U-Pass number'}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#861F41] text-white rounded hover:bg-[#6e1935] transition"
          >
            {isReplacement ? 'Replace U-Pass' : 'Allocate U-Pass'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFCModal;
