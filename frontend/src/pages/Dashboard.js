import { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar/NavBar';
import Footer from '../components/Footer';
import { assets } from '../assets/assets';
import { AppContext } from '../context/AppContext';
import ViewedJobs from './dashboard/ViewedJobs';
import SavedJobs from './dashboard/SavedJobs';
import ApplicationTracker from './dashboard/ApplicationTracker';
import { getDashboardStats } from '../services/jobService';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const { userId, savedJobs, viewedJobs, applications } = useContext(AppContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const sections = useMemo(() => [
    { id: 'dashboard', name: 'Dashboard', icon: assets.home_icon },
    { id: 'viewed-jobs', name: 'Viewed Jobs', icon: assets.suitcase_icon },
    { id: 'saved-jobs', name: 'Saved Jobs', icon: assets.person_tick_icon },
    { id: 'application-tracker', name: 'Application Tracker', icon: assets.resume_selected },
  ], []);

  useEffect(() => {
    // Check if user is logged in and is not a recruiter
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isRecruiter === true) {
          // Recruiter trying to access user dashboard, redirect to recruiter dashboard
          navigate('/recruiter/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // Not logged in, redirect to login
      navigate('/user-login');
      return;
    }
  }, [navigate]);

  // Separate effect for fetching dashboard stats whenever userId changes
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (userId) {
        console.log('Fetching dashboard stats for userId:', userId);
        try {
          setLoading(true);
          const stats = await getDashboardStats(userId);
          console.log('Dashboard stats received:', stats);
          setDashboardStats(stats);
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
          console.error('Error response:', error.response?.data);
          setDashboardStats(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No userId available yet');
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchDashboardStats();
    }
  }, [userId]);

  // Reload stats when saved/viewed jobs or applications change
  useEffect(() => {
    if (userId) {
      console.log('Data changed, reloading stats. Saved:', savedJobs.length, 'Viewed:', viewedJobs.length, 'Apps:', applications.length);
      // Update dashboard stats to reflect current counts without making API call
      setDashboardStats({
        viewedCount: viewedJobs.length,
        savedCount: savedJobs.length,
        applicationsCount: applications.length
      });
    }
  }, [savedJobs, viewedJobs, applications, userId]);

  useEffect(() => {
    const handleScroll = () => {
      sections.forEach((section) => {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      setTimeout(() => {
        if (id === 'dashboard') {
          // For dashboard, scroll to very top showing navbar
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // For other sections, scroll to section start below navbar
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div>
      <NavBar />
      
      <div className="min-h-screen bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Side Menu */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-20">
                <nav className="space-y-0">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 border-l-4 text-left ${
                        activeSection === section.id
                          ? 'border-l-purple-800 bg-gray-50 text-gray-900 font-semibold'
                          : 'border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <img src={section.icon} alt={section.name} className="w-5 h-5" />
                      <span>{section.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 space-y-6">
              
              <div id="section-dashboard" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
                {loading ? (
                  <p className="text-gray-600">Loading stats...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="opacity-90 mb-2">Viewed Jobs</p>
                          <p className="text-3xl font-bold">{dashboardStats?.viewedCount || 0}</p>
                        </div>
                        <img src={assets.resume_selected} alt="viewed jobs" className="w-12 h-12 opacity-30" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="opacity-90 mb-2">Saved Jobs</p>
                          <p className="text-3xl font-bold">{dashboardStats?.savedCount || 0}</p>
                        </div>
                        <img src={assets.suitcase_icon} alt="saved jobs" className="w-12 h-12 opacity-30" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-6 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="opacity-90 mb-2">Applications</p>
                          <p className="text-3xl font-bold">{dashboardStats?.applicationsCount || 0}</p>
                        </div>
                        <img src={assets.person_tick_icon} alt="applications" className="w-12 h-12 opacity-30" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div id="section-viewed-jobs" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Viewed Jobs</h2>
                  <ViewedJobs />
                </div>
              </div>

              <div id="section-saved-jobs" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h2>
                  <SavedJobs />
                </div>
              </div>

              <div id="section-application-tracker" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <ApplicationTracker />
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
