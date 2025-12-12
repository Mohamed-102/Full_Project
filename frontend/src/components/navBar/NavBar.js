import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import profileIcon from "../../assets/icons/app-interface-vectors-profile.svg";
import logoutIcon from "../../assets/icons/video-app-ui-64px-line-log-out.svg";

export default function NavBar(){
    const navigate = useNavigate();
    const { userData, updateUserData } = useContext(AppContext);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);

    const isLoggedIn = userData !== null;
    const userFirstLetter = userData?.firstName?.charAt(0).toUpperCase() || "U";

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
        localStorage.removeItem('userId');
        localStorage.removeItem('authToken');
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
                    // Logged In NavBar
                    <div className="flex gap-8 max-sm:text-xs items-end">
                        <Link to="/" className="flex flex-col items-center gap-1 text-gray-600 hover:text-purple-800 transition-colors pb-2 border-b-2 border-transparent hover:border-purple-800">
                            <img src={assets.suitcase_icon} alt="Find Jobs" className="w-5 h-5" />
                            <span className="text-xs font-medium">Find Jobs</span>
                        </Link>

                        <div className="flex gap-4 items-end">
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

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <img src={assets.home_icon} alt="Dashboard" className="w-5 h-5" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <img src={profileIcon} alt="Profile" className="w-5 h-5" />
                                            Profile
                                        </Link>
                                        <hr className="my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-4 max-sm:text-xs items-center">
                        <Link to="/recruiter-login" className="text-gray-600 hover:text-gray-900 transition-colors">Recruteur Login</Link>
                        <Link to="/user-login" className="bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full hover:bg-blue-700 transition-colors">Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}