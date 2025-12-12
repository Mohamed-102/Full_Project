import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import AdminNavBar from '../../components/navBar/AdminNavBar';
import Footer from '../../components/Footer';
import AdminStats from './dashboard/AdminStats';
import RecruitersManagement from './dashboard/RecruitersManagement';
import UsersManagement from './dashboard/UsersManagement';
import JobApprovals from './dashboard/JobApprovals';
import { USER_ROLES } from '../../constants/roles';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userData, updateUserData } = useContext(AppContext);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    // Check session storage for admin user
    const storedUserData = sessionStorage.getItem('userData');
    
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        if (parsedUser.role === USER_ROLES.ADMIN) {
          // Update context if not already set
          if (!userData || userData.id !== parsedUser.id) {
            updateUserData(parsedUser);
          }
        } else {
          // Not an admin, redirect
          navigate('/admin-login');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/admin-login');
      }
    } else {
      // No user data, redirect to login
      navigate('/admin-login');
    }
  }, [navigate, userData, updateUserData]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      )
    },
    {
      id: 'recruiters',
      label: 'Recruiters',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      )
    },
    {
      id: 'users',
      label: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )
    },
    {
      id: 'jobs',
      label: 'Job Approvals',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminStats />;
      case 'recruiters':
        return <RecruitersManagement />;
      case 'users':
        return <UsersManagement />;
      case 'jobs':
        return <JobApprovals />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavBar />
      
      <div className="flex-1 bg-gray-100">
        <div className="container 2xl:px-20 mx-auto py-8">
          <div className="flex gap-6">
            
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow sticky top-24">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Admin Menu</h2>
                  <nav className="space-y-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
