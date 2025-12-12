import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecruiterNavBar from '../../components/navBar/RecruiterNavBar';
import Footer from '../../components/Footer';
import { assets } from '../../assets/assets';
import * as jobService from '../../services/jobService';

export default function RecruiterProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    location: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const sections = useMemo(() => [
    { id: 'profile', name: 'Profile', icon: assets.person_tick_icon },
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
  }, [navigate]);

  const loadRecruiterProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');

      if (userId && authToken) {
        try {
          const response = await jobService.getRecruiterProfile(userId);
          const { user, recruiter } = response.data;
          
          setFormData({
            name: user.name || "",
            email: user.email || "",
            company_name: recruiter?.company_name || "",
            location: recruiter?.location || ""
          });
        } catch (error) {
          console.error('Error fetching recruiter profile from backend:', error);
          // Fallback to sessionStorage data
          const storedUserData = sessionStorage.getItem('userData');
          if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setFormData({
              name: userData.firstName ? `${userData.firstName} ${userData.lastName}` : "",
              email: userData.email || "",
              company_name: "",
              location: ""
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading recruiter profile:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecruiterProfile();
  }, [loadRecruiterProfile]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const authToken = localStorage.getItem('authToken');
      
      if (!userId) {
        showNotification('User not logged in. Please login again.', 'error');
        setSaving(false);
        return;
      }

      if (!authToken) {
        showNotification('Authentication required. Please login again.', 'error');
        setSaving(false);
        return;
      }

      // Prepare data for backend
      const backendData = {
        name: formData.name,
        email: formData.email,
        company_name: formData.company_name,
        location: formData.location
      };

      try {
        const response = await jobService.updateRecruiterProfile(userId, backendData);
        
        showNotification('Profile updated successfully!', 'success');
        
        // Refresh profile data
        loadRecruiterProfile();
      } catch (error) {
        console.error('Error updating profile on backend:', error);
        
        const errorMsg = error.response?.data?.message || 'Failed to update profile. Please try again.';
        showNotification(errorMsg, 'error');
      }
    } finally {
      setSaving(false);
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
      
      <div className="min-h-screen bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 sticky top-20">
                <nav className="space-y-0">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 border-l-4 text-left border-l-purple-800 bg-gray-50 text-gray-900 font-semibold"
                    >
                      <img src={section.icon} alt={section.name} className="w-5 h-5" />
                      <span>{section.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="md:col-span-3 space-y-6">
              
              <div id="section-profile" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={saving}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={saving}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        disabled={saving}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={saving}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        'Save Profile'
                      )}
                    </button>
                  </div>
                </form>
              )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
