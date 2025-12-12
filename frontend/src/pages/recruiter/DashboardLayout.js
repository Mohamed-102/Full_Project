import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterNavBar from '../../components/navBar/RecruiterNavBar';
import Footer from '../../components/Footer';
import { assets } from '../../assets/assets';
import * as jobService from '../../services/jobService';
import RecruteurDashboard from './dashboard/RecruteurDashboard';
import PostJob from './dashboard/PostJob';
import MyJobs from './dashboard/MyJobs';
import Applicants from './dashboard/Applicants';
import ViewJobModal from './dashboard/ViewJobModal';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [postJobData, setPostJobData] = useState({
    title: '',
    category_id: '',
    location: '',
    level: '',
    description: ''
  });

  const sections = useMemo(() => [
    { id: 'dashboard', name: 'Dashboard', icon: assets.home_icon },
    { id: 'post-job', name: 'Post Job', icon: assets.resume_selected },
    { id: 'my-jobs', name: 'My Jobs', icon: assets.suitcase_icon },
    { id: 'applicants', name: 'Applicants', icon: assets.person_tick_icon },
  ], []);

  useEffect(() => {
    // Check if user is a recruiter
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isRecruiter !== true) {
          // Not a recruiter, redirect to home
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/');
        return;
      }
    } else {
      // Not logged in, redirect to recruiter login
      navigate('/recruiter-login');
      return;
    }
    
    loadRecruiterJobs();
  }, [navigate]);

  const loadRecruiterJobs = async () => {
    setLoading(true);
    try {
      const recruiterId = localStorage.getItem('userId');
      if (recruiterId) {
        const response = await jobService.getRecruiterJobs(recruiterId);
        setJobs(response.data || []);
      }
    } catch (error) {
      console.error('Error loading recruiter jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePostJobChange = (e) => {
    const { name, value } = e.target;
    setPostJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const recruiterId = localStorage.getItem('userId');
      if (!recruiterId) {
        showNotification('Please login to post a job', 'error');
        return;
      }

      await jobService.createJob(recruiterId, postJobData);
      
      showNotification('Job posted successfully!', 'success');
      
      // Reset form
      setPostJobData({
        title: '',
        category_id: '',
        location: '',
        level: '',
        description: ''
      });
      
      // Reload jobs from backend to get proper data with relationships
      await loadRecruiterJobs();
      
      // Scroll to My Jobs section
      setTimeout(() => scrollToSection('my-jobs'), 500);
      
    } catch (error) {
      console.error('Error posting job:', error);
      showNotification('Failed to post job. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    setLoading(true);
    try {
      const recruiterId = localStorage.getItem('userId');
      await jobService.deleteJob(recruiterId, jobId);
      
      // Remove job from local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      showNotification('Job deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting job:', error);
      showNotification('Failed to delete job. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setPostJobData({
      title: job.title,
      category_id: job.category_id || job.category?.id,
      location: job.location,
      level: job.level || '',
      description: job.description
    });
    scrollToSection('post-job');
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const recruiterId = localStorage.getItem('userId');
      await jobService.updateJob(recruiterId, editingJob.id, postJobData);
      
      showNotification('Job updated successfully!', 'success');
      
      // Reset form
      setEditingJob(null);
      setPostJobData({
        title: '',
        category_id: '',
        location: '',
        level: '',
        description: ''
      });
      
      // Reload jobs from backend to get proper data with relationships
      await loadRecruiterJobs();
      
      // Scroll to My Jobs section
      setTimeout(() => scrollToSection('my-jobs'), 500);
      
    } catch (error) {
      console.error('Error updating job:', error);
      showNotification('Failed to update job. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setPostJobData({
      title: '',
      category_id: '',
      location: '',
      level: '',
      description: ''
    });
  };

  const handleViewJob = (job) => {
    setViewingJob(job);
  };

  const closeViewJobModal = () => {
    setViewingJob(null);
  };

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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div>
      <RecruiterNavBar />
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* View Job Modal */}
      <ViewJobModal viewingJob={viewingJob} closeViewJobModal={closeViewJobModal} />
      
      <div className="min-h-screen bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
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

            <div className="md:col-span-3 space-y-6">
              
              <RecruteurDashboard jobs={jobs} />
              
              <PostJob 
                postJobData={postJobData}
                handlePostJobChange={handlePostJobChange}
                handlePostJobSubmit={handlePostJobSubmit}
                handleUpdateJob={handleUpdateJob}
                handleCancelEdit={handleCancelEdit}
                editingJob={editingJob}
                loading={loading}
              />

              <MyJobs 
                jobs={jobs}
                loading={loading}
                scrollToSection={scrollToSection}
                handleViewJob={handleViewJob}
                handleEditJob={handleEditJob}
                handleDeleteJob={handleDeleteJob}
              />

              <Applicants jobs={jobs} />

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
