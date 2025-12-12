import { useContext, useEffect, useState } from "react"; 
import { assets } from "../assets/assets";
import JobCard from "./JobCard";
import { getAllJobs, getJobCategories, getJobLocations } from "../services/jobService";
import { AppContext } from "../context/AppContext";

export default function JobListing(){

    const { searchFilter, setSearchFilter } = useContext(AppContext);
    const [allJobs, setAllJobs] = useState([]); // Store all jobs from backend
    const [filteredJobs, setFilteredJobs] = useState([]); // Filtered jobs for display
    const [loading, setLoading] = useState(true);

    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);

    //this is for show filter result in device responsive 
    const [showFilter, setShowFilter] = useState(false)

    //this is for pagination
    const [currentPage, setCurrentPage] = useState(1)

    const [selectedCategories, setSelectedCategories] = useState([])
    const [selectedLocations, setSelectedLocations] = useState([])
    const [selectedLevels, setSelectedLevels] = useState([])

    const handelCategoryChange = (category) => {
        setSelectedCategories(
            prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        )
    }

    const handelLocationChange = (location) => {
        setSelectedLocations(
            prev => prev.includes(location) ? prev.filter(c => c !== location) : [...prev, location]
        )
    }

    const handelLevelChange = (level) => {
        setSelectedLevels(
            prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        )
    }

    // Fetch all jobs and filters once from backend on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [jobsRes, categoriesRes, locationsRes] = await Promise.all([
                    getAllJobs({}), // Fetch all jobs without filters
                    getJobCategories(),
                    getJobLocations()
                ]);
                let jobsData = jobsRes.data || [];
                // Sort by created_at descending (latest first)
                jobsData = jobsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setAllJobs(jobsData);
                setFilteredJobs(jobsData);
                setCategories(categoriesRes.data);
                setLocations(locationsRes.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setAllJobs([]);
                setFilteredJobs([]);
                setCategories([]);
                setLocations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter jobs on frontend whenever filters change
    useEffect(() => {
        let filtered = [...allJobs];

        // Filter by categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(job => 
                selectedCategories.includes(job.category?.name || job.category)
            );
        }

        // Filter by locations
        if (selectedLocations.length > 0) {
            filtered = filtered.filter(job => 
                selectedLocations.includes(job.location)
            );
        }

        // Filter by levels
        if (selectedLevels.length > 0) {
            filtered = filtered.filter(job => 
                selectedLevels.includes(job.level)
            );
        }

        // Filter by search title
        if (searchFilter.title) {
            filtered = filtered.filter(job => 
                job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
            );
        }

        // Filter by search location
        if (searchFilter.location) {
            filtered = filtered.filter(job => 
                job.location.toLowerCase().includes(searchFilter.location.toLowerCase())
            );
        }

        setFilteredJobs(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [allJobs, selectedCategories, selectedLocations, selectedLevels, searchFilter]);


    if (loading) return <p className="text-center py-20">Loading jobs...</p>;
    if (allJobs.length === 0) return <p className="text-center py-20 text-red-500">No jobs available</p>;

    return(
        <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8 text-left">
        
        {/* SideBar */}
            <div className="w-full lg:w-1/4 bg-white px-4">
                {/* Search Filter from Hero Component */}
                {
                    (searchFilter.title !== "" || searchFilter.location !== "") && (
                        <>
                            <h3 className="font-medium text-lg mb-4">Current Search</h3>
                            <div className="mb-4 text-gray-600">
                                {searchFilter.title && (
                                    <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
                                        {searchFilter.title}
                                        <img onClick={ e => setSearchFilter(prev => ({...prev,title:""}))} className="cursor-pointer" src={assets.cross_icon} alt=""  />
                                    </span>
                                )}
                                {searchFilter.location && (
                                    <span className=" ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded">
                                        {searchFilter.location}
                                        <img onClick={ e => setSearchFilter(prev => ({...prev,location:""}))} className="cursor-pointer" src={assets.cross_icon} alt=""  />
                                    </span>
                                )}
                            </div>
                        </>
                    )
                }

                {/* this is for show filter result in device responsive */}
                <button onClick={e => setShowFilter(prev => !prev)} className="px-6 py-1.5 rounded border border-gray-400 lg:hidden">
                    {showFilter ? "Close" : "Filters"}
                </button>

                {/* Categories Filter */}
                <div className={showFilter ? "" : "max-lg:hidden"}>
                    <h4 className="font-medium text-lg py-4">Search By Categories</h4>
                    <ul className="space-y-4 text-gray-600">
                        {
                            categories.map((category, index) => (
                                <li className="flex gap-3 items-center" key={index}>
                                    <input className="scale-1.25" 
                                    type="checkbox" 
                                    onChange={() => handelCategoryChange(typeof category === 'string' ? category : category.name)} 
                                    checked = {selectedCategories.includes(typeof category === 'string' ? category : category.name)} />
                                    {typeof category === 'string' ? category : category.name}
                                </li>
                            ))
                        }
                    </ul>
                </div>
                {/* Location Filter */}
                <div className={showFilter ? "" : "max-lg:hidden"}>
                    <h4 className="font-medium text-lg py-4 pt-14">Search By Location</h4>
                    <ul className="space-y-4 text-gray-600">
                        {
                            locations.map((location, index) => (
                                <li className="flex gap-3 items-center" key={index}>
                                    <input className="scale-1.25" 
                                    type="checkbox" 
                                    onChange={() => handelLocationChange(location)} 
                                    checked = {selectedLocations.includes(location)}/>
                                    {location}
                                </li>
                            ))
                        }
                    </ul>
                </div>
                {/* Level Filter */}
                <div className={showFilter ? "" : "max-lg:hidden"}>
                    <h4 className="font-medium text-lg py-4 pt-14">Search By Level</h4>
                    <ul className="space-y-4 text-gray-600">
                        {['Beginner Level', 'Intermediate Level', 'Senior Level'].map((level, index) => (
                            <li className="flex gap-3 items-center" key={index}>
                                <input className="scale-1.25" 
                                type="checkbox" 
                                onChange={() => handelLevelChange(level)} 
                                checked = {selectedLevels.includes(level)}/>
                                {level}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Job Listings */}
            <section className="w-full lg:w-3/4 text-gray-800 max-lg:px-4">
                <h3 className="font-medium text-3xl py-2" id="job-list">Latest Jobs</h3>
                <p className="mb-8">Get your desired job from top companies</p>
                {filteredJobs.length === 0 ? (
                    <p className="text-center py-10 text-gray-500">No jobs match your filters</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredJobs.slice((currentPage-1)*6, currentPage*6).map((job, index) => (
                                <JobCard key={index} job={job} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredJobs.length > 0 && (
                        <div className="flex items-center justify-center space-x-2 mt-10">
                            <a href="#jobs-list" >
                                {/* onClick for arrows to work */}
                                <img onClick={() => setCurrentPage(Math.max(currentPage-1),1)} src={assets.left_arrow_icon} alt="" />
                            </a>

                            {Array.from({length:Math.ceil(filteredJobs.length/6)}).map((_, index) => (
                                <a href="#jobs-list" key={index}>
                                    <button onClick={() => setCurrentPage(index+1)} 
                                    className={`w-10 h-10 flex items-center justify-center border border-gray-300 rounded ${currentPage === index + 1 ? 'bg-blue-100 text-blue-500' : 'text-gray-500'}`} >{index + 1} </button>
                                </a>
                            ))}
                            {/* to here */}
                            
                            <a href="#jobs-list" >
                                {/* onClick for arrows to work */}
                                <img onClick={() => setCurrentPage(Math.min(currentPage+1),Math.ceil(filteredJobs.length / 6))} src={assets.right_arrow_icon} alt="" />
                            </a>
                        </div>
                        )}
                    </>
                )}
            </section>

        </div>
    );
}