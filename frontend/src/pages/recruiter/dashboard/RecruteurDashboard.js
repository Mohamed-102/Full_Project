import { useState, useEffect, useRef } from 'react';
import { assets } from '../../../assets/assets';
import * as jobService from '../../../services/jobService';

export default function RecruteurDashboard({ jobs }) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    approvedJobs: 0,
    pendingJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const hasLoadedStats = useRef(false);

  useEffect(() => {
    const loadDashboardStats = async () => {
      // Prevent double loading
      if (hasLoadedStats.current) {
        return;
      }
      hasLoadedStats.current = true;
      
      setLoading(true);
      try {
        const recruiterId = localStorage.getItem('userId');
        if (recruiterId) {
          const response = await jobService.getRecruiterStats(recruiterId);
          setStats({
            totalJobs: response.data.total_jobs || 0,
            totalApplicants: response.data.total_applicants || 0,
            approvedJobs: response.data.approved_jobs || 0,
            pendingJobs: response.data.pending_jobs || 0
          });
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback to calculating from jobs prop if backend fails
        setStats({
          totalJobs: jobs.length,
          totalApplicants: 0,
          approvedJobs: jobs.filter(job => job.status === 'approved').length || 0,
          pendingJobs: jobs.filter(job => job.status === 'pending').length || 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);

  if (loading) {
    return (
      <div id="section-dashboard" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="section-dashboard" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 mb-2">Total Jobs Posted</p>
              <p className="text-3xl font-bold">{stats.totalJobs}</p>
            </div>
            <img src={assets.suitcase_icon} alt="jobs" className="w-12 h-12 opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 mb-2">Total Applicants</p>
              <p className="text-3xl font-bold">{stats.totalApplicants}</p>
            </div>
            <img src={assets.person_tick_icon} alt="applicants" className="w-12 h-12 opacity-30" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="opacity-90 mb-2">Approved Jobs</p>
              <p className="text-3xl font-bold">{stats.approvedJobs}</p>
            </div>
            <img src={assets.resume_selected} alt="approved" className="w-12 h-12 opacity-30" />
          </div>
        </div>
      </div>
    </div>
  );
}
