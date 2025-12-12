import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

// Content component used in both Dashboard and standalone page
function ApplicationTrackerContent() {
  const { applications } = useContext(AppContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('in-progress');
  const [activeDoneSubTab, setActiveDoneSubTab] = useState('accepted');

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Tracker</h2>

      {/* Filter applications by tab based on backend status */}
      {(() => {
        const filterByTab = (status) => {
          switch(status) {
            case 'in-progress':
              return applications.filter(app => app.status === 'pending' || app.status === 'applied');
            case 'done':
              // Show both accepted and rejected applications in Done tab
              return applications.filter(app => app.status === 'accepted' || app.status === 'rejected');
            case 'interview':
              // Accepted applications also appear in interview
              return applications.filter(app => app.status === 'accepted' || app.status === 'interview');
            case 'job-state':
              return applications.filter(app => app.status === 'job-accepted' || app.status === 'job-rejected');
            default:
              return [];
          }
        };

        const getTabs = [
          { id: 'in-progress', label: 'In Progress', count: filterByTab('in-progress').length, description: 'Applications you\'ve sent and are waiting for company response' },
          { id: 'done', label: 'Done', count: filterByTab('done').length, description: 'Applications that have been accepted or rejected by the company' },
          { id: 'interview', label: 'Interview', count: filterByTab('interview').length, description: 'Accepted applications and ongoing interviews scheduled with companies' },
          { id: 'job-state', label: 'Job State', count: filterByTab('job-state').length, description: 'Final job outcomes - whether you got the job or not' },
        ];

        const activeApplications = filterByTab(activeTab);

        return (
          <>
            {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-0">
          {getTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-b-yellow-400 text-gray-900'
                  : 'border-b-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Description */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          {getTabs.find(tab => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Applications Grid */}
      {activeApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 font-medium">No applications in this category</p>
          <p className="text-sm text-gray-400 mt-1">Applications will appear here as you submit them</p>
        </div>
      ) : activeTab === 'done' ? (
        // Done tab shows both accepted and rejected applications with sub-tabs
        <div>
          {/* Sub-tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-0">
              {[
                { id: 'accepted', label: 'Accepted', count: activeApplications.filter(app => app.status === 'accepted').length },
                { id: 'rejected', label: 'Rejected', count: activeApplications.filter(app => app.status === 'rejected').length },
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveDoneSubTab(subTab.id)}
                  className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
                    activeDoneSubTab === subTab.id
                      ? 'border-b-yellow-400 text-gray-900'
                      : 'border-b-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {subTab.label} <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{subTab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Applications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeDoneSubTab === 'accepted' ? (
              activeApplications.filter(app => app.status === 'accepted').length === 0 ? (
                <p className="text-gray-500 col-span-full">No accepted applications yet</p>
              ) : (
                activeApplications.filter(app => app.status === 'accepted').map((app) => (
                  <div 
                    key={app._id} 
                    className="border-l-4 border-l-green-500 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{app.jobTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">{app.company}</p>
                      </div>
                      <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Accepted</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-100">
                      <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                      <button 
                        onClick={() => navigate(`/job/${app.jobId}`)}
                        className="text-green-800 hover:text-green-950 font-semibold text-sm transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              activeApplications.filter(app => app.status === 'rejected').length === 0 ? (
                <p className="text-gray-500 col-span-full">No rejected applications</p>
              ) : (
                <>
                  <div className="col-span-full mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-900 font-medium">
                      📧 Check your email for the rejection reason and feedback.
                    </p>
                  </div>
                  {activeApplications.filter(app => app.status === 'rejected').map((app) => (
                    <div 
                      key={app._id} 
                      className="border-l-4 border-l-red-500 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-red-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{app.jobTitle}</h3>
                          <p className="text-sm text-gray-600 mt-1">{app.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-100">
                        <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                        <button 
                          onClick={() => navigate(`/job/${app.jobId}`)}
                          className="text-red-800 hover:text-red-950 font-semibold text-sm transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )
            )}
          </div>
        </div>
      ) : activeTab === 'interview' ? (
        // Interview tab shows accepted applications
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">
              📧 Check your email for more information about the interview schedule and details.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeApplications.map((app) => (
            <div 
              key={app._id} 
              className="border-l-4 border-l-green-500 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{app.company}</p>
                </div>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Accepted</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-green-100">
                <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                <button 
                  onClick={() => navigate(`/job/${app.jobId}`)}
                  className="text-green-800 hover:text-green-950 font-semibold text-sm transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      ) : (
        // Other tabs - normal grid view (in-progress and job-state)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeApplications.map((app) => (
            <div 
              key={app._id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-600 mt-1">{app.company}</p>
                </div>
                {activeTab === 'job-state' && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    app.status === 'job-accepted' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {app.status === 'job-accepted' ? 'Got Job' : 'Not Selected'}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                <button 
                  onClick={() => navigate(`/job/${app.jobId}`)}
                  className="text-purple-800 hover:text-purple-950 font-semibold text-sm transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
          </>
        );
      })()}
    </div>
  );
}

export default function ApplicationTracker() {
  return <ApplicationTrackerContent />;
}
