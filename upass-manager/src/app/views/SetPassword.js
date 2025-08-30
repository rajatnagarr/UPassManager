"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../assets/colors/fonts.css';

const SetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no email is provided
  useEffect(() => {
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Make an API call to add the distributor to the database
      const response = await fetch('/api/add-distributor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login page after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch {
      setError('Failed to set password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 py-8 px-4">
        <div className="w-full max-w-md">
          <h1 
            className="text-3xl font-bold mb-6 text-center text-[#861F41]" 
            style={{ 
              fontFamily: 'AcherusGrotesque-Bold', 
              textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
            }}
          >
            Set Up Your Account
          </h1>
          
          {success ? (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
              <p className="text-gray-600 mb-4">Your password has been set successfully.</p>
              <p className="text-gray-500">Redirecting to login page...</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="firstName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41]"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="lastName" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41]"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41]"
                      style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-[#861F41]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500" style={{ fontFamily: 'AcherusGrotesque-Regular' }}>
                    Must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
                
                <div>
                  <label 
                    htmlFor="confirmPassword" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41]"
                      style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-[#861F41]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#861F41] text-white py-2 px-4 rounded-md hover:bg-[#6e1a34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#861F41] transition-colors duration-200 flex items-center justify-center"
                    style={{ fontFamily: 'AcherusGrotesque-Bold' }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        <span>Setting Up...</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SetPassword;
