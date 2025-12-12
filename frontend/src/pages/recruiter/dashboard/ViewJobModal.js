export default function ViewJobModal({ viewingJob, closeViewJobModal }) {
  if (!viewingJob) return null;

  // Format date properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">Job Details</h3>
          <button
            onClick={closeViewJobModal}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Job Title</h4>
            <p className="text-lg font-semibold text-gray-900">{viewingJob.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Category</h4>
              <p className="text-gray-900">{viewingJob.category?.name || viewingJob.category || 'N/A'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Location</h4>
              <p className="text-gray-900">{viewingJob.location}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{viewingJob.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Posted Date</h4>
              <p className="text-gray-900">{formatDate(viewingJob.created_at || viewingJob.postedDate)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(viewingJob.status)}`}>
                {viewingJob.status ? viewingJob.status.charAt(0).toUpperCase() + viewingJob.status.slice(1) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={closeViewJobModal}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
