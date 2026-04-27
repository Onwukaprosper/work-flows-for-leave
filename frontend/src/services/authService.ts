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

    let department = "Mathematics";
    let position = "Lecturer II";
    let salaryScale = "CONUASS";
    let salaryGrade = "03";
    let salaryStep = 4;

    switch(userRole) {
      case 'vc':
        department = "Vice Chancellor's Office";
        position = "Vice Chancellor";
        salaryGrade = "07";
        salaryStep = 1;
        break;
      case 'bursar':
        department = "Bursary";
        position = "University Bursar";
        salaryScale = "CONTISS";
        salaryGrade = "15";
        break;
      case 'hr':
        department = "Registry";
        position = "Registrar";
        salaryScale = "CONTISS";
        salaryGrade = "14";
        break;
      case 'hod':
        department = "Computer Science";
        position = "Head of Department";
        salaryGrade = "06";
        break;
      case 'dean':
        department = "College of Physical Sciences";
        position = "Dean";
        salaryGrade = "07";
        break;
    }

    const mockUser = {
      id: 1,
      staffId: "MOUAU001",
      email: credentials.email,
      firstName: "Test",
      lastName: userRole.toUpperCase(),
      department: department,
      presentPost: position,
      salaryScale: salaryScale,
      salaryGrade: salaryGrade,
      salaryStep: salaryStep,
      position: position,
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