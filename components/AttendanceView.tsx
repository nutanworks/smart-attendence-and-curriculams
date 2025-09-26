import React from 'react';
import { Course, AttendanceRecord } from '../types';

interface AttendanceViewProps {
  courses: Course[];
  attendance: AttendanceRecord[];
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ courses, attendance }) => {
  const getStatus = (courseId: string) => {
    const record = attendance.find(a => a.courseId === courseId);
    return record ? record.status : 'Absent';
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">My Attendance</h2>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Teacher</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => {
                const status = getStatus(course.id);
                return (
                  <tr key={course.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{course.name}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{course.time}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{course.teacher}</p>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 text-sm">
                      <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                        status === 'Present'
                          ? 'text-green-900'
                          : 'text-red-900'
                      }`}>
                        <span aria-hidden className={`absolute inset-0 ${
                          status === 'Present'
                            ? 'bg-green-200'
                            : 'bg-red-200'
                        } opacity-50 rounded-full`}></span>
                        <span className="relative">{status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
