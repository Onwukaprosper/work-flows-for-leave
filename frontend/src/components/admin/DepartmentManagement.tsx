import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Department {
  id: number;
  name: string;
  code: string;
  faculty: string;
  hodId?: number;
  hodName?: string;
  staffCount: number;
  createdAt: string;
}

interface DepartmentFormData {
  name: string;
  code: string;
  faculty: string;
  hodId?: number;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    faculty: '',
  });

  // Mock departments data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDepartments([
        {
          id: 1,
          name: 'Computer Science',
          code: 'CSC',
          faculty: 'Science',
          hodName: 'Dr. Abel Chinedu',
          staffCount: 25,
          createdAt: '2024-01-01'
        },
        {
          id: 2,
          name: 'Mathematics',
          code: 'MTH',
          faculty: 'Science',
          hodName: 'Prof. Victor Muna',
          staffCount: 18,
          createdAt: '2024-01-01'
        },
        {
          id: 3,
          name: 'Agricultural Economics',
          code: 'AEC',
          faculty: 'Agriculture',
          hodName: 'Prof. Prosper',
          staffCount: 22,
          createdAt: '2024-01-01'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const faculties = ['Science', 'Agriculture', 'Engineering', 'Arts', 'Social Sciences', 'Management Sciences'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.faculty) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingDept) {
        // Update department
        setDepartments(departments.map(dept => 
          dept.id === editingDept.id 
            ? { ...dept, ...formData }
            : dept
        ));
        toast.success('Department updated successfully');
      } else {
        // Create new department
        const newDept: Department = {
          id: Date.now(),
          ...formData,
          staffCount: 0,
          createdAt: new Date().toISOString(),
        };
        setDepartments([...departments, newDept]);
        toast.success('Department created successfully');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save department');
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDept(department);
    setFormData({
      name: department.name,
      code: department.code,
      faculty: department.faculty,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this department? This will affect all staff in this department.')) {
      try {
        setDepartments(departments.filter(dept => dept.id !== id));
        toast.success('Department deleted successfully');
      } catch (error) {
        toast.error('Failed to delete department');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', faculty: '' });
    setEditingDept(null);
    setShowModal(false);
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
          <h2 className="text-2xl font-bold text-gray-800">Department Management</h2>
          <p className="text-gray-600 mt-1">Manage academic departments and their HODs</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Departments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">{faculties.length}</div>
          <div className="text-sm text-gray-600 mt-1">Faculties</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-2xl font-bold text-gray-900">
            {departments.reduce((sum, dept) => sum + dept.staffCount, 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Staff</div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Faculty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Head of Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                  {dept.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dept.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {dept.faculty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dept.hodName || 'Not Assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {dept.staffCount} staff
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="text--600 hover:text-green-900 mr-3"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
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

      {/* Add/Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., CSC"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty *
                </label>
                <select
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculties.map(faculty => (
                    <option key={faculty} value={faculty}>{faculty}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;