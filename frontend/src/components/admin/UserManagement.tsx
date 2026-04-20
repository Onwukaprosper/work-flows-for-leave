import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { User, UserRole } from '../../types/user';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  XMarkIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    staffId: '',
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    role: 'staff' as UserRole,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!editingUser && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      if (editingUser) {
        // Update user
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          position: formData.position,
          role: formData.role,
          ...(formData.password && { password: formData.password })
        };
        
        await userService.updateUser(editingUser.id, updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await userService.createUser({
          staffId: formData.staffId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          department: formData.department,
          position: formData.position,
          role: formData.role,
          password: formData.password,
        });
        toast.success('User created successfully');
      }
      
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      staffId: user.staffId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department || '',
      position: user.position || '',
      role: user.role as UserRole,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      position: '',
      role: 'staff',
      password: '',
      confirmPassword: '',
    });
    setEditingUser(null);
    setShowModal(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      hod: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      hr: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      staff: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[role as keyof typeof colors] || colors.staff;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Users</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'staff').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Staff Members</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'hod').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">HODs</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {users.filter(u => u.role === 'admin' || u.role === 'hr').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admin/HR</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Staff ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Leave Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.staffId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.remainingLeaveDays} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 mr-3"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="modal-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                {/* Staff ID */}
                <div>
                  <label className="input-label">
                    Staff ID {!editingUser && '*'}
                  </label>
                  <input
                    type="text"
                    name="staffId"
                    value={formData.staffId}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., MOUAU001"
                    required={!editingUser}
                    disabled={!!editingUser}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Staff ID cannot be changed</p>
                  )}
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="input-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                {/* Department & Position */}
                <div>
                  <label className="input-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div>
                  <label className="input-label">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="e.g., Senior Lecturer"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label className="input-label">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="hr">HR Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                </div>

                {/* Password Fields (only for new user or if changing password) */}
                <div className="space-y-4">
                  <div>
                    <label className="input-label">
                      {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input"
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>
                  
                  {(!editingUser || formData.password) && (
                    <div>
                      <label className="input-label">Confirm Password *</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="input"
                        required={!editingUser || !!formData.password}
                      />
                      {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                        <p className="text-red-600 text-xs mt-1">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!editingUser && formData.password !== formData.confirmPassword}
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;



// import React, { useState, useEffect } from 'react';
// import { userService } from '../../services/userService';
// import type { User } from '../../types/user';
// import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import toast from 'react-hot-toast';

// const UserManagement: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingUser, setEditingUser] = useState<User | null>(null);
//   const [formData, setFormData] = useState({
//     staffId: '', email: '', firstName: '', lastName: '', department: '', position: '', role: 'staff' as const, password: '', confirmPassword: ''
//   });

//   useEffect(() => { fetchUsers(); }, []);

//   const fetchUsers = async () => {
//     try { const data = await userService.getAllUsers(); setUsers(Array.isArray(data) ? data : []); } 
//     catch (error) { toast.error('Failed to fetch users'); } 
//     finally { setLoading(false); }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingUser && formData.password !== formData.confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }
//     try {
//       if (editingUser) {
//         await userService.updateUser(editingUser.id, { ...formData, password: formData.password || undefined });
//         toast.success('User updated');
//       } else {
//         await userService.createUser(formData as any);
//         toast.success('User created');
//       }
//       resetForm();
//       fetchUsers();
//     } catch (error) { toast.error('Failed to save user'); }
//   };

//   const resetForm = () => {
//     setFormData({ staffId: '', email: '', firstName: '', lastName: '', department: '', position: '', role: 'staff', password: '', confirmPassword: '' });
//     setEditingUser(null);
//     setShowModal(false);
//   };

//   if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
//           <p className="text-gray-600 dark:text-gray-400">Manage system users and roles</p>
//         </div>
//         <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><PlusIcon className="h-5 w-5" /> Add User</button>
//       </div>

//       {/* Stats Cards - responsive grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
//         <div className="stat-card"><div className="stat-card-value">{users.length}</div><div className="stat-card-title">Total Users</div></div>
//         <div className="stat-card"><div className="stat-card-value">{users.filter(u=>u.role==='staff').length}</div><div className="stat-card-title">Staff</div></div>
//         <div className="stat-card"><div className="stat-card-value">{users.filter(u=>u.role==='hod').length}</div><div className="stat-card-title">HODs</div></div>
//         <div className="stat-card"><div className="stat-card-value">{users.filter(u=>u.role==='admin' || u.role==='hr').length}</div><div className="stat-card-title">Admin/HR</div></div>
//       </div>

//       {/* Desktop Table */}
//       <div className="hidden md:block overflow-x-auto">
//         <table className="min-w-full bg-white dark:bg-gray-800 border rounded-lg">
//           <thead className="bg-gray-50 dark:bg-gray-900">
//             <tr><th className="px-6 py-3 text-left text-xs font-medium">Staff ID</th><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Leave Balance</th><th className="text-right">Actions</th></tr>
//           </thead>
//           <tbody>
//             {users.map(user => (
//               <tr key={user.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
//                 <td className="px-6 py-4 text-sm">{user.staffId}</td>
//                 <td className="px-6 py-4 text-sm">{user.firstName} {user.lastName}</td>
//                 <td className="px-6 py-4 text-sm">{user.email}</td>
//                 <td className="px-6 py-4 text-sm">{user.department}</td>
//                 <td className="px-6 py-4"><span className={`badge ${user.role==='admin'?'bg-purple-100':user.role==='hod'?'bg-green-100':'bg-gray-100'}`}>{user.role.toUpperCase()}</span></td>
//                 <td className="px-6 py-4 text-sm">{user.remainingLeaveDays} days</td>
//                 <td className="px-6 py-4 text-right space-x-2">
//                   <button onClick={() => setEditingUser(user)} className="text-green-600"><PencilIcon className="h-5 w-5" /></button>
//                   <button onClick={() => userService.deleteUser(user.id)} className="text-red-600"><TrashIcon className="h-5 w-5" /></button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile Cards */}
//       <div className="block md:hidden space-y-4">
//         {users.map(user => (
//           <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border">
//             <div className="flex justify-between items-start">
//               <div><p className="font-semibold">{user.firstName} {user.lastName}</p><p className="text-sm text-gray-500">{user.staffId}</p></div>
//               <span className={`badge ${user.role==='admin'?'bg-purple-100':user.role==='hod'?'bg-green-100':'bg-gray-100'}`}>{user.role.toUpperCase()}</span>
//             </div>
//             <p className="text-sm mt-2"><span className="font-medium">Email:</span> {user.email}</p>
//             <p className="text-sm"><span className="font-medium">Dept:</span> {user.department}</p>
//             <p className="text-sm"><span className="font-medium">Leave:</span> {user.remainingLeaveDays} days</p>
//             <div className="flex justify-end gap-3 mt-3 pt-2 border-t">
//               <button onClick={() => setEditingUser(user)} className="text-green-600 text-sm">Edit</button>
//               <button onClick={() => userService.deleteUser(user.id)} className="text-red-600 text-sm">Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal - Responsive */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl">
//               <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//                 <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
//                 <button onClick={resetForm} className="text-gray-400"><XMarkIcon className="h-6 w-6" /></button>
//               </div>
//               <form onSubmit={handleSubmit} className="p-6 space-y-4">
//                 <input type="text" name="staffId" placeholder="Staff ID" value={formData.staffId} onChange={e=>setFormData({...formData, staffId:e.target.value})} className="input" />
//                 <div className="grid grid-cols-2 gap-3">
//                   <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={e=>setFormData({...formData, firstName:e.target.value})} className="input" required />
//                   <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={e=>setFormData({...formData, lastName:e.target.value})} className="input" required />
//                 </div>
//                 <input type="email" name="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="input" required />
//                 <input type="text" name="department" placeholder="Department" value={formData.department} onChange={e=>setFormData({...formData, department:e.target.value})} className="input" />
//                 <input type="text" name="position" placeholder="Position" value={formData.position} onChange={e=>setFormData({...formData, position:e.target.value})} className="input" />
//                 <select name="role" value={formData.role} onChange={e=>setFormData({...formData, role:e.target.value as any})} className="input">
//                   <option value="staff">Staff</option><option value="hod">HOD</option><option value="hr">HR</option><option value="admin">Admin</option>
//                 </select>
//                 <input type="password" name="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} className="input" required={!editingUser} />
//                 <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={e=>setFormData({...formData, confirmPassword:e.target.value})} className="input" required={!editingUser} />
//                 <div className="flex justify-end gap-3 pt-4">
//                   <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
//                   <button type="submit" className="btn-primary">{editingUser ? 'Update' : 'Create'}</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserManagement;