"use client";

import React from 'react';
import { maskPid } from '../utils/maskPid';

const DisclaimerModal = ({ isOpen, onClose, onConfirm, studentInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-[#861F41]">Disclaimer Not Signed</h2>
        
        {studentInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">
              The following student has not signed the disclaimer:
            </p>
            <div className="bg-gray-100 p-3 rounded">
              <p><span className="font-medium">Name:</span> {studentInfo.First_Name} {studentInfo.Last_Name}</p>
              <p><span className="font-medium">Student ID:</span> {maskPid(studentInfo.Student_ID)}</p>
              <p><span className="font-medium">Email:</span> {studentInfo.Email}</p>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-700 mb-4">
          Please confirm if the student has signed the disclaimer form. If they have signed, 
          clicking &quot;Signed, Proceed&quot; will update their record in the system.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Not Signed, Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#861F41] text-white rounded hover:bg-[#6e1935] transition"
          >
            Signed, Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;
