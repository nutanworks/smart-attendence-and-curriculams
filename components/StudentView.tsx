import React, { useState, useEffect } from 'react';
import { Student, Teacher, Task, TimetableEntry, AttendanceRecord } from '../types';
import Sidebar from './Sidebar';
import { DashboardIcon, AttendanceIcon, TaskIcon, CalendarIcon } from './icons';

const db = {
  getUsers: (): Record<string, any> => JSON.parse(localStorage.getItem('smartclass_users') || '{}'),
  getAttendance: (): Record<string, AttendanceRecord[]> => JSON.parse(localStorage.getItem('smartclass_attendance') || '{}'),
};

interface StudentViewProps {
  student: Student;
  onLogout: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [totalClasses, setTotalClasses] = useState(1); // Default to 1 to avoid division by zero

  useEffect(() => {
    const allUsers = db.getUsers();
    // Find the teacher who has this student on their roster
    const studentTeacher = Object.values(allUsers).find(
      (user) => user.role === 'teacher' && user.studentIds?.includes(student.id)
    ) as Teacher | undefined;
    
    if (studentTeacher) {
      setTeacher(studentTeacher);
      setTotalClasses(studentTeacher.totalClasses || 1);
    }
    
    const allAttendance = db.getAttendance();
    const studentAttendance = Object.values(allAttendance)
        .flat()
        .filter(rec => rec.studentId === student.id);
    setAttendance(studentAttendance);
  }, [student.id]);
  
  const attendancePercentage = Math.round((attendance.length / totalClasses) * 100);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as TimetableEntry['day'];
  const todaySchedule = teacher?.timetable?.filter(entry => entry.day === today) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role="student"
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="lg:ml-64 transition-all duration-300">
        <header className="lg:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-indigo-600">SmartClass</h1>
        </header>

        <main className="p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 animate-fade-in-up">Welcome, {student.name}!</h2>
            <p className="mt-1 text-lg text-gray-500 animate-fade-in-up animation-delay-200">Here's what's happening today.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Attendance Card */}
              <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-up animation-delay-300">
                <div className={`w-24 h-24 flex-shrink-0 rounded-full flex items-center justify-center text-3xl font-bold 
                  ${attendancePercentage >= 75 ? 'bg-green-100 text-green-700' : attendancePercentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {attendancePercentage}%
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Attendance</h3>
                  <p className="text-gray-500">{attendance.length} of {totalClasses} classes attended.</p>
                </div>
              </div>
              
              {/* Today's Schedule Card */}
              <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in-up animation-delay-400 lg:col-span-2">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center"><CalendarIcon className="mr-2"/> Today's Schedule ({today})</h3>
                 {todaySchedule.length > 0 ? (
                    <ul className="space-y-3">
                      {todaySchedule.map(item => (
                        <li key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <span className="font-medium text-gray-800">{item.subject}</span>
                          <span className="text-sm text-indigo-600 font-semibold">{item.time}</span>
                        </li>
                      ))}
                    </ul>
                 ) : (
                    <p className="text-gray-500 text-center py-4">No classes scheduled for today. Enjoy your day!</p>
                 )}
              </div>
            </div>

            {/* Tasks Card */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg animate-fade-in-up animation-delay-500">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><TaskIcon className="mr-2" />Tasks from your Teacher</h3>
              <div className="space-y-4">
                {student.tasks && student.tasks.length > 0 ? student.tasks.map(task => (
                   <div key={task.id} className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                      <h4 className="font-bold text-indigo-800">{task.title}</h4>
                      <p className="text-gray-700">{task.description}</p>
                   </div>
                )) : (
                  <p className="text-gray-500 text-center py-4">You have no new tasks. Great job staying on top of your work!</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .animation-delay-200 { animation-delay: 0.2s; transform: translateY(20px); }
        .animation-delay-300 { animation-delay: 0.3s; transform: translateY(20px); }
        .animation-delay-400 { animation-delay: 0.4s; transform: translateY(20px); }
        .animation-delay-500 { animation-delay: 0.5s; transform: translateY(20px); }
      `}</style>
    </div>
  );
};

export default StudentView;
