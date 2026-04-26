import React, { useState } from 'react';
import axios from 'axios';

// Types for our form data
interface UserFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  // Address Information
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Account Information
  username: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor' | 'admin';
  // Preferences
  newsletter: boolean;
  darkMode: boolean;
  language: 'en' | 'es' | 'fr';
}

// Step configuration
interface Step {
  id: number;
  title: string;
  fields: (keyof UserFormData)[];
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Personal Information',
    fields: ['fullName', 'email', 'phone', 'dateOfBirth'],
  },
  {
    id: 2,
    title: 'Address Information',
    fields: ['street', 'city', 'state', 'zipCode', 'country'],
  },
  {
    id: 3,
    title: 'Account Setup',
    fields: ['username', 'password', 'confirmPassword', 'role'],
  },
  {
    id: 4,
    title: 'Preferences',
    fields: ['newsletter', 'darkMode', 'language'],
  },
];

const initialFormData: UserFormData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'student',
  newsletter: false,
  darkMode: false,
  language: 'en',
};

// Field labels for better UX
const fieldLabels: Record<keyof UserFormData, string> = {
  fullName: 'Full Name',
  email: 'Email Address',
  phone: 'Phone Number',
  dateOfBirth: 'Date of Birth',
  street: 'Street Address',
  city: 'City',
  state: 'State/Province',
  zipCode: 'ZIP / Postal Code',
  country: 'Country',
  username: 'Username',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  role: 'Role',
  newsletter: 'Subscribe to Newsletter',
  darkMode: 'Enable Dark Mode',
  language: 'Preferred Language',
};

const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  // Validate current step fields
  const validateStep = (): boolean => {
    const currentStepConfig = steps.find(step => step.id === currentStep);
    if (!currentStepConfig) return true;

    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    for (const field of currentStepConfig.fields) {
      const value = formData[field];

      if (typeof value === 'string' && !value.trim() && field !== 'newsletter' && field !== 'darkMode') {
        newErrors[field] = `${fieldLabels[field]} is required`;
      }

      // Email validation
      if (field === 'email' && value && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        }
      }

      // Phone validation (basic)
      if (field === 'phone' && value && typeof value === 'string') {
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,5}[-\s\.]?[0-9]{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        }
      }

      // Password validation
      if (field === 'password' && value) {
        if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
      }

      // Confirm password validation
      if (field === 'confirmPassword') {
        if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    // Validate last step before submission
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Make real API call using axios
      const response = await axios.post('https://jsonplaceholder.typicode.com/users', {
        ...formData,
        submittedAt: new Date().toISOString(),
      });

      if (response.status === 201) {
        setSubmitStatus({
          type: 'success',
          message: 'User registered successfully! Welcome aboard!',
        });
        // Reset form after successful submission
        setTimeout(() => {
          setFormData(initialFormData);
          setCurrentStep(1);
          setSubmitStatus({ type: null, message: '' });
        }, 3000);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('API Error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to register user. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form fields based on current step
  const renderStepFields = () => {
    const currentStepConfig = steps.find(step => step.id === currentStep);
    if (!currentStepConfig) return null;

    return currentStepConfig.fields.map(field => {
      const value = formData[field];
      const error = errors[field];

      // Render select for role and language
      if (field === 'role') {
        return (
          <div key={field} className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {fieldLabels[field]} <span className="text-red-500">*</span>
            </label>
            <select
              name={field}
              value={value as string}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Administrator</option>
            </select>
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        );
      }

      if (field === 'language') {
        return (
          <div key={field} className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {fieldLabels[field]} <span className="text-red-500">*</span>
            </label>
            <select
              name={field}
              value={value as string}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
            {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        );
      }

      // Render checkbox for newsletter and darkMode
      if (field === 'newsletter' || field === 'darkMode') {
        return (
          <div key={field} className="mb-5 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              {fieldLabels[field]}
            </label>
            <input
              type="checkbox"
              name={field}
              checked={value as boolean}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        );
      }

      // Render text inputs (including password)
      return (
        <div key={field} className="mb-5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {fieldLabels[field]} <span className="text-red-500">*</span>
          </label>
          <input
            type={field === 'password' || field === 'confirmPassword' ? 'password' : field === 'dateOfBirth' ? 'date' : 'text'}
            name={field}
            value={value as string}
            onChange={handleInputChange}
            placeholder={`Enter ${fieldLabels[field].toLowerCase()}`}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      );
    });
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-blue-100 mt-2">Multi-step registration form</p>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-6">
            <div className="mb-2 flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between mt-6">
              {steps.map(step => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id === currentStep
                      ? 'text-blue-600 dark:text-blue-400'
                      : step.id < currentStep
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step.id === currentStep
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400'
                        : step.id < currentStep
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6">
            {submitStatus.type === 'success' ? (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800 dark:text-green-200">{submitStatus.message}</p>
                  </div>
                </div>
              </div>
            ) : submitStatus.type === 'error' ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{submitStatus.message}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepFields()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    currentStep === 1
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  ← Previous
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`px-8 py-2 rounded-lg font-medium transition-all shadow-md ${
                      isSubmitting
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Register User'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Summary Section (optional for review) */}
          {currentStep === steps.length && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Registration Summary</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Please review your information before submitting. All data will be securely stored.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* API Note */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
          Using real API endpoint (JSONPlaceholder) — data is sent via Axios POST request
        </p>
      </div>
    </div>
  );
};

export default UserManagement;