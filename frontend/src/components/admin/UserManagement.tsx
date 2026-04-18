import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types/user';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  //////////////////////////////////////////////////////

// useEffect(() => {
//   // Force mock data for testing
//   const mockUsersData = [
//     {
//       id: 1,
//       staffId: 'MOUAU001',
//       email: 'john.doe@mouau.edu.ng',
//       firstName: 'John',
//       lastName: 'Doe',
//       department: 'Computer Science',
//       position: 'Senior Lecturer',
//       role: 'staff' as const,
//       remainingLeaveDays: 14,
//     },
//     {
//       id: 2,
//       staffId: 'MOUAU002',
//       email: 'jane.smith@mouau.edu.ng',
//       firstName: 'Jane',
//       lastName: 'Smith',
//       department: 'Computer Science',
//       position: 'Head of Department',
//       role: 'hod' as const,
//       remainingLeaveDays: 20,
//     },
//     {
//       id: 3,
//       staffId: 'MOUAU003',
//       email: 'mary.johnson@mouau.edu.ng',
//       firstName: 'Mary',
//       lastName: 'Johnson',
//       department: 'Human Resources',
//       position: 'HR Manager',
//       role: 'hr' as const,
//       remainingLeaveDays: 22,
//     },
//     {
//       id: 4,
//       staffId: 'MOUAU004',
//       email: 'admin@mouau.edu.ng',
//       firstName: 'Admin',
//       lastName: 'User',
//       department: 'Administration',
//       position: 'System Administrator',
//       role: 'admin' as const,
//       remainingLeaveDays: 24,
//     },
//   ];
  
//   setUsers(mockUsersData);
//   setLoading(false);
// }, []); // This will override the fetchUsers call


  ///////////////////////////////////////////////////////

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Balance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.staffId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'hod' ? 'bg-green-100 text-green-800' :
                    user.role === 'hr' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.remainingLeaveDays} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal would go here */}
    </div>
  );
};

export default UserManagement;