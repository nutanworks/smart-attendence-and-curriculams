import React, { useState, useCallback } from 'react';
// FIX: Use Student type instead of User, import ActivitySuggestion
import { Student, ActivitySuggestion } from '../types';
import { generateActivities } from '../services/geminiService';
// FIX: Import missing CheckCircleIcon
import { CheckCircleIcon } from './icons';

interface ActivityPlannerProps {
  // FIX: Use Student type for props
  student: Student;
  setStudent: React.Dispatch<React.SetStateAction<Student>>;
}

const ActivityPlanner: React.FC<ActivityPlannerProps> = ({ student, setStudent }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    interests: student.interests || '',
    strengths: student.strengths || '',
    careerGoals: student.careerGoals || ''
  });
  
  const studentActivities = student.activities || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setStudent(prev => ({ ...prev, ...formState }));
    setIsEditing(false);
  };

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    const result = await generateActivities(student.interests || '', student.strengths || '', student.careerGoals || '');
    setStudent(prev => ({...prev, activities: [...(prev.activities || []), ...result]}));
    setIsLoading(false);
  }, [student.interests, student.strengths, student.careerGoals, setStudent]);
  
  const handleToggleComplete = (activityId: string) => {
    setStudent(prev => {
        const updatedActivities = (prev.activities || []).map(act => 
            act.id === activityId ? { ...act, completed: !act.completed } : act
        );
        return { ...prev, activities: updatedActivities };
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Activity Planner</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Your Academic Profile</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
              <input type="text" name="interests" id="interests" value={formState.interests} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">Strengths</label>
              <input type="text" name="strengths" id="strengths" value={formState.strengths} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700">Career Goals</label>
              <input type="text" name="careerGoals" id="careerGoals" value={formState.careerGoals} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <button onClick={handleSaveProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
          </div>
        ) : (
          <div className="space-y-2 text-gray-600">
            <p><strong>Interests:</strong> {student.interests || 'Not set'}</p>
            <p><strong>Strengths:</strong> {student.strengths || 'Not set'}</p>
            <p><strong>Career Goals:</strong> {student.careerGoals || 'Not set'}</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={fetchActivities}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
        >
          {isLoading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Suggest New Activities'}
        </button>
      </div>

      <div className="mt-8">
        {isLoading && studentActivities.length === 0 && <p className="text-center text-gray-500">Generating suggestions...</p>}
        {studentActivities.length === 0 && !isLoading && <p className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg">You have no activities yet. Click the button above to get some personalized suggestions!</p>}
        
        <div className="space-y-4">
        {studentActivities.map((activity) => (
          <div key={activity.id} className={`p-4 rounded-lg shadow-md transition-all duration-300 ${activity.completed ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white border-l-4 border-indigo-500'}`}>
            <div className="flex items-start justify-between">
              <div>
                  <h4 className={`text-lg font-bold text-gray-800 ${activity.completed ? 'line-through text-gray-500' : ''}`}>{activity.title}</h4>
                  <p className={`text-gray-600 text-sm mb-3 ${activity.completed ? 'line-through text-gray-500' : ''}`}>{activity.description}</p>
                  <div className="text-xs text-indigo-700 font-semibold">{activity.duration} min</div>
              </div>
              <button 
                onClick={() => handleToggleComplete(activity.id)} 
                className={`flex items-center text-sm font-medium py-2 px-3 rounded-md transition-colors ${activity.completed ? 'bg-yellow-400 hover:bg-yellow-500 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
              >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  {activity.completed ? 'Undo' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityPlanner;
