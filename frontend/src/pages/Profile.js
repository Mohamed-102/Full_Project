import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar/NavBar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import * as jobService from "../services/jobService";

export default function Profile() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sections = useMemo(() => [
    { id: 'profile', name: 'Profile', icon: assets.profile_icon || assets.person_tick_icon }
  ], []);

  useEffect(() => {
    // Check if user is logged in and is not a recruiter
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.isRecruiter === true) {
          // Recruiter trying to access user profile, redirect to recruiter profile
          navigate('/recruiter/profile');
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
    
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      // Get userId from localStorage (set after login)
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        const response = await jobService.getUserProfile(userId);
        const userData = response.data;
        
        // Split name if needed
        const nameParts = userData.name ? userData.name.split(' ') : ['', ''];
        
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(' ') || "",
          phone: userData.phone || "",
          email: userData.email || ""
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        alert('User not logged in');
        return;
      }

      // Send data to backend with combined name
      const response = await jobService.updateUserProfile(userId, {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email
      });

      // Update sessionStorage for immediate UI updates
      const updatedUser = {
        id: userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email
      };
      sessionStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Trigger navbar update
      window.dispatchEvent(new Event('userDataChanged'));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <NavBar />
      <div className="bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Side Menu */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
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
            <div className="md:col-span-3">
              <div id="section-profile" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
                <p className="text-gray-600 mb-8">Manage your profile information</p>
                
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading profile...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="w-full">
                    <div className="space-y-6">
                      {/* First Name and Last Name - Same Line */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                            required
                            disabled={saving}
                          />
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                            required
                            disabled={saving}
                          />
                        </div>
                      </div>

                      {/* Phone and Email - Same Line */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                            disabled={saving}
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                            required
                            disabled={saving}
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
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
