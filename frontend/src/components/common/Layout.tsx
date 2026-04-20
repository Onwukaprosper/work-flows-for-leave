// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Navbar from './Navbar';
// import Sidebar from './Sidebar';

// const Layout: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = React.useState(true);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
//       <div className="flex">
//         <Sidebar isOpen={sidebarOpen} />
//         <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
//           <div className="p-6">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;


import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;