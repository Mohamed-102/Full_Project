import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/navBar/NavBar';
import RecruiterNavBar from '../components/navBar/RecruiterNavBar';
import Footer from '../components/Footer';
import Notification from '../components/Notification';
import { assets } from '../assets/assets';
import * as jobService from '../services/jobService';
import { AppContext } from '../context/AppContext';

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadUserData, userId } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: ''
  });

  useEffect(() => {
    // Check user authentication and type
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setIsRecruiter(user.isRecruiter === true);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      // User not logged in, save redirect URL and redirect to login
      sessionStorage.setItem('redirectAfterLogin', `/apply-job/${id}`);
      navigate('/user-login');
    }
  }, [id, navigate]);

  useEffect(() => {
    // Fetch job details
    const loadJobDetails = async () => {
      setLoading(true);
      try {
        const response = await jobService.getJobById(id);
        setJob(response.data);
      } catch (error) {
        console.error('Error loading job details from backend:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      
      // Create FormData for file upload
      const applicationData = new FormData();
      applicationData.append('fullName', formData.fullName);
      applicationData.append('email', formData.email);
      applicationData.append('phone', formData.phone);
      applicationData.append('coverLetter', formData.coverLetter);
      if (formData.resume) {
        applicationData.append('resume', formData.resume);
      }

      const response = await jobService.submitApplication(userId, id, applicationData);
      console.log('Application response:', response);
      
      // Reload user data to update applications list in context
      if (userId) {
        loadUserData(userId);
      }
      
      // Show success notification
      setNotification({
        show: true,
        message: response.message || 'Application submitted successfully!',
        type: 'success'
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        resume: null,
        coverLetter: ''
      });
      e.target.reset();

      // Hide notification and redirect after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
        navigate(`/job/${id}`);
      }, 3000);

    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit application. Please try again.';
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
      
      // Auto-hide error notification after 5 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        {isLoggedIn && isRecruiter ? <RecruiterNavBar /> : <NavBar />}
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div>
        {isLoggedIn && isRecruiter ? <RecruiterNavBar /> : <NavBar />}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
            <p className="text-gray-600 mb-6">The job you're trying to apply for doesn't exist.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      {isLoggedIn && isRecruiter ? <RecruiterNavBar /> : <NavBar />}
      
      {notification.show && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          isVisible={notification.show}
        />
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="container 2xl:px-20 mx-auto py-10">
          
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-6">
            <div className="flex items-start gap-6">
              <img src={assets.company_icon} alt="company" className="h-16 w-16" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    <img src={assets.location_icon} alt="location" className="h-4 w-4 inline mr-1" />
                    {job.location}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {job.category?.name || job.category || 'Programming'}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {job.level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Form</h2>
            <p className="text-gray-600 mb-6">
              Fill out the form below to apply for the <span className="font-semibold">{job.title}</span> position.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="+212 6 12 34 56 78"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV *</label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  placeholder="Tell us why you're a great fit for this role..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/job/${id}`)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Back to Job Details
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}