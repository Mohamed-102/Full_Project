import { useEffect, useState } from 'react';
import { assets } from '../../../assets/assets';

export default function JobApprovals() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/admin/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      let data = await response.json();
      // Only show jobs with status 'pending'
      data = (data || []).filter(job => job.status === 'pending');
      setJobs(data);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/admin/jobs/${jobId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to approve job');

      // Remove approved job from list
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Failed to approve job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (jobId) => {
    setActionLoading(jobId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/admin/jobs/${jobId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to reject job');

      // Remove rejected job from list
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Failed to reject job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm(`Are you sure you want to approve all ${jobs.length} jobs?`)) {
      return;
    }

    setActionLoading('all');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/admin/jobs/approve-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to approve all jobs');

      const data = await response.json();
      alert(data.message);
      
      // Clear all jobs from list
      setJobs([]);
    } catch (error) {
      console.error('Error approving all jobs:', error);
      alert('Failed to approve all jobs');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Job Approvals</h2>
        {jobs.length > 0 && (
          <button
            onClick={handleApproveAll}
            disabled={actionLoading === 'all'}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === 'all' ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Approving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Approve All ({jobs.length})
              </>
            )}
          </button>
        )}
      </div>
      
      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-500 text-lg">No pending job approvals</p>
          <p className="text-sm text-gray-400 mt-2">All jobs have been reviewed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
              
              {/* Job Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <img src={assets.suitcase_icon} alt="company" className="w-4 h-4" />
                      <span>{job.recruiter?.company_name || 'Unknown Company'}</span>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div className="space-y-2 mb-4">
                  {job.level && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <img src={assets.suitcase_icon} alt="level" className="w-4 h-4" />
                      <span>{job.level}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <img src={assets.location_icon} alt="location" className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <img src={assets.suitcase_icon} alt="category" className="w-4 h-4" />
                    <span>{job.category || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description:</h4>
                <p className="text-sm text-gray-700 mb-4">{job.description}</p>
                
                {job.requirement && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements:</h4>
                    <p className="text-sm text-gray-700">{job.requirement}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-gray-50 flex gap-2">
                <button
                  onClick={() => handleApprove(job.id)}
                  disabled={actionLoading === job.id}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-700 hover:to-green-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {actionLoading === job.id ? 'Processing...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleReject(job.id)}
                  disabled={actionLoading === job.id}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold py-2 px-4 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {actionLoading === job.id ? 'Processing...' : '✕ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
