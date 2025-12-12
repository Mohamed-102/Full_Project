import { useState, useEffect } from 'react';
import { getJobCategories, getJobLocations, getJobLevels } from '../../../services/jobService';

export default function PostJob({ 
  postJobData, 
  handlePostJobChange, 
  handlePostJobSubmit, 
  handleUpdateJob,
  handleCancelEdit,
  editingJob, 
  loading 
}) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, locationsRes, levelsRes] = await Promise.all([
          getJobCategories(),
          getJobLocations(),
          getJobLevels()
        ]);
        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        // If backend returns levels, use them; otherwise fallback to default
        setLevels(levelsRes.data && levelsRes.data.length > 0 
          ? levelsRes.data 
          : ['Beginner Level', 'Intermediate Level', 'Senior Level']);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCategories([]);
        setLocations([]);
        // Fallback to default levels if fetch fails
        setLevels(['Beginner Level', 'Intermediate Level', 'Senior Level']);
      }
    };
    fetchData();
  }, []);

  return (
    <div id="section-post-job" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {editingJob ? 'Edit Job' : 'Post Job'}
      </h2>
      <p className="text-gray-600 mb-6">
        {editingJob ? 'Update your job posting' : 'Create a new job posting'}
      </p>
      
      <form onSubmit={editingJob ? handleUpdateJob : handlePostJobSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={postJobData.title}
              onChange={handlePostJobChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
              placeholder="e.g. Senior React Developer"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select 
              name="category_id"
              value={postJobData.category_id}
              onChange={handlePostJobChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100" 
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <select
              name="location"
              value={postJobData.location}
              onChange={handlePostJobChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
              required
            >
              <option value="">Select Location</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
            <select
              name="level"
              value={postJobData.level}
              onChange={handlePostJobChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
              required
            >
              <option value="">Select Level</option>
              {levels.map((level, index) => (
                <option key={index} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
          <textarea
            name="description"
            value={postJobData.description}
            onChange={handlePostJobChange}
            disabled={loading}
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none disabled:bg-gray-100"
            placeholder="Describe the job responsibilities, requirements, and qualifications..."
            required
          ></textarea>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{editingJob ? 'Updating...' : 'Posting...'}</span>
              </>
            ) : (
              editingJob ? 'Update Job' : 'Post Job'
            )}
          </button>
          {editingJob && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
