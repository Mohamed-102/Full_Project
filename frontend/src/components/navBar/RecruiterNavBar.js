import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import profileIcon from "../../assets/icons/app-interface-vectors-profile.svg";
import logoutIcon from "../../assets/icons/video-app-ui-64px-line-log-out.svg";

export default function RecruiterNavBar(){
    const navigate = useNavigate();
    const { userData, updateUserData } = useContext(AppContext);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const isLoggedIn = userData !== null && userData.isRecruiter === true;
    const userFirstLetter = userData?.firstName?.charAt(0).toUpperCase() || "R";

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        updateUserData(null);
        setShowProfileMenu(false);
        navigate('/');
    };

    return (
        <div className="shadow py-4">
            <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
                <Link to="/" className="text-3xl font-bold">
                    <span className="text-neutral-900">Job</span>
                    <span className="text-blue-600">Connect</span>
                </Link>
                
                {isLoggedIn ? (
                    // Logged In Recruiter NavBar
                    <div className="flex gap-8 max-sm:text-xs items-center">
                        <button 
                            onClick={() => {
                                navigate('/recruiter/dashboard');
                                setTimeout(() => {
                                    const element = document.getElementById('section-post-job');
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }, 100);
                            }}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                            <span>+</span>
                            <span>Post Job</span>
                        </button>

                        <div className="flex gap-4 items-center">
                            {/* Profile Circle with Dropdown */}
                            <div className="relative" ref={profileMenuRef}>
                                <button 
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex flex-col items-center gap-1 pb-2 border-b-2 border-purple-800 transition-all"
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-800 to-purple-950 text-white flex items-center justify-center font-semibold text-xs">
                                            {userFirstLetter}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs font-medium text-gray-600 hover:text-purple-800 cursor-pointer">My space</span>
                                            <svg className="w-3 h-3 text-gray-600 transform transition-transform hover:text-purple-800" style={{transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'}} fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                                        <Link 
                                            to="/recruiter/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <img src={assets.home_icon} alt="Dashboard" className="w-5 h-5" />
                                            <span className="font-medium">Dashboard</span>
                                        </Link>

                                        <Link 
                                            to="/recruiter/profile"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <img src={profileIcon} alt="Profile" className="w-5 h-5" />
                                            <span className="font-medium">Profile</span>
                                        </Link>

                                        <div className="border-t border-gray-200 my-2"></div>

                                        <button 
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
                                        >
                                            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                                            <span className="font-medium">Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Not Logged In
                    <div className="flex gap-4 items-center">
                        <Link to="/auth/recruteur-login">
                            <button className="text-gray-700 hover:text-gray-900 font-medium">Login</button>
                        </Link>
                        <Link to="/auth/recruteur-login">
                            <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors font-medium">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
