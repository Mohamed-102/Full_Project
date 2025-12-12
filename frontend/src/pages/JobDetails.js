import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../components/navBar/NavBar';
import RecruiterNavBar from '../components/navBar/RecruiterNavBar';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import * as jobService from '../services/jobService';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addViewedJob, addSavedJob, isSaved } = useContext(AppContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isJobSaved, setIsJobSaved] = useState(false);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check user authentication and type
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setIsRecruiter(user.isRecruiter === true);
        
        // Redirect recruiters to their dashboard
        if (user.isRecruiter === true) {
          navigate('/recruiter/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch job details from backend or use local data
    const loadJobDetails = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend first
        const response = await jobService.getJobById(id);
        const jobData = response.data;
        
        if (jobData) {
          setJob(jobData);
          addViewedJob(jobData);
          const jobId = jobData.id || jobData._id;
          setIsJobSaved(isSaved(jobId));
        }
      } catch (error) {
        console.error('Error loading job details from backend:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id]);

  const handleApplyNow = () => {
    if (!isLoggedIn) {
      // User not logged in, save redirect URL and redirect to login
      sessionStorage.setItem('redirectAfterLogin', `/apply-job/${id}`);
      window.scrollTo(0, 0);
      navigate('/user-login');
    } else {
      navigate(`/apply-job/${id}`);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveClick = () => {
    if (job) {
      addSavedJob(job);
      setIsJobSaved(!isJobSaved);
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
            <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
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
      
      <div className="min-h-screen bg-gray-50">
        <div className="container 2xl:px-20 mx-auto py-10">
          
          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 mb-6">
            <div className="flex justify-between items-start">
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
                      {job.category?.name || job.category || 'Other'}
                    </span>
                    {job.level && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {job.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSaveClick}
                className="hover:opacity-80 transition-opacity p-2"
                title={isJobSaved ? "Remove from saved" : "Save job"}
              >
                <img 
                  src={isJobSaved ? assets.bookmark_filled : assets.bookmark_outline} 
                  alt="save" 
                  className="h-8 w-8"
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleApplyNow}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Apply Now
              </button>
              <button
                onClick={handleSaveClick}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                {isJobSaved ? 'Saved' : 'Save Job'}
              </button>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div 
                  className="text-gray-700 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.responsibilities.split('\n').map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {job.requirements.split('\n').map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Job Overview */}
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Job Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img src={assets.suitcase_icon} alt="icon" className="h-5 w-5 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Job Title</p>
                      <p className="font-medium text-gray-900">{job.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src={assets.location_icon} alt="icon" className="h-5 w-5 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{job.location}</p>
                    </div>
                  </div>
                  {job.level && (
                    <div className="flex items-start gap-3">
                      <img src={assets.resume_selected} alt="icon" className="h-5 w-5 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Job Level</p>
                        <p className="font-medium text-gray-900">{job.level}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <img src={assets.home_icon} alt="icon" className="h-5 w-5 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Job Category</p>
                      <p className="font-medium text-gray-900">{job.category?.name || job.category || 'Other'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <img src={assets.calendar_icon} alt="icon" className="h-5 w-5 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Posted Date</p>
                      <p className="font-medium text-gray-900">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
