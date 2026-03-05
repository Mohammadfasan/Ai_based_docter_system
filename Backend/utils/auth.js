// utils/auth.js
export const isAuthenticated = () => {
  const token = sessionStorage.getItem('token');
  const user = sessionStorage.getItem('currentUser');
  return !!(token && user);
};

export const getToken = () => {
  return sessionStorage.getItem('token');
};

export const getUser = () => {
  const userStr = sessionStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const getUserType = () => {
  return sessionStorage.getItem('userType');
};

export const logout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('userType');
  window.location.href = '/login';
};

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};