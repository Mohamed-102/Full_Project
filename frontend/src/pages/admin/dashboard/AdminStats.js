import { useEffect, useState } from 'react';
import StatsCard from '../../../components/StatsCard';
import { assets } from '../../../assets/assets';
import interviewIcon from '../../../assets/icons/personality-traits-interview.svg';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalRecruiters: 0,
    totalUsers: 0,
    totalApplications: 0,
    totalJobs: 0,
    totalInterviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats({
        totalRecruiters: data.totalRecruiters || 0,
        totalUsers: data.totalUsers || 0,
        totalApplications: data.totalApplications || 0,
        totalJobs: data.totalJobs || 0,
        totalInterviews: data.totalInterviews || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalRecruiters: 0,
        totalUsers: 0,
        totalApplications: 0,
        totalJobs: 0,
        totalInterviews: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total Recruiters',
      value: stats.totalRecruiters,
      gradient: 'from-purple-500 to-purple-700',
      icon: assets.person_tick_icon
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      gradient: 'from-blue-500 to-blue-700',
      icon: assets.person_icon
    },
    {
      title: 'Total Applicants',
      value: stats.totalApplications,
      gradient: 'from-green-500 to-green-700',
      icon: assets.suitcase_icon
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      gradient: 'from-orange-500 to-orange-700',
      icon: assets.suitcase_icon
    },
    {
      title: 'Total Interviews',
      value: stats.totalInterviews,
      gradient: 'from-teal-500 to-teal-700',
      icon: interviewIcon
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>
    </div>
  );
}
