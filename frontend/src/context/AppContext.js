import { createContext, useState, useEffect } from "react";
import * as jobService from "../services/jobService";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const [isSearched, setIsSearched] = useState(false)
    const [searchFilter, setSearchFilter] = useState("");
    const [viewedJobs, setViewedJobs] = useState([])
    const [savedJobs, setSavedJobs] = useState([])
    const [applications, setApplications] = useState([])
    const [userId, setUserId] = useState(null) // Store logged-in user ID
    const [userData, setUserData] = useState(null) // Store user profile data

    // Load data from backend on mount or when userId changes
    useEffect(() => {
        // Get userId from localStorage (set after login)
        const storedUserId = localStorage.getItem('userId');
        const storedUserData = sessionStorage.getItem('userData');
        
        if (storedUserId) {
            console.log('Found stored userId:', storedUserId);
            setUserId(storedUserId);
        }
        
        if (storedUserData) {
            try {
                setUserData(JSON.parse(storedUserData));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Reload data when userId changes (e.g., after login)
    useEffect(() => {
        console.log('userId changed:', userId);
        if (userId) {
            console.log('Reloading user data for userId:', userId);
            loadUserData(userId);
        }
    }, [userId]);

    // Load all user data from backend
    const loadUserData = async (uid) => {
        try {
            console.log('Loading user data for userId:', uid);
            
            // Fetch all user data in parallel
            const [viewedJobsData, savedJobsData, applicationsData] = await Promise.all([
                jobService.getViewedJobs(uid),
                jobService.getSavedJobs(uid),
                jobService.getApplications(uid)
            ]);

            console.log('Fetched data:', { 
                viewedJobs: viewedJobsData?.length, 
                savedJobs: savedJobsData?.length, 
                applications: applicationsData?.length 
            });

            // Transform backend data to match frontend structure
            const transformedViewedJobs = (viewedJobsData || []).map(item => ({
                ...item.job,
                _id: item.job.id,
                viewedAt: item.viewedAt,
                category: item.job.category?.name || 'Other'
            }));

            const transformedSavedJobs = (savedJobsData || []).map(item => ({
                ...item.job,
                _id: item.job.id,
                savedAt: item.savedAt,
                category: item.job.category?.name || 'Other'
            }));

            // Transform applications data
            const transformedApplications = (applicationsData || []).map(item => ({
                _id: item.id || item._id,
                id: item.id || item._id,
                jobId: item.job?.id,
                jobTitle: item.job?.title,
                company: item.job?.user?.name || 'Company',
                location: item.job?.location,
                status: item.status || 'pending',
                appliedAt: item.appliedAt || item.created_at,
                coverLetter: item.coverLetter,
                resumePath: item.resumePath
            }));

            console.log('Transformed data:', {
                viewedJobs: transformedViewedJobs.length,
                savedJobs: transformedSavedJobs.length,
                applications: transformedApplications.length
            });

            setViewedJobs(transformedViewedJobs);
            setSavedJobs(transformedSavedJobs);
            setApplications(transformedApplications);
        } catch (error) {
            console.error('Error loading user data:', error);
            console.error('Error details:', error.response?.data || error.message);
        }
    };

    // Save to localStorage whenever lists change
    useEffect(() => {
        localStorage.setItem('viewedJobs', JSON.stringify(viewedJobs));
    }, [viewedJobs]);

    useEffect(() => {
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    }, [savedJobs]);

    const addViewedJob = async (job) => {
        if (!userId) {
            console.log('No userId, cannot add viewed job');
            return;
        }
        try {
            const jobId = job.id || job._id;
            console.log('Adding viewed job for userId:', userId, 'jobId:', jobId);
            const result = await jobService.addViewedJob(userId, jobId);
            console.log('Add viewed job result:', result);
            if (result) {
                // Reload viewed jobs from backend to ensure consistency
                const updatedViewedJobs = await jobService.getViewedJobs(userId);
                console.log('Updated viewed jobs from backend:', updatedViewedJobs);
                const transformedViewedJobs = (updatedViewedJobs || []).map(item => ({
                    ...item.job,
                    _id: item.job.id,
                    viewedAt: item.viewedAt,
                    category: item.job.category?.name || 'Other'
                }));
                setViewedJobs(transformedViewedJobs);
            }
        } catch (error) {
            console.error('Error adding viewed job:', error);
            console.error('Error details:', error.response?.data || error.message);
        }
    };

    const addSavedJob = async (job) => {
        if (!userId) {
            console.log('No userId, cannot add saved job');
            return;
        }
        try {
            const jobId = job.id || job._id;
            console.log('Adding/removing saved job for userId:', userId, 'jobId:', jobId);
            const exists = savedJobs.some(j => (j._id === jobId || j.id === jobId));
            if (exists) {
                console.log('Job already saved, removing...');
                await removeSavedJob(jobId);
            } else {
                console.log('Job not saved, saving...');
                const result = await jobService.addSavedJob(userId, jobId);
                console.log('Add saved job result:', result);
                if (result) {
                    // Reload saved jobs from backend to ensure consistency
                    const updatedSavedJobs = await jobService.getSavedJobs(userId);
                    console.log('Updated saved jobs from backend:', updatedSavedJobs);
                    const transformedSavedJobs = (updatedSavedJobs || []).map(item => ({
                        ...item.job,
                        _id: item.job.id,
                        savedAt: item.savedAt,
                        category: item.job.category?.name || 'Other'
                    }));
                    setSavedJobs(transformedSavedJobs);
                }
            }
        } catch (error) {
            console.error('Error saving job:', error);
            console.error('Error details:', error.response?.data || error.message);
        }
    };

    const removeSavedJob = async (jobId) => {
        if (!userId) return;
        try {
            await jobService.removeSavedJob(userId, jobId);
            setSavedJobs(prev => prev.filter(j => j._id !== jobId && j.id !== jobId));
        } catch (error) {
            console.error('Error removing saved job:', error);
        }
    };

    const isSaved = (jobId) => {
        return savedJobs.some(j => j._id === jobId || j.id === jobId);
    };

    const submitApplication = async (jobId, applicationData) => {
        if (!userId) return;
        try {
            const result = await jobService.submitApplication(userId, jobId, applicationData);
            if (result) {
                setApplications(prev => [...prev, result]);
            }
        } catch (error) {
            console.error('Error submitting application:', error);
        }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        if (!userId) return;
        try {
            const result = await jobService.updateApplicationStatus(userId, applicationId, status);
            if (result) {
                setApplications(prev => prev.map(app => 
                    app._id === applicationId ? { ...app, status } : app
                ));
            }
        } catch (error) {
            console.error('Error updating application:', error);
        }
    };

    const updateUserData = (newUserData) => {
        setUserData(newUserData);
        sessionStorage.setItem('userData', JSON.stringify(newUserData));
    };

    const clearViewedJobs = async () => {
        if (!userId) return;
        try {
            await jobService.clearViewedJobs(userId);
            setViewedJobs([]);
        } catch (error) {
            console.error('Error clearing viewed jobs:', error);
        }
    };

    const value = {
        setSearchFilter, searchFilter,
        isSearched, setIsSearched,
        viewedJobs, addViewedJob, clearViewedJobs,
        savedJobs, addSavedJob, removeSavedJob, isSaved,
        applications, submitApplication, updateApplicationStatus,
        userId, setUserId, loadUserData,
        userData, updateUserData
    }
    return (<AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>)

}
