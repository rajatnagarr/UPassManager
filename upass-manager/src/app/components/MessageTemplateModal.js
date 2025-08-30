"use client";

import React, { useState, useEffect } from 'react';

const MessageTemplateModal = ({ isOpen, onClose, onSave, template }) => {
  const [title, setTitle] = useState(template?.title || '');
  const [message, setMessage] = useState(template?.message || '');
  const [errors, setErrors] = useState({});

  // Update form values when template changes
  useEffect(() => {
    if (template) {
      setTitle(template.title || '');
      setMessage(template.message || '');
    } else {
      setTitle('');
      setMessage('');
    }
  }, [template]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = {};
    if (!title.trim()) formErrors.title = 'Title is required';
    if (!message.trim()) formErrors.message = 'Message is required';
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Submit form
    onSave({
      id: template?.id,
      title,
      message
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-[#861F41]">
            {template ? 'Edit Template' : 'Add Template'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Template Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]`}
                placeholder="Enter template title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                className={`w-full px-3 py-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-[#861F41]`}
                placeholder="Enter message content"
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#861F41] text-white rounded hover:bg-[#6e1935] transition"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageTemplateModal;
