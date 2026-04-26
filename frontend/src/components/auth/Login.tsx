import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  DevicePhoneMobileIcon,
  KeyIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  twoFactorCode: string;
}

interface SignupFormData {
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  password: string;
  confirmPassword: string;
}

interface ForgotPasswordData {
  email: string;
  resetCode: string;
  newPassword: string;
  confirmPassword: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Login form state
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  
  // Signup form state
  const [signupForm, setSignupForm] = useState<SignupFormData>({
    staffId: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    password: '',
    confirmPassword: '',
  });
  
  // Forgot password form state
  const [forgotForm, setForgotForm] = useState<ForgotPasswordData>({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [resetCodeSent, setResetCodeSent] = useState(false);
  
  // Mock user data for testing
  const mockUsers = [
    {
      id: 1,
      staffId: 'MOUAU001',
      email: 'staff@mouau.edu.ng',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      department: 'Computer Science',
      position: 'Lecturer',
      role: 'staff',
      remainingLeaveDays: 14,
      phoneNumber: '+2348012345678',
    },
    {
      id: 2,
      staffId: 'MOUAU002',
      email: 'hod@mouau.edu.ng',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Computer Science',
      position: 'Head of Department',
      role: 'hod',
      remainingLeaveDays: 20,
      phoneNumber: '+2348012345679',
    },
    {
      id: 3,
      staffId: 'MOUAU003',
      email: 'hr@mouau.edu.ng',
      password: 'password123',
      firstName: 'Mary',
      lastName: 'Johnson',
      department: 'Human Resources',
      position: 'HR Manager',
      role: 'hr',
      remainingLeaveDays: 22,
      phoneNumber: '+2348012345680',
    },
    {
      id: 4,
      staffId: 'MOUAU004',
      email: 'admin@mouau.edu.ng',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      department: 'Administration',
      position: 'System Administrator',
      role: 'admin',
      remainingLeaveDays: 24,
      phoneNumber: '+2348012345678',
    },
  ];

  useEffect(() => {
    // Timer for resend code
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle login form input
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  // Handle signup form input
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  // Handle forgot password form input
  const handleForgotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
  };

  // Mock API call for login
  const mockLogin = async (email: string, password: string): Promise<any> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: user.id,
        staffId: user.staffId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        position: user.position,
        role: user.role,
        remainingLeaveDays: user.remainingLeaveDays,
      }
    };
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please enter your email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Try to call real API first, fallback to mock
      let response;
      try {
        response = await login(loginForm.email, loginForm.password);
      } catch (apiError) {
        console.warn('API unavailable, using mock data');
        response = await mockLogin(loginForm.email, loginForm.password);
        // Store mock user in localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (setUser) setUser(response.user);
      }
      
      // Show 2FA modal if enabled
      setShow2FA(true);
      toast.success('Please enter your 2FA code');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle 2FA verification
  const handle2FAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default 2FA code is 123456
    if (loginForm.twoFactorCode !== '123456') {
      toast.error('Invalid 2FA code. Please try again.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate 2FA verification
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('2FA verified successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!signupForm.staffId || !signupForm.email || !signupForm.firstName || !signupForm.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock signup - in production, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === signupForm.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      toast.success('Account created successfully! Please login.');
      setActiveTab('login');
      setSignupForm({
        staffId: '',
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        position: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password - send reset code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotForm.email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock API call to send reset code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email exists in mock users
      const userExists = mockUsers.some(u => u.email === forgotForm.email);
      if (!userExists) {
        toast.error('Email not found in our records');
        return;
      }
      
      setResetCodeSent(true);
      setResendTimer(60);
      toast.success('Reset code sent to your email! Default code: 123456');
    } catch (error) {
      toast.error('Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotForm.resetCode || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (forgotForm.resetCode !== '123456') {
      toast.error('Invalid reset code');
      return;
    }
    
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (forgotForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // Mock password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Password reset successful! Please login with your new password.');
      setActiveTab('login');
      setResetCodeSent(false);
      setForgotForm({
        email: '',
        resetCode: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend reset code
  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setResendTimer(60);
      toast.success('Reset code resent! Default code: 123456');
    } catch (error) {
      toast.error('Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-6xl flex flex-col lg:flex-row bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Panel - Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-green-600 to-green-900 dark:from-green-700 dark:to-green-900 p-8 lg:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              {/* Add MOUAU Logo */}
              <AcademicCapIcon className="h-10 w-10 text-white" />
              <h1 className="text-2xl font-bold text-white">Michael Okpara University of Agriculture, Umudike</h1>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Leave Management System
            </h2>
            <p className="text-green-100 text-lg mb-8">
              Streamline your leave applications, approvals, and tracking all in one place.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Easy leave application process</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Real-time approval tracking</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Automated notifications & reminders</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Secure 2FA authentication</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-green-200 text-sm">
              © {new Date().getFullYear()} MOUAU. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="lg:w-1/2 p-8 lg:p-12">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('login');
                setShow2FA(false);
              }}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'login'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              Create Account
            </button>
            {/* {!show2FA && (
              <button
                onClick={() => setActiveTab('forgot')}
                className={`pb-3 px-2 font-medium transition-colors ${
                  activeTab === 'forgot'
                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                Forgot Password?
              </button>
            )} */}
          </div>

          {/* Login Form */}
          {activeTab === 'login' && !show2FA && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="staff@mouau.edu.ng"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                  Demo Credentials (Use any email/password for mock login)
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Staff: staff@mouau.edu.ng / password123</p>
                  <p>HOD: hod@mouau.edu.ng / password123</p>
                  <p>HR: hr@mouau.edu.ng / password123</p>
                  <p>Admin: admin@mouau.edu.ng / password123</p>
                  <p className="text-green-600 dark:text-green-400 mt-2">2FA Code: 123456</p>
                </div>
              </div>
            </form>
          )}

          {/* 2FA Verification Modal integrated in page */}
          {activeTab === 'login' && show2FA && (
            <form onSubmit={handle2FAVerification} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Please enter the verification code sent to your email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <DevicePhoneMobileIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="twoFactorCode"
                    value={loginForm.twoFactorCode}
                    onChange={handleLoginChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Demo code: 123456
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShow2FA(false);
                    setLoginForm({ ...loginForm, twoFactorCode: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
              </div>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Staff ID *
                  </label>
                  <input
                    type="text"
                    name="staffId"
                    value={signupForm.staffId}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="MOUAU001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="staff@mouau.edu.ng"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={signupForm.firstName}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={signupForm.lastName}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={signupForm.department}
                  onChange={handleSignupChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={signupForm.position}
                  onChange={handleSignupChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Lecturer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === 'forgot' && (
            <form onSubmit={resetCodeSent ? handleResetPassword : handleSendResetCode} className="space-y-6">
              {!resetCodeSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Enter Your Email Address To Reset Password
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={forgotForm.email}
                        onChange={handleForgotChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="staff@mouau.edu.ng"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reset Code
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="resetCode"
                        value={forgotForm.resetCode}
                        onChange={handleForgotChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-center tracking-widest"
                        placeholder="000000"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Demo code: 123456
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={forgotForm.newPassword}
                      onChange={handleForgotChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={forgotForm.confirmPassword}
                      onChange={handleForgotChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setResetCodeSent(false);
                        setForgotForm({ ...forgotForm, resetCode: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>

                  {resendTimer > 0 ? (
                    <p className="text-center text-sm text-gray-500">
                      Resend code in {resendTimer} seconds
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="w-full text-center text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                    >
                      Resend Code
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;