import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import loginImage from '../assets/images/login-page.png';
import Image from 'next/image';
import '../assets/colors/fonts.css';

const Login = () => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const pathname = usePathname();
  
  // Check if user is already logged in
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      // User is already logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not logged in, allow access to login page
      setCheckingSession(false);
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Effect to detect when navigation to dashboard is complete
  useEffect(() => {
    // If we're no longer on the login page and loading is true, set loading to false
    if (pathname !== '/' && loading) {
      setLoading(false);
    }
  }, [pathname, loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Store user role in localStorage for role-based access control
      localStorage.setItem('userRole', data.role || 'distributor');
      
      // Navigate to the Dashboard upon successful login
      // Loading state will be turned off by the useEffect when navigation completes
      router.push('/dashboard');
    } catch {
      // Only set loading to false on error
      setLoading(false);
      setError("Invalid email or password. Please try again.");
    }
    // Removed the finally block - loading will be set to false when navigation completes
  };

  // If still checking session, show loading spinner
  if (checkingSession) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-white">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#861F41] mb-4"></div>
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center  overflow-hidden">
      <h1 
        className="text-3xl md:text-4xl font-bold mb-4 text-center text-[#861F41]" 
        style={{ 
          fontFamily: 'AcherusGrotesque-Bold', 
          textShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      >
        Login to U-Pass Manager
      </h1>
      <main className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto px-4">
        <div className="flex w-full md:w-1/2 items-center justify-center p-2 md:p-4">
          <div className="w-full max-w-md bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="relative w-full h-[60px] mb-2">
              <div 
                className="absolute top-0 left-0 right-0 w-full bg-red-50 border-l-4 border-red-500 p-3 shadow-md z-10 overflow-hidden transition-all duration-300"
                style={{ 
                  opacity: error ? 1 : 0,
                  visibility: error ? 'visible' : 'hidden',
                  transform: error ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                <p className="text-red-700 text-sm whitespace-normal break-words" style={{ fontFamily: 'AcherusGrotesque-Regular' }}>
                  {error || "Invalid email or password. Please try again."}
                </p>
              </div>
            </div>
            <form className="space-y-6 w-full" onSubmit={handleLogin}>
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-2" 
                  style={{ fontFamily: 'AcherusGrotesque-Regular', fontSize: '16px' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41] text-gray-800 transition-all duration-200"
                  style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                />
              </div>
              <div className="relative">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2" 
                  style={{ fontFamily: 'AcherusGrotesque-Regular', fontSize: '16px' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#861F41] focus:border-[#861F41] text-gray-800 transition-all duration-200"
                    style={{ fontFamily: 'AcherusGrotesque-Regular' }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 py-2 border-l border-gray-300 flex items-center transition-colors hover:text-[#861F41]"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ height: 'calc(95% - 2px)', top: '4px', color: '#6c757d'}}
                  >
                    {showPassword ? (
                      <svg className="svg-inline--fa fa-eye-slash" aria-labelledby="svg-inline--fa-title-myYOBtK7NvvJ" data-prefix="fas" data-icon="eye-slash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="24">
                        <title id="svg-inline--fa-title-myYOBtK7NvvJ">Hide password</title>
                        <path fill="currentColor" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"></path>
                      </svg>
                    ) : (
                      <svg className="svg-inline--fa fa-eye" aria-labelledby="svg-inline--fa-title-rOnf3ymLcW9i" data-prefix="fas" data-icon="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="24">
                        <title id="svg-inline--fa-title-rOnf3ymLcW9i">Reveal password</title>
                        <path fill="currentColor" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white bg-[#861F41] hover:bg-[#6e1a34] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#861F41] py-3 px-6 rounded-md shadow-md transition-all duration-200 transform hover:translate-y-[-2px] active:translate-y-0 flex items-center justify-center"
                  style={{ fontFamily: 'AcherusGrotesque-Bold', fontSize: '18px' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      <span>Logging in...</span>
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between pt-2">
                <a 
                  href="#" 
                  className="text-sm text-[#861F41] hover:text-[#6e1a34] transition-colors duration-200" 
                  style={{ fontFamily: 'AcherusGrotesque-Regular', fontSize: '15px' }}
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </div>
        {!isMobile && (
          <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-4">
            <div className="relative rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-[1.02] max-h-[60vh]">
              <Image 
                src={loginImage} 
                alt="Login Image" 
                width={600} 
                height={450} 
                className="object-cover h-full w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(134,31,65,0.3)] to-transparent"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Login;
