// import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: string;
  remainingLeaveDays: number;
}

// export const authService = {
//   login: async (credentials: LoginCredentials) => {
//     const response = await api.post('/auth/login', credentials);
//     if (response.data.token) {
//       localStorage.setItem('token', response.data.token);
//       localStorage.setItem('user', JSON.stringify(response.data.user));
//     }
//     return response.data;
//   },

//   logout: () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//   },

//   getCurrentUser: (): User | null => {
//     const userStr = localStorage.getItem('user');
//     if (userStr) {
//       return JSON.parse(userStr);
//     }
//     return null;
//   },
// };

// ///////////////    Add mock mode |||||||||||||| ////////
export const authService = {
  login: async (credentials: LoginCredentials) => {
    // Dynamically assign role based on email for testing UI views
    let userRole = 'staff';
    const lowerEmail = credentials.email.toLowerCase();
    
    if (lowerEmail.includes('hod')) userRole = 'hod';
    else if (lowerEmail.includes('hr') || lowerEmail.includes('registrar')) userRole = 'hr';
    else if (lowerEmail.includes('bursar')) userRole = 'bursar';
    else if (lowerEmail.includes('vc')) userRole = 'vc';
    else if (lowerEmail.includes('admin')) userRole = 'admin';
    else if (lowerEmail.includes('dean')) userRole = 'dean'; // Just in case

    const mockUser = {
      id: 1,
      staffId: "MOUAU001",
      email: credentials.email,
      firstName: "Test",
      lastName: userRole.toUpperCase(),
      department: "Computer Science",
      presentPost: "Senior Lecturer",
      salaryScale: "CONUASS",
      salaryGrade: "05",
      salaryStep: 2,
      position: "Lecturer",
      role: userRole, 
      remainingLeaveDays: 30
    };
    
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    return { token: 'mock-token', user: mockUser };
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
};