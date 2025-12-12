import api from "./api";

// ===== JOBS =====
export const getAllJobs = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return api.get(`/jobs?${params}`);
};

export const getJobById = (id) => api.get(`/jobs/${id}`);

export const getJobCategories = () => api.get('/jobs/categories');

export const getJobLocations = () => api.get('/jobs/locations');

export const getJobLevels = () => api.get('/jobs/levels');

// ===== VIEWED JOBS =====
export const getViewedJobs = (userId) => {
  console.log('getViewedJobs called with userId:', userId);
  return api.get(`/users/${userId}/viewed-jobs`)
    .then(response => {
      console.log('Viewed jobs response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching viewed jobs:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return [];
    });
};

export const addViewedJob = (userId, jobId) => 
  api.post(`/users/${userId}/viewed-jobs`, { 
    jobId, 
    viewedAt: new Date().toISOString() 
  })
  .then(response => {
    console.log('Add viewed job response:', response.data);
    return response.data;
  })
  .catch(error => {
    console.error('Error adding viewed job:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  });

export const clearViewedJobs = (userId) => 
  api.delete(`/users/${userId}/viewed-jobs`)
  .then(response => {
    console.log('Clear viewed jobs response:', response.data);
    return response.data;
  })
  .catch(error => {
    console.error('Error clearing viewed jobs:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  });

// ===== SAVED JOBS =====
export const getSavedJobs = (userId) => {
  console.log('getSavedJobs called with userId:', userId);
  return api.get(`/users/${userId}/saved-jobs`)
    .then(response => {
      console.log('Saved jobs response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching saved jobs:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return [];
    });
};

export const addSavedJob = (userId, jobId) => 
  api.post(`/users/${userId}/saved-jobs`, { 
    jobId, 
    savedAt: new Date().toISOString() 
  })
  .then(response => {
    console.log('Add saved job response:', response.data);
    return response.data;
  })
  .catch(error => {
    console.error('Error adding saved job:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  });

export const removeSavedJob = (userId, jobId) => 
  api.delete(`/users/${userId}/saved-jobs/${jobId}`)
    .then(response => {
      console.log('Remove saved job response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error removing saved job:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    });

// ===== USER PROFILE =====
export const getUserProfile = (userId) => 
  api.get(`/users/${userId}/profile`)
    .then(response => response)
    .catch(error => {
      console.error('Error fetching user profile:', error);
      throw error;
    });

export const updateUserProfile = (userId, profileData) => 
  api.put(`/users/${userId}/profile`, profileData)
    .then(response => response)
    .catch(error => {
      console.error('Error updating user profile:', error);
      throw error;
    });

// ===== RECRUITER PROFILE =====
export const getRecruiterProfile = (recruiterId) => api.get(`/recruiters/${recruiterId}/profile`);

export const updateRecruiterProfile = (recruiterId, profileData) => 
  api.put(`/recruiters/${recruiterId}/profile`, profileData);

// ===== RECRUITER JOBS (CRUD) =====
export const getRecruiterJobs = (recruiterId) => api.get(`/recruiters/${recruiterId}/jobs`);

export const createJob = (recruiterId, jobData) => 
  api.post(`/jobs`, jobData);

export const updateJob = (recruiterId, jobId, jobData) => 
  api.put(`/jobs/${jobId}`, jobData);

export const deleteJob = (recruiterId, jobId) => 
  api.delete(`/jobs/${jobId}`);

export const getRecruiterJobById = (recruiterId, jobId) => 
  api.get(`/recruiters/${recruiterId}/jobs/${jobId}`);

// ===== APPLICATIONS =====
export const getApplications = (userId) => {
  console.log('getApplications called with userId:', userId);
  return api.get(`/users/${userId}/applications`)
    .then(response => {
      console.log('Applications response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching applications:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return [];
    });
};

export const submitApplication = (userId, jobId, applicationData) => {
  console.log('Submitting application for jobId:', jobId);
  // applicationData is FormData, so send it directly
  return api.post(`/jobs/${jobId}/apply`, applicationData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => {
    console.log('Application submitted successfully:', response.data);
    return response.data;
  }).catch(error => {
    console.error('Error submitting application:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    throw error;
  });
};

export const updateApplicationStatus = (userId, applicationId, status) => 
  api.patch(`/users/${userId}/applications/${applicationId}`, { status });

// ===== NOTIFICATIONS =====
export const getNotifications = (userId) => 
  api.get(`/users/${userId}/notifications`);

export const markNotificationAsRead = (userId, notificationId) => 
  api.patch(`/users/${userId}/notifications/${notificationId}/read`);

export const deleteNotification = (userId, notificationId) => 
  api.delete(`/users/${userId}/notifications/${notificationId}`);

// ===== JOB APPLICANTS (RECRUITER) =====
export const getJobApplicants = (jobId) => 
  api.get(`/jobs/${jobId}/applicants`);

export const downloadApplicantCV = async (applicantId) => {
  try {
    const response = await api.get(`/applicants/${applicantId}/cv`, { 
      responseType: 'blob',
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
    console.log('CV download response:', response);
    return response;
  } catch (error) {
    console.error('CV download error:', error);
    console.error('Error response:', error.response);
    // If error response is JSON (error message), parse it
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const jsonError = JSON.parse(text);
        error.message = jsonError.message || 'Failed to download CV';
      } catch (e) {
        error.message = text || 'Failed to download CV';
      }
    }
    throw error;
  }
};

export const downloadAllCVs = (jobId) => 
  api.get(`/jobs/${jobId}/applicants/download-all`, { 
    responseType: 'blob' 
  });

export const acceptApplicant = (applicantId) => 
  api.post(`/applicants/${applicantId}/accept`);

export const rejectApplicant = (applicantId, rejectionData) => 
  api.post(`/applicants/${applicantId}/reject`, rejectionData);

// ===== RECRUITER DASHBOARD STATS =====
export const getRecruiterStats = (recruiterId) => 
  api.get(`/recruiter-stats/${recruiterId}`);

// ===== USER DASHBOARD STATS =====
export const getDashboardStats = (userId) => {
  console.log('getDashboardStats called with userId:', userId);
  return api.get(`/users/${userId}/stats`)
    .then(response => {
      console.log('Dashboard stats response:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching dashboard stats:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return null;
    });
};
