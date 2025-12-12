import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { USER_ROLES } from '../../constants/roles';
import logoutIcon from '../../assets/icons/video-app-ui-64px-line-log-out.svg';

export default function AdminNavBar() {
  const { userData, updateUserData } = useContext(AppContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear all storage
    sessionStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    
    // Clear context
    updateUserData(null);
    
    // Navigate to home
    window.location.href = '/';
  };

  // Only show navbar if user is admin
  if (!userData || userData.role !== USER_ROLES.ADMIN) {
    return null;
  }

  const firstLetter = userData.firstName?.charAt(0)?.toUpperCase() || 'A';

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-red-800 shadow-lg">
      <div className="container 2xl:px-20 mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">JobConnect</span>
            <span className="ml-2 px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-semibold text-white">
              ADMIN
            </span>
          </Link>

          {/* Admin Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 rounded-full pl-4 pr-1 py-1"
            >
              <span className="text-white font-medium text-sm">
                {userData.firstName} {userData.lastName}
              </span>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                {firstLetter}
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/admin/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <img src={assets.person_icon} alt="Profile" className="w-5 h-5" />
                  <span>Profile</span>
                </Link>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
