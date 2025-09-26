import React from 'react';
import { Role } from '../types';
import { DashboardIcon, AttendanceIcon, TaskIcon, UsersIcon, UserAddIcon, CalendarIcon } from './icons';

interface SidebarProps {
  role: 'student' | 'teacher';
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  // Below props are placeholders for future tabbed navigation within views
  // currentView?: any;
  // setView?: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout, isOpen, setIsOpen }) => {
  const studentNavItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'My Attendance', icon: <AttendanceIcon /> },
    { label: 'My Tasks', icon: <TaskIcon /> },
    { label: 'Timetable', icon: <CalendarIcon /> },
  ];

  const teacherNavItems = [
    { label: 'Dashboard', icon: <DashboardIcon /> },
    { label: 'Register Student', icon: <UserAddIcon /> },
    { label: 'My Roster', icon: <UsersIcon /> },
    { label: 'Attendance', icon: <AttendanceIcon /> },
  ];

  const navItems = role === 'student' ? studentNavItems : teacherNavItems;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between h-20 border-b px-4">
          <h1 className="text-2xl font-bold text-indigo-600">SmartClass</h1>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              // onClick={() => { setIsOpen(false); /* Add setView logic here if needed */ }}
              // For this version, the sidebar is for visual navigation structure only
              className={`w-full flex items-center px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-800`}
            >
              {React.cloneElement(item.icon, { className: 'w-6 h-6 mr-3' })}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-200 text-red-600 hover:bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
