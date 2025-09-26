import React, { useState, useEffect } from 'react';
import { User } from './types';
import Welcome from './components/Welcome';
import Auth from './components/Auth';
import AdminView from './components/AdminView';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'welcome' | 'auth' | 'dashboard'>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for a logged-in user in session storage on initial load
    const loggedInUserId = localStorage.getItem('smartclass_session');
    if (loggedInUserId) {
      const users = JSON.parse(localStorage.getItem('smartclass_users') || '{}');
      const user = users[loggedInUserId];
      if (user) {
        setCurrentUser(user);
        setAppState('dashboard');
      } else {
        setAppState('auth');
      }
    } else {
        // If no session, decide if we should show welcome or auth
        const hasVisited = localStorage.getItem('smartclass_has_visited');
        if(hasVisited) {
            setAppState('auth');
        } else {
            setAppState('welcome');
        }
    }
    setIsLoading(false);
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('smartclass_has_visited', 'true');
    setAppState('auth');
  };

  const handleLogin = (user: User) => {
    localStorage.setItem('smartclass_session', user.id);
    setCurrentUser(user);
    setAppState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('smartclass_session');
    setCurrentUser(null);
    setAppState('auth');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
      );
    }
    
    switch (appState) {
        case 'welcome':
            return <Welcome onGetStarted={handleGetStarted} />;
        case 'auth':
            return <Auth onLoginSuccess={handleLogin} />;
        case 'dashboard':
            if (currentUser?.role === 'admin') {
                return <AdminView admin={currentUser} onLogout={handleLogout} />;
            }
            if (currentUser?.role === 'teacher') {
                return <TeacherView teacher={currentUser} onLogout={handleLogout} />;
            }
            if (currentUser?.role === 'student') {
                return <StudentView student={currentUser} onLogout={handleLogout} />;
            }
            // Fallback to auth if something is wrong
            setAppState('auth');
            return <Auth onLoginSuccess={handleLogin} />;
        default:
             return <Welcome onGetStarted={handleGetStarted} />;
    }
  };
  
  return <div className="antialiased">{renderContent()}</div>;
};

export default App;
