import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import AdminNavBar from '../../components/navBar/AdminNavBar';
import Footer from '../../components/Footer';
import Notification from '../../components/Notification';
import { assets } from '../../assets/assets';
import { USER_ROLES } from '../../constants/roles';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useContext(AppContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!userData || userData.role !== USER_ROLES.ADMIN) {
      navigate('/admin-login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`http://localhost:8000/api/admin/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        const nameParts = data.name?.split(' ') || ['', ''];
        setFormData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: data.email || '',
          password: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        showMessage('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userData, navigate]);

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 4000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If password fields are filled, validate they match
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
      }
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const updateData = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email
      };

      // Only include password if it's being updated
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`http://localhost:8000/api/admin/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();

      // Update context and session storage
      const updatedUser = {
        ...userData,
        name: data.user.name,
        email: data.user.email
      };
      updateUserData(updatedUser);
      sessionStorage.setItem('userData', JSON.stringify(updatedUser));

      showMessage('Profile updated successfully!', 'success');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavBar />
      <Notification message={message} type={messageType} isVisible={!!message} />
      
      <div className="flex-1 bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
                  <p className="text-sm text-gray-600">Manage your administrator account</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-medium text-gray-700 mb-4">Change Password (optional)</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 pr-10"
                          placeholder="Leave blank to keep current password"
                        />
                        {formData.password && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800"
                          >
                            <img src={assets.lock_icon} alt="toggle" className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 pr-10"
                          placeholder="Confirm new password"
                        />
                        {formData.confirmPassword && (
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800"
                          >
                            <img src={assets.lock_icon} alt="toggle" className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold py-3 px-4 rounded-md hover:from-red-700 hover:to-red-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-md hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
