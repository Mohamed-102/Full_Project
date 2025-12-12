import { useState, useEffect } from 'react';
import { assets } from '../../../assets/assets';
import * as jobService from '../../../services/jobService';

export default function Applicants({ jobs }) {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState([]);

  const selectedJob = jobs.find(job => job.id === selectedJobId);

  // Predefined rejection reasons
  const rejectionReasons = [
    "Your qualifications don't match our current requirements",
    "We've decided to move forward with other candidates",
    "The position has been filled",
    "Insufficient experience for this role",
    "Your skills don't align with our needs at this time",
    "Custom message"
  ];

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId);
    } else {
      setApplicants([]);
      setSelectedApplicants([]);
    }
  }, [selectedJobId]);

  const loadApplicants = async (jobId) => {
    setLoading(true);
    try {
      const response = await jobService.getJobApplicants(jobId);
      setApplicants(response.data || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCV = async (applicant) => {
    try {
      console.log('Starting CV download for applicant ID:', applicant.id);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('You must be logged in to download CVs.');
        return;
      }
      
      // Use window.open for direct download - simpler and avoids CORS issues
      // Include token in Authorization header via a data URL with fetch
      const link = document.createElement('a');
      link.href = '#';
      link.onclick = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/api/applicants/${applicant.id}/cv`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/octet-stream'
              }
            }
          );
          
          if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Failed to download CV');
            return;
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${applicant.name}_CV.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Download error:', error);
          alert('Failed to download CV. Please try again.');
        }
      };
      link.onclick();
      
      console.log('CV download initiated');
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Failed to download CV. Please try again.');
    }
  };

  const handleDownloadAllCVs = async () => {
    try {
      const response = await jobService.downloadAllCVs(selectedJobId);
      // Create blob link to download ZIP file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedJob.title}_All_CVs.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading all CVs:', error);
      if (error.response?.status === 404) {
        alert('No CVs found for this job.');
      } else if (error.response?.status === 403) {
        alert('You do not have permission to download these CVs.');
      } else {
        alert('Failed to download CVs. Please try again.');
      }
    }
  };

  const handleAccept = async (applicant) => {
    try {
      // Call backend API to accept applicant
      await jobService.acceptApplicant(applicant.id);
      
      // Update local state
      setApplicants(applicants.map(app => 
        app.id === applicant.id ? { ...app, status: 'accepted' } : app
      ));
      
      alert(`${applicant.name} has been accepted!`);
    } catch (error) {
      console.error('Error accepting applicant:', error);
      alert('Failed to accept applicant. Please try again.');
    }
  };

  const handleRejectClick = (applicant) => {
    setSelectedApplicant(applicant);
    setRejectReason('');
    setCustomReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason) {
      alert('Please select a reason for rejection');
      return;
    }

    if (rejectReason === 'Custom message' && !customReason.trim()) {
      alert('Please enter a custom rejection message');
      return;
    }

    const finalReason = rejectReason === 'Custom message' ? customReason : rejectReason;

    try {
      if (selectedApplicant.id === 'bulk') {
        // Bulk reject
        for (const applicantId of selectedApplicants) {
          const applicant = applicants.find(app => app.id === applicantId);
          if (applicant) {
            await jobService.rejectApplicant(applicantId, {
              reason: finalReason,
              applicantEmail: applicant.email,
              applicantName: applicant.name,
              jobTitle: selectedJob.title
            });
          }
        }
        
        // Update local state
        setApplicants(applicants.map(app => 
          selectedApplicants.includes(app.id) ? { ...app, status: 'rejected' } : app
        ));
        
        setSelectedApplicants([]);
        alert(`Rejection emails sent to ${selectedApplicants.length} applicant(s)`);
      } else {
        // Single reject
        await jobService.rejectApplicant(selectedApplicant.id, {
          reason: finalReason,
          applicantEmail: selectedApplicant.email,
          applicantName: selectedApplicant.name,
          jobTitle: selectedJob.title
        });
        
        // Update local state
        setApplicants(applicants.map(app => 
          app.id === selectedApplicant.id ? { ...app, status: 'rejected' } : app
        ));
        
        alert(`Rejection email sent to ${selectedApplicant.name}`);
      }
      
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      alert('Failed to reject applicant. Please try again.');
    }
  };

  const handleSelectApplicant = (applicantId) => {
    setSelectedApplicants(prev => {
      if (prev.includes(applicantId)) {
        return prev.filter(id => id !== applicantId);
      } else {
        return [...prev, applicantId];
      }
    });
  };

  const handleSelectAll = () => {
    const pendingApplicants = applicants.filter(app => !app.status || app.status === 'pending');
    if (selectedApplicants.length === pendingApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(pendingApplicants.map(app => app.id));
    }
  };

  const handleBulkAccept = async () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant');
      return;
    }

    try {
      // Call backend API for each selected applicant
      for (const applicantId of selectedApplicants) {
        await jobService.acceptApplicant(applicantId);
      }
      
      // Update local state
      setApplicants(applicants.map(app => 
        selectedApplicants.includes(app.id) ? { ...app, status: 'accepted' } : app
      ));
      
      setSelectedApplicants([]);
      alert(`${selectedApplicants.length} applicant(s) have been accepted!`);
    } catch (error) {
      console.error('Error accepting applicants:', error);
      alert('Failed to accept some applicants. Please try again.');
    }
  };

  const handleBulkRejectClick = () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant');
      return;
    }
    
    setSelectedApplicant({ id: 'bulk', name: `${selectedApplicants.length} applicant(s)` });
    setRejectReason('');
    setCustomReason('');
    setShowRejectModal(true);
  };

  const handleBulkDownloadCVs = async () => {
    if (selectedApplicants.length === 0) {
      alert('Please select at least one applicant');
      return;
    }

    try {
      for (const applicantId of selectedApplicants) {
        const applicant = applicants.find(app => app.id === applicantId);
        if (applicant) {
          await handleDownloadCV(applicant);
        }
      }
    } catch (error) {
      console.error('Error downloading CVs:', error);
    }
  };

  return (
    <div id="section-applicants" className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h2>

      {/* Job Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Job to View Applicants
        </label>
        <select
          value={selectedJobId || ''}
          onChange={(e) => setSelectedJobId(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
        >
          <option value="">-- Select a Job --</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title} - {job.location}
            </option>
          ))}
        </select>
      </div>

      {/* Applicants List */}
      {!selectedJobId ? (
        <div className="text-center py-12">
          <img src={assets.person_tick_icon} alt="Select job" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600 font-medium mb-2">Select a job to view applicants</p>
          <p className="text-gray-500 text-sm">Choose a job from the dropdown above</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-12">
          <img src={assets.person_tick_icon} alt="No applicants" className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-gray-600 font-medium mb-2">No applicants for this job yet</p>
          <p className="text-gray-500 text-sm">Applicants will appear here once they apply</p>
        </div>
      ) : (
        <div>
          {/* Bulk Actions Bar */}
          {selectedApplicants.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedApplicants.length} applicant(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDownloadCVs}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download CVs
                  </button>
                  <button
                    onClick={handleBulkAccept}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Selected
                  </button>
                  <button
                    onClick={handleBulkRejectClick}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Download All CVs Button */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {applicants.length} Applicant{applicants.length !== 1 ? 's' : ''} for "{selectedJob?.title}"
            </h3>
            <button
              onClick={handleDownloadAllCVs}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download All CVs
            </button>
          </div>

          {/* Applicants Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.length > 0 && selectedApplicants.length === applicants.filter(app => !app.status || app.status === 'pending').length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {(!applicant.status || applicant.status === 'pending') && (
                        <input
                          type="checkbox"
                          checked={selectedApplicants.includes(applicant.id)}
                          onChange={() => handleSelectApplicant(applicant.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{applicant.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{applicant.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{applicant.appliedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {applicant.status === 'accepted' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Accepted
                        </span>
                      ) : applicant.status === 'rejected' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => applicant.resumePath && handleDownloadCV(applicant)}
                          disabled={!applicant.resumePath}
                          className={`text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                            applicant.resumePath 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-gray-400 cursor-not-allowed opacity-50'
                          }`}
                          title={applicant.resumePath ? "Download CV" : "No CV uploaded"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        {(!applicant.status || applicant.status === 'pending') && (
                          <>
                            <button
                              onClick={() => handleAccept(applicant)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                              title="Accept Applicant"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleRejectClick(applicant)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                              title="Reject Applicant"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Application - {selectedApplicant?.name}
            </h3>
            <p className="text-gray-600 mb-6">
              Please select a reason for rejection. This will be sent to the applicant via email.
            </p>

            <div className="space-y-3 mb-6">
              {rejectionReasons.map((reason, index) => (
                <label
                  key={index}
                  className="flex items-start p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {rejectReason === 'Custom message' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Rejection Message *
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
                  placeholder="Enter your custom rejection message..."
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Send Rejection Email
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setCustomReason('');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

