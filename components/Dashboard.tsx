import React from 'react';
// FIX: Use Student type
import { User, Course, AttendanceRecord, View, Student } from '../types';
// FIX: Import UserCircleIcon
import { QRIcon, UserCircleIcon } from './icons';

interface DashboardProps {
  // FIX: Use Student type
  student: Student;
  courses: Course[];
  attendance: AttendanceRecord[];
  setShowQRScanner: (show: boolean) => void;
  setShowIDCard: (show: boolean) => void;
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ student, courses, attendance, setShowQRScanner, setShowIDCard, setView }) => {
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const totalClasses = courses.length;

  const getNextClass = () => {
    const attendedCourseIds = new Set(attendance.map(a => a.courseId));
    return courses.find(c => !attendedCourseIds.has(c.id));
  };
  
  const nextClass = getNextClass();

  const studentActivities = student.activities || [];
  const completedActivities = studentActivities.filter(a => a.completed).length;
  const totalActivities = studentActivities.length;
  const progressPercent = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Welcome back, {student.name}!</h2>
      <p className="mt-1 text-lg text-gray-500">Here's your summary for today.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full flex flex-col items-center justify-center p-8 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300"
        >
          <QRIcon className="w-16 h-16 mb-2" />
          <span className="text-2xl font-bold">Scan for Attendance</span>
          <span className="text-sm font-light">Scan the classroom's QR code</span>
        </button>
         <button
          onClick={() => setShowIDCard(true)}
          className="w-full flex flex-col items-center justify-center p-8 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-transform transform hover:scale-105 duration-300"
        >
          <UserCircleIcon className="w-16 h-16 mb-2" />
          <span className="text-2xl font-bold">Show My ID Card</span>
          <span className="text-sm font-light">Display your QR code for scanning</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Attendance</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{presentCount} / {totalClasses}</p>
            <p className="text-gray-500">classes attended</p>
          </div>
          <button onClick={() => setView(View.Attendance)} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 self-start">View Details &rarr;</button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Next Up</h3>
          {nextClass ? (
            <>
              <p className="text-2xl font-bold text-gray-800 mt-2">{nextClass.name}</p>
              <p className="text-gray-500">{nextClass.time}</p>
              <p className="text-gray-500">with {nextClass.teacher}</p>
            </>
          ) : (
            <p className="text-xl text-green-600 font-semibold mt-4">All classes for today are marked! Great job.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-gray-700">Activity Progress</h3>
          {totalActivities > 0 ? (
            <div>
              <p className="text-gray-600 mt-2 mb-3">
                <span className="font-bold">{completedActivities} / {totalActivities}</span> activities completed.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mt-2">Get personalized tasks in the planner to see your progress.</p>
          )}
          <button onClick={() => setView(View.Planner)} className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 self-start">Go to Planner &rarr;</button>
        </div>
        
        <div className="bg-indigo-50 p-6 rounded-lg shadow-lg flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-semibold text-indigo-800">Have a Free Period?</h3>
            <p className="text-indigo-700 mt-2">Boost your learning with AI-powered tasks tailored to your career goals.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
