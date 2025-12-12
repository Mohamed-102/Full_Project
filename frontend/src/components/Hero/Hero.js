import { useContext, useRef, useState, useEffect } from "react";
import { assets } from "../../assets/assets.js"
import { AppContext } from "../../context/AppContext.js";
import { getAllJobs } from "../../services/jobService";

export default function Hero(){

    const {setSearchFilter, setIsSearched, searchFilter} = useContext(AppContext);
    
    const titleRef = useRef(null);
    const locationRef = useRef(null);
    
    const [titleSuggestions, setTitleSuggestions] = useState([]);
    const [locationSuggestions, setLocationSuggestions] = useState([]);
    const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
    const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [titleSelected, setTitleSelected] = useState(false);
    const [locationSelected, setLocationSelected] = useState(false);
    const [jobTitles, setJobTitles] = useState([]);
    const [jobLocations, setJobLocations] = useState([]);

    // Fetch job titles and locations from backend
    useEffect(() => {
        const fetchJobData = async () => {
            try {
                const response = await getAllJobs();
                const jobs = response.data;
                setJobTitles([...new Set(jobs.map(job => job.title))]);
                setJobLocations([...new Set(jobs.map(job => job.location))]);
            } catch (error) {
                console.error('Error fetching jobs for autocomplete:', error);
            }
        };
        fetchJobData();
    }, []);

    // Sync input fields with searchFilter from context (for when X button is clicked)
    useEffect(() => {
        if (searchFilter.title === "") {
            setTitleInput('');
            if (titleRef.current) titleRef.current.value = '';
        }
        if (searchFilter.location === "") {
            setLocationInput('');
            if (locationRef.current) locationRef.current.value = '';
        }
    }, [searchFilter]);

    useEffect(() => {
        if (titleInput.length > 0 && !titleSelected) {
            const filtered = jobTitles.filter(title => 
                title.toLowerCase().includes(titleInput.toLowerCase())
            );
            setTitleSuggestions(filtered);
            setShowTitleSuggestions(filtered.length > 0);
        } else {
            setShowTitleSuggestions(false);
            if (titleInput.length === 0) {
                setTitleSuggestions([]);
            }
        }
    }, [titleInput, titleSelected, jobTitles]);

    useEffect(() => {
        if (locationInput.length > 0 && !locationSelected) {
            const filtered = jobLocations.filter(location => 
                location.toLowerCase().includes(locationInput.toLowerCase())
            );
            setLocationSuggestions(filtered);
            setShowLocationSuggestions(filtered.length > 0);
        } else {
            setShowLocationSuggestions(false);
            if (locationInput.length === 0) {
                setLocationSuggestions([]);
            }
        }
    }, [locationInput, locationSelected, jobLocations]);

    const handleTitleSelect = (title) => {
        setTitleInput(title);
        if (titleRef.current) titleRef.current.value = title;
        setShowTitleSuggestions(false);
        setTitleSuggestions([]);
        setTitleSelected(true);
    };

    const handleLocationSelect = (location) => {
        setLocationInput(location);
        if (locationRef.current) locationRef.current.value = location;
        setShowLocationSuggestions(false);
        setLocationSuggestions([]);
        setLocationSelected(true);
    };

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            location: locationRef.current.value
        });
        setIsSearched(true);
        setShowTitleSuggestions(false);
        setShowLocationSuggestions(false);
    }
    
    return (
        <div className="container 2xl:px-20 mx-auto my-10">
            <div className="bg-gradient-to-r from-purple-800 to-purple-950 text-white py-16 text-center mx-2 rounded-xl">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-4">Over 10,000+ jobs to apply</h2>
                <p className="mb-8 max-w-xl mx-auto text-sm font-light px-5">Your Next Big Career Move Starts Right Here - Explore the Best Job Opportunities and Take the First Step Toward Your Future!</p>
                <div className="relative flex items-center justify-between bg-white rounded text-gray-600 max-w-xl pl-4 mx-4 sm:mx-auto">
                    <div className="relative flex-1 flex items-center">
                        <img className="h-4 sm:h-5" src={assets.search_icon} alt="" />
                        <input 
                            type="text" 
                            placeholder="Search for jobs"
                            className="max-snm:text-xs p-2 rounded outline-none w-full" 
                            ref={titleRef}
                            value={titleInput}
                            onChange={(e) => {
                                setTitleInput(e.target.value);
                                setTitleSelected(false);
                            }}
                            onFocus={() => titleInput && setShowTitleSuggestions(titleSuggestions.length > 0)}
                        />
                        {showTitleSuggestions && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-50 max-h-48 overflow-y-auto">
                                {titleSuggestions.map((title, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTitleSelect(title)}
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-left text-gray-800 border-b last:border-b-0"
                                    >
                                        {title}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="relative flex-1 flex items-center">
                        <img className="h-4 sm:h-5" src={assets.location_icon} alt="" />
                        <input 
                            type="text" 
                            placeholder="Location"
                            className="max-snm:text-xs p-2 rounded outline-none w-full" 
                            ref={locationRef}
                            value={locationInput}
                            onChange={(e) => {
                                setLocationInput(e.target.value);
                                setLocationSelected(false);
                            }}
                            onFocus={() => locationInput && setShowLocationSuggestions(locationSuggestions.length > 0)}
                        />
                        {showLocationSuggestions && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b shadow-lg z-50 max-h-48 overflow-y-auto">
                                {locationSuggestions.map((location, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleLocationSelect(location)}
                                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-left text-gray-800 border-b last:border-b-0"
                                    >
                                        {location}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={onSearch} className="bg-blue-600 px-6 py-2 rounded text-white m-1">Search</button>
                </div>
            </div>
            
            <div className="border border-gray-300 shadow-md mx-2 mt-5 p-6 rounded-md overflow-hidden">
                <div className="flex items-center gap-6">
                    <p className="font-medium whitespace-nowrap">Trusted by</p>
                    <div className="overflow-hidden w-full">
                        <div className="flex gap-10 lg:gap-16 animate-marquee whitespace-nowrap">
                            <img className="h-8" src={assets.microsoft_logo} alt=""  />
                            <img className="h-8" src={assets.walmart_logo}   alt="" />
                            <img className="h-8" src={assets.accenture_logo} alt=""  />
                            <img className="h-8" src={assets.samsung_logo}   alt=""  />
                            <img className="h-8" src={assets.amazon_logo}    alt="" />
                            <img className="h-8" src={assets.adobe_logo}     alt=""  />

                            <img className="h-8" src={assets.microsoft_logo} alt=""   />
                            <img className="h-8" src={assets.walmart_logo}   alt=""    />
                            <img className="h-8" src={assets.accenture_logo} alt=""   />
                            <img className="h-8" src={assets.samsung_logo}   alt=""    />
                            <img className="h-8" src={assets.amazon_logo}    alt=""    />
                            <img className="h-8" src={assets.adobe_logo}     alt=""   />
                            
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}