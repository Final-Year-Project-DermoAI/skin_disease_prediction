import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import type { UserRole } from '../types';

interface LayoutProps {
  role: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ role }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar role={role} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isExpanded ? 'ml-0' : 'ml-0'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default Layout;
