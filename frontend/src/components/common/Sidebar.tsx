// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   HomeIcon,
//   CalendarIcon,
//   DocumentTextIcon,
//   ClockIcon,
//   UserGroupIcon,
//   ChartBarIcon,
//   Cog6ToothIcon,
// } from '@heroicons/react/24/outline';
// import { useAuth } from '../../hooks/useAuth';

// interface SidebarProps {
//   isOpen: boolean;
// }

// const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
//   const { user } = useAuth();

//  const navigation = [
//   { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
//   { name: 'Apply Leave', href: '/leave/apply', icon: DocumentTextIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
//   { name: 'Leave History', href: '/leave/history', icon: ClockIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
//   { name: 'Leave Calendar', href: '/leave/calendar', icon: CalendarIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
//   { name: 'Pending Approvals', href: '/leave/approval', icon: DocumentTextIcon, roles: ['hod', 'hr', 'admin'] },
//   { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, roles: ['admin'] },
//   { name: 'Departments', href: '/admin/departments', icon: UserGroupIcon, roles: ['admin'] },
//   { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon, roles: ['hr', 'admin'] },
//   { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
// ];

//   const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || 'staff'));

//   return (
//     <aside
//       className={`fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
//         isOpen ? 'w-64' : 'w-20'
//       }`}
//     >
//       <nav className="mt-5 px-2">
//         {filteredNavigation.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.href}
//             className={({ isActive }) =>
//               `group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 ${
//                 isActive
//                   ? 'bg-green-100 text-green-700'
//                   : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//               }`
//             }
//           >
//             <item.icon
//               className={`mr-3 h-6 w-6 flex-shrink-0 ${
//                 isOpen ? '' : 'mx-auto'
//               }`}
//             />
//             {isOpen && <span>{item.name}</span>}
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
    { name: 'Apply Leave', href: '/leave/apply', icon: DocumentTextIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
    { name: 'Leave History', href: '/leave/history', icon: ClockIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
    { name: 'Leave Calendar', href: '/leave/calendar', icon: CalendarIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
    { name: 'Pending Approvals', href: '/leave/approval', icon: DocumentTextIcon, roles: ['hod', 'hr', 'admin'] },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'Departments', href: '/admin/departments', icon: UserGroupIcon, roles: ['admin'] },
    { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon, roles: ['hr', 'admin'] },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['staff', 'hod', 'hr', 'admin'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role || 'staff'));

  return (
    <aside
      className={`fixed left-0 top-16 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="mt-5 px-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                isActive
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <item.icon
              className={`mr-3 h-6 w-6 flex-shrink-0 ${
                isOpen ? '' : 'mx-auto'
              }`}
            />
            {isOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;