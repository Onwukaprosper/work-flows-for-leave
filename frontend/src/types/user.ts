export type UserRole = 'staff' | 'hod' | 'vc' | 'hr' | 'bursar' | 'admin';
export interface User {
  id: number;
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  presentPost?: string;
  salaryScale?: string;
  salaryGrade?: string;
  salaryStep?: number;
  role: UserRole;
  remainingLeaveDays: number;
  annualLeaveDays?: number;
  profilePicture?: string;
  phoneNumber?: string;
  dateOfAppointment?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  staffId: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: UserRole;
  password: string;
  confirmPassword?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id?: number;
  remainingLeaveDays?: number;
}

export interface UserFilters {
  department?: string;
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}