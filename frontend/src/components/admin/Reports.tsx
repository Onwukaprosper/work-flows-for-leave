import React, { useState, useEffect } from 'react';
import { DocumentArrowDownIcon, ChartBarIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import PDFExportService from '../../services/pdfExportService';

interface ReportData {
  monthlyLeaves: { month: string; count: number }[];
  leaveTypes: { type: string; count: number }[];
  departmentLeaves: { department: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportType, setReportType] = useState('monthly');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setData({
        monthlyLeaves: [
          { month: 'Jan', count: 12 },
          { month: 'Feb', count: 18 },
          { month: 'Mar', count: 15 },
          { month: 'Apr', count: 22 },
          { month: 'May', count: 20 },
          { month: 'Jun', count: 25 },
        ],
        leaveTypes: [
          { type: 'Annual', count: 45 },
          { type: 'Sick', count: 28 },
          { type: 'Maternity', count: 8 },
          { type: 'Study', count: 12 },
          { type: 'Unpaid', count: 7 },
        ],
        departmentLeaves: [
          { department: 'Computer Science', count: 32 },
          { department: 'Mathematics', count: 18 },
          { department: 'Physics', count: 15 },
          { department: 'Chemistry', count: 12 },
          { department: 'Biology', count: 10 },
        ],
        statusDistribution: [
          { status: 'Approved', count: 68 },
          { status: 'Pending', count: 24 },
          { status: 'Rejected', count: 8 },
          { status: 'Cancelled', count: 5 },
        ],
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleExportReport = () => {
    if (data && data.departmentLeaves) {
      // Transform data for PDF
      const reportData = data.departmentLeaves.map(dept => ({
        firstName: dept.department,
        lastName: '',
        department: dept.department,
        leaveTypeName: 'Various',
        totalDays: dept.count,
        status: 'N/A',
        appliedAt: new Date().toISOString()
      }));
      PDFExportService.exportLeaveReport(reportData, `${reportType} Report`);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Implement actual export logic here
    toast.error('Export failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View leave statistics and generate reports</p>
        </div>
        {/* forml button position */}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="monthly">Monthly Report</option>
              <option value="quarterly">Quarterly Report</option>
              <option value="annual">Annual Report</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() =>toast.error("This Feature is Disabled")} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Generate
            </button>
            <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Export
        </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">105</div>
              <div className="text-sm text-gray-600 mt-1">Total Leave Applications</div>
            </div>
            <CalendarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">68</div>
              <div className="text-sm text-gray-600 mt-1">Approved</div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>
            <UserGroupIcon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">324</div>
              <div className="text-sm text-gray-600 mt-1">Total Days Taken</div>
            </div>
            <DocumentArrowDownIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Leave Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.monthlyLeaves}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leave Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.leaveTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.payload.type}: ${entry.payload.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data?.leaveTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise Leave */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.departmentLeaves}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.payload.status}: ${entry.payload.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data?.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Leave Report</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Abel Chinedu</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Computer Science</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Annual Leave</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mar 15 - Mar 20</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Approved
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Victor Muna</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mathematics</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sick Leave</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 10 - Feb 11</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;