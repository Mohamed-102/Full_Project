import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import * as jobService from '../../services/jobService';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toDateString();
  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (dateOnly === todayString) {
    return `Today at ${time}`;
  } else if (dateOnly === yesterdayString) {
    return `Yesterday at ${time}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${time}`;
  }
};

// Content component used in both Dashboard and standalone page
function ViewedJobsContent() {
  const { viewedJobs, userId, clearViewedJobs } = useContext(AppContext);
  const navigate = useNavigate();

  // Show only the last 10 viewed jobs
  const recentViewedJobs = viewedJobs.slice().reverse().slice(0, 10);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all viewed jobs?')) {
      try {
        if (userId) {
          await clearViewedJobs();
        }
      } catch (error) {
        console.error('Error clearing viewed jobs:', error);
        alert('Failed to clear viewed jobs');
      }
    }
  };

  return (
    <div className="space-y-4">
      {viewedJobs.length === 0 ? (
        <p className="text-gray-600">You haven't viewed any jobs yet.</p>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-4">
            {recentViewedJobs.map((job) => (
              <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-2 flex-grow">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{job.location}</p>
                    <p className="text-xs text-gray-500 mt-2">Viewed: {formatDateTime(job.viewedAt)}</p>
                  </div>
                  <span className="bg-blue-50 border border-blue-200 px-3 py-1 rounded text-xs text-gray-700 ml-2">{job.level}</span>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => navigate(`/job/${job.id || job._id}`)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                  >
                    View Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ViewedJobs() {
  return <ViewedJobsContent />;
}
