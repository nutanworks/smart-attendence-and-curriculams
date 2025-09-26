import React, { useState, useCallback, useEffect } from 'react';
// FIX: Import Student type for more specific typing
import { User, Course, AttendanceRecord, View, Student } from '../types';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import QRScanner from './QRScanner';
import AttendanceView from './AttendanceView';
import ActivityPlanner from './ActivityPlanner';
import MyQRCodeModal from './MyQRCodeModal';

const getCoursesFromStorage = (): Course[] => {
    const courses = localStorage.getItem('smartclass_courses');
    if (courses) {
        try {
            return JSON.parse(courses);
        } catch(e) { /* Fallback below */ }
    }
    const defaultCourses: Course[] = [
      { id: 'CS101', name: 'Intro to Computer Science', time: '09:00 - 10:30', teacher: 'Dr. Turing' },
      { id: 'MA202', name: 'Calculus II', time: '11:00 - 12:30', teacher: 'Prof. Newton' },
    ];
    localStorage.setItem('smartclass_courses', JSON.stringify(defaultCourses));
    return defaultCourses;
};

interface MainViewProps {
  // FIX: Use specific Student type for initialStudent prop
  initialStudent: Student;
  onLogout: () => void;
}

const MainView: React.FC<MainViewProps> = ({ initialStudent, onLogout }) => {
  // FIX: Use Student type for state
  const [student, setStudent] = useState<Student>(initialStudent);
  const [courses, setCourses] = useState<Course[]>(getCoursesFromStorage());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadAttendance = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const allAttendance = JSON.parse(localStorage.getItem('smartclass_attendance') || '{}');
    const todayAttendanceByCourse = allAttendance[today] || {};
    
    const studentAttendance: AttendanceRecord[] = [];
    courses.forEach(course => {
        const courseRecords = todayAttendanceByCourse[course.id] || [];
        const record = courseRecords.find((rec: any) => rec.studentId === student.id && rec.status === 'Present');
        if (record) {
            // FIX: Ensure a complete record is created and timestamp is a string
            studentAttendance.push({ 
                ...record,
                courseId: course.id, 
                date: today,
                timestamp: new Date(record.timestamp).toISOString() 
            });
        }
    });
    setAttendance(studentAttendance);
  }, [student.id, courses]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'smartclass_attendance_updated' || event.key === 'smartclass_courses_updated') {
            setCourses(getCoursesFromStorage());
            loadAttendance();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadAttendance]);


  // FIX: Use Student type for updated student data
  const handleUpdateStudent = (updatedStudent: React.SetStateAction<Student>) => {
    const newStudentData = typeof updatedStudent === 'function' ? updatedStudent(student) : updatedStudent;
    
    const users = JSON.parse(localStorage.getItem('smartclass_users') || '{}');
    users[newStudentData.id] = newStudentData;
    localStorage.setItem('smartclass_users', JSON.stringify(users));

    setStudent(newStudentData);
  }

  // FIX: Accept scanned data, though it's not used in this simplified logic
  const handleScanSuccess = useCallback((scannedData: string) => {
    const attendedCourseIds = new Set(attendance.map(a => a.courseId));
    const nextClassToAttend = courses.find(c => !attendedCourseIds.has(c.id));

    localStorage.setItem('smartclass_attendance_scan', JSON.stringify({
      student: { id: student.id, name: student.name },
      course: nextClassToAttend,
      timestamp: new Date().toISOString()
    }));
    // This is a hack to trigger storage event on other tabs
    localStorage.removeItem('smartclass_attendance_scan');

    if (nextClassToAttend) {
      const today = new Date().toISOString().split('T')[0];
      // FIX: Create a complete AttendanceRecord with a string timestamp
      const newRecord: AttendanceRecord = { 
        studentId: student.id, 
        studentName: student.name, 
        date: today,
        courseId: nextClassToAttend.id, 
        status: 'Present', 
        timestamp: new Date().toISOString() 
      };
      setAttendance(prev => [...prev, newRecord]);

      
      const allAttendance = JSON.parse(localStorage.getItem('smartclass_attendance') || '{}');
      if (!allAttendance[today]) allAttendance[today] = {};
      if (!allAttendance[today][nextClassToAttend.id]) allAttendance[today][nextClassToAttend.id] = [];
      
      // FIX: timestamp in newRecord is already a string
      const scanEntry = { studentId: student.id, studentName: student.name, timestamp: newRecord.timestamp, status: 'Present' };
      
      const existingEntryIndex = allAttendance[today][nextClassToAttend.id].findIndex((rec: any) => rec.studentId === student.id);
      if (existingEntryIndex > -1) {
          allAttendance[today][nextClassToAttend.id][existingEntryIndex] = scanEntry;
      } else {
          allAttendance[today][nextClassToAttend.id].push(scanEntry);
      }
      localStorage.setItem('smartclass_attendance', JSON.stringify(allAttendance));
    }
  }, [attendance, courses, student]);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <Dashboard 
                  student={student} 
                  courses={courses} 
                  attendance={attendance} 
                  setShowQRScanner={setShowQRScanner}
                  setShowIDCard={setShowIDCard}
                  setView={setCurrentView}
                />;
      case View.Attendance:
        return <AttendanceView courses={courses} attendance={attendance} />;
      case View.Planner:
        return <ActivityPlanner student={student} setStudent={handleUpdateStudent} />;
      default:
        return <Dashboard 
                  student={student} 
                  courses={courses} 
                  attendance={attendance} 
                  setShowQRScanner={setShowQRScanner}
                  setShowIDCard={setShowIDCard}
                  setView={setCurrentView}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* FIX: Removed non-existent props 'currentView' and 'setView' */}
      <Sidebar role="student" onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 bg-white border-b flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <h1 className="text-xl font-bold text-indigo-600 ml-4">SmartClass</h1>
        </header>

        <main className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {renderView()}
            </div>
        </main>
      </div>
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          // FIX: Changed prop from 'onScanSuccess' to 'onScan'
          onScan={handleScanSuccess}
        />
      )}
      {showIDCard && (
        <MyQRCodeModal
          user={student}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </div>
  );
};

export default MainView;
