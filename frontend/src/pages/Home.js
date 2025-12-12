import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Hero from "../components/Hero/Hero";
import JobListing from "../components/JobListings";
import NavBar from "../components/navBar/NavBar";
import RecruiterNavBar from "../components/navBar/RecruiterNavBar";
import Notification from "../components/Notification";

export default function Home(){
    const navigate = useNavigate();
    const [showNotification, setShowNotification] = useState(false);
    const [isRecruiter, setIsRecruiter] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in and their type
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
                
                // Redirect admins to their dashboard
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        } else {
            setIsLoggedIn(false);
            setIsRecruiter(false);
        }

        // Check if notification should be shown (only for non-admin users)
        if (sessionStorage.getItem('showLoginNotification') === 'true') {
            // Only show notification if there's user data and they're not an admin
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    // Don't show notification if user is admin
                    if (user.role !== 'admin') {
                        setShowNotification(true);
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
            sessionStorage.removeItem('showLoginNotification');
            
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [navigate]);

    return (
        <div>
            {/* Show RecruiterNavBar if logged in as recruiter */}
            {isLoggedIn && isRecruiter ? (
                <RecruiterNavBar />
            ) : (
                // Show regular NavBar for both logged-in users and non-logged-in visitors
                <NavBar />
            )}
            
            {/* Login Success Notification Component */}
            <Notification 
              message="Welcome back! Successfully logged in to your account." 
              type="success" 
              isVisible={showNotification} 
            />
            
            <Hero />
            <JobListing />
            <Footer />
        </div>
    );
}