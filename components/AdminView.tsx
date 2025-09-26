import React, { useState, useEffect } from 'react';
import { User, Teacher } from '../types';
import RegistrationSuccess from './RegistrationSuccess';
import { UserAddIcon, UsersIcon } from './icons';

const db = {
  getUsers: (): Record<string, User> => JSON.parse(localStorage.getItem('smartclass_users') || '{}'),
  saveUser: (user: User) => {
    const users = db.getUsers();
    users[user.id] = user;
    localStorage.setItem('smartclass_users', JSON.stringify(users));
  },
};

interface AdminViewProps {
  admin: User;
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ admin, onLogout }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', subject: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const allUsers = db.getUsers();
    const teacherUsers = Object.values(allUsers).filter(u => u.role === 'teacher') as Teacher[];
    setTeachers(teacherUsers);
  }, [showRegistrationSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegisterTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.subject) {
      setError('All fields are required.');
      return;
    }
    
    const generateRandomPassword = (length = 10) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const newTeacher: Teacher = {
      id: `TCH-${Date.now()}`,
      role: 'teacher',
      name: formData.name,
      subject: formData.subject,
      password: generateRandomPassword(),
    };

    db.saveUser(newTeacher);
    setShowRegistrationSuccess(newTeacher);
    setFormData({ name: '', subject: '' }); // Reset form
  };

  if (showRegistrationSuccess) {
    return <RegistrationSuccess user={showRegistrationSuccess} onProceed={() => setShowRegistrationSuccess(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome, {admin.name}</p>
          </div>
          <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-800">Logout</button>
        </div>
      </header>
      <main className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Register Teacher Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-lg animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><UserAddIcon className="mr-2" /> Register New Teacher</h2>
            <form onSubmit={handleRegisterTeacher} className="space-y-4">
              <InputField name="name" label="Full Name" value={formData.name} onChange={handleInputChange} />
              <InputField name="subject" label="Subject" value={formData.subject} onChange={handleInputChange} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Register Teacher</button>
            </form>
          </div>

          {/* Teacher List */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg animate-fade-in-up animation-delay-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><UsersIcon className="mr-2"/> Registered Teachers ({teachers.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{teacher.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teachers.length === 0 && <p className="text-center text-gray-500 py-8">No teachers have been registered yet.</p>}
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animation-delay-200 { animation-delay: 0.2s; }
      `}</style>
    </div>
  );
};

const InputField = ({ name, type = "text", label, value, onChange }: {name: string, type?: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
        />
    </div>
);

export default AdminView;