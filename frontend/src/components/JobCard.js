import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

export default function JobCard({job}){

    const navigate = useNavigate()
    const { addViewedJob, addSavedJob, isSaved } = useContext(AppContext)
    const [isJobSaved, setIsJobSaved] = useState(false)
    
    useEffect(() => {
        // Update local state whenever isSaved function result changes
        const jobId = job.id || job._id;
        setIsJobSaved(isSaved(jobId));
    }, [job, isSaved]);
    
    const handleApply = () => {
        // Check if user is logged in
        const userData = sessionStorage.getItem('userData');
        const jobId = job.id || job._id;
        if (!userData) {
            // User not logged in, save redirect URL and redirect to login
            sessionStorage.setItem('redirectAfterLogin', `/apply-job/${jobId}`);
            window.scrollTo(0, 0);
            navigate('/user-login');
        } else {
            addViewedJob(job);
            navigate(`/apply-job/${jobId}`);
            window.scrollTo(0, 0);
        }
    };

    const handleSaveClick = () => {
        addSavedJob(job);
        setIsJobSaved(!isJobSaved);
    };
    
    return(
        <div className="border p-6 shadow rounded">
            <div className="flex justify-between items-center">
                <img className="h-8" src={assets.company_icon} alt="" />
                <button
                    onClick={handleSaveClick}
                    className="hover:opacity-80 transition-opacity"
                    title={isJobSaved ? "Remove from saved" : "Save job"}
                >
                    <img 
                        src={isJobSaved ? assets.bookmark_filled : assets.bookmark_outline} 
                        alt="save" 
                        className="h-6 w-6"
                    />
                </button>
            </div>
            <h4 className="font-medium text-xl mt-2">{job.title}</h4>
            <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">{job.location}</span>
                <span className="bg-red-50 border border-red-200 px-4 py-1.5 rounded">{job.level}</span>
            </div>
            <p className="text-gray-500 text-sm mt-4" dangerouslySetInnerHTML={{__html:job.description.slice(0,150)}}></p>
            <div className="mt-4 flex gap-4 text-sm">
                <button onClick={handleApply} className="bg-blue-600 text-white px-4 py-2 rounded">Apply Now</button>
                <button 
                    onClick={() => {
                        const jobId = job.id || job._id;
                        addViewedJob(job); 
                        navigate(`/job/${jobId}`); 
                        window.scrollTo(0,0);
                    }} 
                    className="text-gray-500 border border-gray-500 rounded px-4 py-2 hover:bg-gray-50"
                >
                    Learn More
                </button>
            </div>
        </div>
    );
}