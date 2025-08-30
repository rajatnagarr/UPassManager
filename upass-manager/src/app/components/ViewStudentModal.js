"use client";

import React from 'react';
import { maskPid } from '../utils/maskPid';

const ViewStudentModal = ({ isOpen, onClose, studentInfo }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-[#861F41]">Student Record</h2>
        
        {/* Student information section */}
        {studentInfo && (
          <>
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Student Information</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Student ID</p>
                    <p className="font-medium">{maskPid(studentInfo.Student_ID)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{studentInfo.First_Name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{studentInfo.Last_Name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{studentInfo.Email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other fields section */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">U-Pass Information</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Active U-Pass</p>
                    <p className="font-medium">{studentInfo.Active_U_Pass_Card || 'Not Allocated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Replaced U-Pass</p>
                    <p className="font-medium">{studentInfo.Replaced_U_Pass_Card || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Disclaimer Signed</p>
                    <p className="font-medium">{studentInfo.Disclaimer_Signed ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Metro Account</p>
                    <p className="font-medium">{studentInfo.Metro_Acct || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Distribution Date</p>
                    <p className="font-medium">
                      {studentInfo.Distribution_Date 
                        ? (studentInfo.Distribution_Date.includes('T') 
                            ? studentInfo.Distribution_Date.split('T')[0] 
                            : studentInfo.Distribution_Date)
                        : 'Not Distributed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Picked Up By</p>
                    <p className="font-medium">{studentInfo.Picked_Up_By || 'Not Picked Up'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">U-Pass ID</p>
                    <p className="font-medium">{studentInfo.U_Pass_ID || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes section */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Notes</h3>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm">{studentInfo.Notes || 'No notes available'}</p>
              </div>
            </div>
          </>
        )}
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentModal;
