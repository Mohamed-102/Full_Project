export const USER_ROLES = {
  USER: 'user',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

export const hasRole = (userData, role) => {
  return userData?.role === role;
};

export const isAdmin = (userData) => {
  return hasRole(userData, USER_ROLES.ADMIN);
};

export const isRecruiter = (userData) => {
  return hasRole(userData, USER_ROLES.RECRUITER);
};

export const isUser = (userData) => {
  return hasRole(userData, USER_ROLES.USER);
};