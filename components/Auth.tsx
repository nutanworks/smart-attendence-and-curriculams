import React, { useState } from 'react';
import { User, Admin } from '../types';
import { EyeIcon, EyeOffIcon, LogoIcon, StudyIllustration } from './icons';

const db = {
  getUsers: (): Record<string, User> => {
    const users = localStorage.getItem('smartclass_users');
    if (users) {
        return JSON.parse(users);
    }
    // Initialize with Admin user if not present
    const adminUser: Admin = { 
        id: 'ADMIN-001', 
        name: 'Admin', 
        role: 'admin', 
        email: 'nutanms123@gmail.com', 
        password: 'Nms123td@' 
    };
    const initialUsers = { [adminUser.id]: adminUser };
    localStorage.setItem('smartclass_users', JSON.stringify(initialUsers));
    return initialUsers;
  },
  findUserById: (id: string): User | null => {
    const users = db.getUsers();
    return users[id.toUpperCase()] || null;
  },
  findUserByEmail: (email: string): User | null => {
    const users = db.getUsers();
    return Object.values(users).find(u => 'email' in u && u.email === email) || null;
  }
};

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

type LoginRole = 'admin' | 'teacher' | 'student';

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [activeRole, setActiveRole] = useState<LoginRole>('student');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ id: '', email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { id, email, password } = formData;

    if (activeRole === 'admin') {
      if (!email || !password) {
        setError('Please enter your email and password.');
        return;
      }
      const adminUser = db.findUserByEmail(email);
      if (adminUser?.role === 'admin' && adminUser.password === password) {
        onLoginSuccess(adminUser);
      } else {
        setError('Invalid admin credentials.');
      }
    } else { // Teacher or Student
      const trimmedId = id.trim();
      if (!trimmedId || !password) {
        setError('Please enter your ID and password.');
        return;
      }
      const user = db.findUserById(trimmedId);
      if (user && user.password === password && user.role === activeRole) {
        onLoginSuccess(user);
      } else {
        setError('Invalid ID, password, or role for this login type.');
      }
    }
  };

  const LoginTab = ({ role, label }: { role: LoginRole, label: string }) => (
    <button 
      type="button"
      onClick={() => { setActiveRole(role); setError(''); setFormData({ id: '', email: '', password: '' })}}
      className={`pb-2 text-sm font-medium transition-colors duration-300 ease-in-out border-b-2
        ${activeRole === role ? 'border-[#38A169] text-black' : 'border-transparent text-gray-500 hover:text-black'}`}
    >
      {label}
    </button>
  );

  const getLabel = () => {
    switch(activeRole) {
      case 'admin': return 'Admin Email';
      case 'teacher': return 'Teacher ID';
      case 'student': return 'Student ID';
      default: return 'ID or Email';
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F5F1] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden flex flex-col lg:flex-row animate-fade-in">
        
        {/* Left Panel: Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-green-50 p-12 text-center">
            <StudyIllustration className="w-64 h-64 mb-6"/>
            <h1 className="text-3xl font-bold text-black">SmartClass Hub</h1>
            <p className="mt-2 text-black">Unlock your academic potential with our modern learning platform.</p>
        </div>
        
        {/* Right Panel: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
                <LogoIcon className="h-8 w-8 text-[#38A169]" />
                <h2 className="text-2xl font-bold text-black">Sign In</h2>
            </div>
            
            <div className="flex space-x-6 border-b mb-6">
              <LoginTab role="student" label="Student" />
              <LoginTab role="teacher" label="Teacher" />
              <LoginTab role="admin" label="Admin" />
            </div>

            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm text-center">{error}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor={activeRole === 'admin' ? 'email' : 'id'} className="block text-sm font-medium text-black mb-1">{getLabel()}</label>
                <input
                    id={activeRole === 'admin' ? 'email' : 'id'}
                    name={activeRole === 'admin' ? 'email' : 'id'}
                    type={activeRole === 'admin' ? 'email' : 'text'}
                    value={activeRole === 'admin' ? formData.email : formData.id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password"className="block text-sm font-medium text-black">Password</label>
                    <a href="#" className="text-sm text-green-600 hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                    />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-800">
                        {showPassword ? <EyeOffIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                     </button>
                </div>
              </div>

              <button type="submit" className="w-full py-3 px-4 bg-[#2D3748] text-white font-semibold rounded-md shadow-md hover:bg-[#1A202C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D3748] transition-all">
                Sign In
              </button>
            </form>
        </div>
      </div>
       <style>{`
        .animate-fade-in { animation: fadeIn 0.7s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.98); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Auth;