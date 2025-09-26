import React, { useState, useEffect, useCallback } from 'react';
// FIX: Removed unused Course import
import { User, Teacher, Student, TimetableEntry, Task, AttendanceRecord } from '../types';
import RegistrationSuccess from './RegistrationSuccess';
import QRScanner from './QRScanner';
import Sidebar from './Sidebar';
import { UsersIcon, UserAddIcon, AttendanceIcon, TaskIcon, CalendarIcon, TrashIcon, QRIcon } from './icons';

declare const jsPDF: any;

const db = {
  getUsers: (): Record<string, User> => JSON.parse(localStorage.getItem('smartclass_users') || '{}'),
  saveUsers: (users: Record<string, User>) => localStorage.setItem('smartclass_users', JSON.stringify(users)),
  getAttendance: (): Record<string, any> => JSON.parse(localStorage.getItem('smartclass_attendance') || '{}'),
  saveAttendance: (attendance: Record<string, any>) => localStorage.setItem('smartclass_attendance', JSON.stringify(attendance)),
};

interface TeacherViewProps {
  teacher: Teacher;
  onLogout: () => void;
}

// Common styles as CSS-in-JS
const globalStyles = `
.input-style {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background-color: white;
    border: 1px solid #D1D5DB;
    border-radius: 0.375rem;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
.input-style:focus {
    outline: none;
    --tw-ring-color: #4f46e5;
    box-shadow: 0 0 0 2px var(--tw-ring-color);
    border-color: #6366f1;
}
.btn-primary {
    padding: 0.5rem 1rem;
    background-color: #4f46e5;
    color: white;
    font-weight: 600;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
}
.btn-primary:hover { background-color: #4338ca; }
.btn-secondary {
    padding: 0.5rem 1rem;
    background-color: #eef2ff;
    color: #4338ca;
    font-weight: 600;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
}
.btn-secondary:hover { background-color: #e0e7ff; }
.th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
.td-style { padding: 0.75rem 1rem; white-space: nowrap; font-size: 0.875rem; color: #374151; }
`;

const TeacherView: React.FC<TeacherViewProps> = ({ teacher, onLogout }) => {
  const [currentTeacher, setCurrentTeacher] = useState<Teacher>(teacher);
  const [roster, setRoster] = useState<Student[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ type: 'success'|'error', text: string } | null>(null);

  const refreshTeacherAndRoster = useCallback(() => {
    const allUsers = db.getUsers();
    const updatedTeacher = allUsers[teacher.id] as Teacher;
    if (updatedTeacher) {
        setCurrentTeacher(updatedTeacher);
        const studentIds = new Set(updatedTeacher.studentIds || []);
        const studentRoster = Object.values(allUsers).filter(u => u.role === 'student' && studentIds.has(u.id)) as Student[];
        setRoster(studentRoster);
    }
  }, [teacher.id]);

  useEffect(() => {
    refreshTeacherAndRoster();
  }, [refreshTeacherAndRoster]);
  
  const handleScan = (scannedId: string) => {
    setShowQRScanner(false);
    const student = roster.find(s => s.id === scannedId);
    if (student) {
        const today = new Date().toISOString().split('T')[0];
        const allAttendance = db.getAttendance();
        if (!allAttendance[today]) {
            allAttendance[today] = [];
        }
        
        const existingRecord = allAttendance[today].find((rec: AttendanceRecord) => rec.studentId === student.id);
        if (existingRecord) {
            setScanMessage({ type: 'error', text: `${student.name}'s attendance has already been marked today.` });
        } else {
            const newRecord: AttendanceRecord = {
                studentId: student.id,
                studentName: student.name,
                date: today,
                status: 'Present',
                timestamp: new Date().toISOString(),
            };
            allAttendance[today].push(newRecord);
            db.saveAttendance(allAttendance);
            setScanMessage({ type: 'success', text: `Attendance marked for ${student.name}.` });
        }
    } else {
        setScanMessage({ type: 'error', text: 'Scanned QR does not belong to a student on your roster.' });
    }
    
    setTimeout(() => setScanMessage(null), 5000); // Message disappears after 5 seconds
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <style>{globalStyles}</style>
      <Sidebar role="teacher" onLogout={onLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} onScan={handleScan} />}
      
      <div className="lg:ml-64 transition-all duration-300">
         <header className="lg:hidden p-4 bg-white border-b flex items-center justify-between sticky top-0 z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-indigo-600">Teacher Dashboard</h1>
        </header>

        <main className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h2>
                    <p className="mt-1 text-lg text-gray-500">Welcome back, {currentTeacher.name}!</p>
                </div>
                
                {scanMessage && (
                  <div className={`p-4 rounded-md text-sm ${scanMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {scanMessage.text}
                  </div>
                )}
                
                <button onClick={() => setShowQRScanner(true)} className="w-full flex items-center justify-center p-6 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300">
                    <QRIcon className="w-12 h-12 mr-4" />
                    <span className="text-2xl font-bold">Start QR Attendance Scan</span>
                </button>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                        <StudentRegistration teacher={currentTeacher} onUpdate={refreshTeacherAndRoster} />
                        <MyRoster teacher={currentTeacher} roster={roster} onUpdate={refreshTeacherAndRoster} />
                    </div>
                    <div className="space-y-8">
                        <AttendanceLog roster={roster} teacher={currentTeacher} onUpdateTeacher={setCurrentTeacher} />
                        <TaskAssigner teacher={currentTeacher} roster={roster} />
                        <TimetableManager teacher={currentTeacher} onUpdate={refreshTeacherAndRoster} />
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};


// Child Components for TeacherView
const StudentRegistration = ({ teacher, onUpdate }: { teacher: Teacher, onUpdate: () => void }) => {
    const [formData, setFormData] = useState({ name: '', age: '', class: '', gender: 'Male' as Student['gender'] });
    const [newUser, setNewUser] = useState<Student | null>(null);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const studentId = `STU-${Date.now()}`;
        const randomPassword = Math.random().toString(36).slice(-8);
        const student: Student = { ...formData, id: studentId, password: randomPassword, role: 'student' };
        
        const allUsers = db.getUsers();
        allUsers[student.id] = student;
        
        const updatedTeacher: Teacher = { ...teacher, studentIds: [...(teacher.studentIds || []), student.id] };
        allUsers[teacher.id] = updatedTeacher;
        
        db.saveUsers(allUsers);
        setNewUser(student);
        onUpdate();
        setFormData({ name: '', age: '', class: '', gender: 'Male' });
    };
    
    if (newUser) return <RegistrationSuccess user={newUser} onProceed={() => setNewUser(null)} />;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><UserAddIcon className="mr-2"/> Register a New Student</h3>
            <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="name" label="Full Name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}/>
                <InputField name="age" label="Age" type="number" value={formData.age} onChange={(e) => setFormData(p => ({...p, age: e.target.value}))}/>
                <InputField name="class" label="Class" value={formData.class} onChange={(e) => setFormData(p => ({...p, class: e.target.value}))}/>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <select name="gender" value={formData.gender} onChange={(e) => setFormData(p => ({...p, gender: e.target.value as Student['gender']}))} className="mt-1 block w-full input-style">
                        <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                </div>
                <button type="submit" className="md:col-span-2 w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">Register Student</button>
            </form>
        </div>
    );
};

const MyRoster = ({ teacher, roster, onUpdate }: { teacher: Teacher, roster: Student[], onUpdate: () => void }) => {
    const handleRemove = (studentId: string) => {
        if (!window.confirm("Are you sure you want to remove this student? This action cannot be undone.")) return;
        const updatedStudentIds = (teacher.studentIds || []).filter(id => id !== studentId);
        const updatedTeacher = { ...teacher, studentIds: updatedStudentIds };
        
        const allUsers = db.getUsers();
        allUsers[teacher.id] = updatedTeacher;
        // Optionally delete the student user from the system
        // delete allUsers[studentId]; 
        db.saveUsers(allUsers);
        onUpdate();
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><UsersIcon className="mr-2"/> My Roster ({roster.length})</h3>
            <div className="overflow-x-auto max-h-96">
                <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0"><tr>
                        <th className="th-style">Name</th><th className="th-style">Student ID</th><th className="th-style">Class</th><th className="th-style">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roster.map(s => <tr key={s.id}>
                            <td className="td-style">{s.name}</td>
                            <td className="td-style font-mono">{s.id}</td>
                            <td className="td-style">{s.class}</td>
                            <td className="td-style"><button onClick={() => handleRemove(s.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button></td>
                        </tr>)}
                    </tbody>
                </table>
                {roster.length === 0 && <p className="text-center text-gray-500 py-8">Your roster is empty.</p>}
            </div>
        </div>
    );
};

const AttendanceLog = ({ roster, teacher, onUpdateTeacher }: { roster: Student[], teacher: Teacher, onUpdateTeacher: (teacher: Teacher) => void }) => {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [totalClasses, setTotalClasses] = useState(teacher.totalClasses || 20);

    useEffect(() => {
        const allAttendance = db.getAttendance();
        const rosterIds = new Set(roster.map(s => s.id));
        const relevantAttendance = Object.values(allAttendance).flat().filter(rec => rosterIds.has(rec.studentId));
        setAttendance(relevantAttendance);
    }, [roster]);

    const handleTotalClassesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 1;
        setTotalClasses(value);
        const updatedTeacher = { ...teacher, totalClasses: value };
        const allUsers = db.getUsers();
        allUsers[teacher.id] = updatedTeacher;
        db.saveUsers(allUsers);
        onUpdateTeacher(updatedTeacher);
    };

    const handleDownloadPDF = (period: 'week' | 'month') => {
        const doc = new jsPDF.jsPDF();
        doc.text(`Attendance Report - ${teacher.name}'s Class`, 14, 22);
        
        const now = new Date();
        const today = now.getDay();
        const startOfWeek = new Date(now.setDate(now.getDate() - today + (today === 0 ? -6 : 1)));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const startDate = period === 'week' ? startOfWeek : startOfMonth;

        const filteredAttendance = attendance.filter(rec => new Date(rec.date) >= startDate);
        
        doc.text(`Period: ${period === 'week' ? 'This Week' : 'This Month'}`, 14, 28);

        const body = roster.map(student => {
            const presentCount = filteredAttendance.filter(rec => rec.studentId === student.id).length;
            return [student.name, student.id, presentCount];
        });

        doc.autoTable({
            startY: 35,
            head: [["Student Name", "Student ID", "Classes Attended"]],
            body: body
        });
        doc.save(`attendance_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><AttendanceIcon className="mr-2"/> Attendance Overview</h3>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Total No. of Classes (for %)</label>
                <input type="number" value={totalClasses} onChange={handleTotalClassesChange} className="mt-1 w-full input-style" />
            </div>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {roster.map(student => {
                    const presentCount = attendance.filter(rec => rec.studentId === student.id).length;
                    const percentage = Math.round((presentCount / totalClasses) * 100);
                    return (<div key={student.id} className="text-sm">
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <div className="flex items-center space-x-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{width: `${percentage}%`}}></div></div>
                            <span className="font-semibold w-12 text-right">{percentage}%</span>
                        </div>
                    </div>)
                })}
            </div>
             <div className="flex space-x-2">
                <button onClick={() => handleDownloadPDF('week')} className="btn-secondary">Download Week PDF</button>
                <button onClick={() => handleDownloadPDF('month')} className="btn-secondary">Download Month PDF</button>
            </div>
        </div>
    );
};

const TaskAssigner = ({ teacher, roster }: { teacher: Teacher, roster: Student[] }) => {
    const [task, setTask] = useState({ title: '', description: '' });
    const [selectedStudent, setSelectedStudent] = useState('');

    const handleAssign = () => {
        if (!task.title || !selectedStudent) return;
        const allUsers = db.getUsers();
        const student = allUsers[selectedStudent] as Student;
        if (!student) return;

        const newTask: Task = { ...task, id: `task-${Date.now()}`, assignedBy: teacher.id };
        const updatedStudent: Student = { ...student, tasks: [...(student.tasks || []), newTask] };
        allUsers[student.id] = updatedStudent;
        db.saveUsers(allUsers);
        alert(`Task "${task.title}" assigned to ${student.name}.`);
        setTask({title: '', description: ''});
        setSelectedStudent('');
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><TaskIcon className="mr-2"/> Assign a Task</h3>
            <div className="space-y-4">
                 <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full input-style">
                    <option value="">Select a student...</option>
                    {roster.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                <InputField name="title" label="Task Title" value={task.title} onChange={e => setTask(p => ({...p, title: e.target.value}))}/>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={task.description} onChange={e => setTask(p => ({...p, description: e.target.value}))} className="mt-1 w-full input-style h-24"></textarea>
                </div>
                <button onClick={handleAssign} className="w-full btn-primary">Assign Task</button>
            </div>
        </div>
    );
};

const TimetableManager = ({ teacher, onUpdate }: { teacher: Teacher, onUpdate: () => void }) => {
    const [entry, setEntry] = useState({ day: 'Monday' as TimetableEntry['day'], time: '', subject: '' });
    
    const handleAdd = () => {
        if (!entry.time || !entry.subject) return;
        const newEntry = { ...entry, id: `tt-${Date.now()}` };
        const updatedTeacher = { ...teacher, timetable: [...(teacher.timetable || []), newEntry]};
        const allUsers = db.getUsers();
        allUsers[teacher.id] = updatedTeacher;
        db.saveUsers(allUsers);
        onUpdate();
        setEntry({ day: 'Monday', time: '', subject: '' });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><CalendarIcon className="mr-2"/> Manage Timetable</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <select value={entry.day} onChange={e => setEntry(p => ({...p, day: e.target.value as TimetableEntry['day']}))} className="input-style">
                       {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d}>{d}</option>)}
                    </select>
                    <InputField name="time" label="Time (e.g., 9-10am)" value={entry.time} onChange={e => setEntry(p => ({...p, time: e.target.value}))}/>
                </div>
                <InputField name="subject" label="Subject/Class Name" value={entry.subject} onChange={e => setEntry(p => ({...p, subject: e.target.value}))}/>
                <button onClick={handleAdd} className="w-full btn-primary">Add to Schedule</button>
            </div>
            <hr className="my-4" />
            <ul className="space-y-2 max-h-40 overflow-y-auto">
                {(teacher.timetable || []).map(item => <li key={item.id} className="text-sm p-2 bg-gray-50 rounded-md"><strong>{item.day}:</strong> {item.subject} @ {item.time}</li>)}
            </ul>
        </div>
    );
};

// Common input component
const InputField = ({ name, type = "text", label, value, onChange }: { name: string, type?: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="mt-1 block w-full input-style" required />
    </div>
);

// FIX: Removed multiple default exports. This is the only one.
export default TeacherView;
