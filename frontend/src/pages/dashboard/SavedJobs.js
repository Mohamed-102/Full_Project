import { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = date.toDateString();
  const todayString = today.toDateString();
  const yesterdayString = yesterday.toDateString();

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (dateOnly === todayString) {
    return `Today at ${time}`;
  } else if (dateOnly === yesterdayString) {
    return `Yesterday at ${time}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${time}`;
  }
};

// Content component used in both Dashboard and standalone page
function SavedJobsContent() {
  const { savedJobs, removeSavedJob } = useContext(AppContext);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const toggleSelectJob = (jobId) => {
    setSelectedJobs(prev =>
      prev.includes(jobId)
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === savedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(savedJobs.map(job => job._id));
    }
  };

  const deleteSelectedJobs = () => {
    if (selectedJobs.length === 0) return;
    if (window.confirm(`Delete ${selectedJobs.length} job(s)?`)) {
      selectedJobs.forEach(jobId => removeSavedJob(jobId));
      setSelectedJobs([]);
    }
  };

  return (
    <div>
      {savedJobs.length === 0 ? (
        <p className="text-gray-600">You haven't saved any jobs yet.</p>
      ) : (
        <div>
          {selectedJobs.length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedJobs.length} job(s) selected
              </p>
              <button
                onClick={deleteSelectedJobs}
                className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-all"
              >
                Delete Selected
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === savedJobs.length && savedJobs.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Job Title</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Company</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Location</th>
                  <th className="py-3 px-4 font-semibold text-gray-900">Saved Date</th>
                </tr>
              </thead>
              <tbody>
                {savedJobs.map((job) => (
                  <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job._id)}
                        onChange={() => toggleSelectJob(job._id)}
                        className="w-4 h-4 accent-purple-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{job.title}</td>
                    <td className="py-4 px-4 text-gray-600">{job.companyId?.name || job.company || 'Not specified'}</td>
                    <td className="py-4 px-4 text-gray-600">{job.location || 'Not specified'}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{formatDateTime(job.savedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SavedJobs() {
  return <SavedJobsContent />;
}
