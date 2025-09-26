export type Role = 'admin' | 'teacher' | 'student';

export interface BaseUser {
  id: string;
  name: string;
  role: Role;
  password?: string;
}

export interface Admin extends BaseUser {
  role: 'admin';
  email: string;
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  subject: string;
  studentIds?: string[];
  timetable?: TimetableEntry[];
  totalClasses?: number;
}

// FIX: Added optional properties to support activity planning.
export interface Student extends BaseUser {
  role: 'student';
  age: string;
  class: string;
  gender: 'Male' | 'Female' | 'Other';
  tasks?: Task[];
  interests?: string;
  strengths?: string;
  careerGoals?: string;
  activities?: ActivitySuggestion[];
}

export type User = Admin | Teacher | Student;

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: string; // Teacher ID
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  status: 'Present';
  timestamp: string; // ISO String
  // FIX: Added optional courseId for student attendance tracking.
  courseId?: string;
}

// FIX: Added missing ActivitySuggestion type.
export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
}

// FIX: Added missing Course type.
export interface Course {
  id: string;
  name: string;
  time: string;
  teacher: string;
}

// FIX: Added missing View enum.
export enum View {
  Dashboard,
  Attendance,
  Planner,
}
