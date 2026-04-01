import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    }
    return Promise.reject(error)
  }
)



// Add mock mode flag
const USE_MOCK = true; // Set to false when backend is ready

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (USE_MOCK && error.code === 'ERR_NETWORK') {
      // Return mock data instead of failing
      console.warn('Backend not available, using mock data');
      return Promise.resolve({ data: getMockData(error.config) });
    }
    return Promise.reject(error);
  }
);

function getMockData(config: any) {
  // Return mock data based on the endpoint
  if (config.url?.includes('/leave/balance')) {
    return { totalDays: 24, usedDays: 9.5, remainingDays: 14.5 };
  }
  if (config.url?.includes('/leave/user')) {
    return [
      {
        id: 1,
        leaveTypeName: "Annual Leave",
        startDate: "2024-03-15",
        endDate: "2024-03-20",
        totalDays: 5,
        status: "approved"
      }
    ];
  }
  return {};
}

export default api