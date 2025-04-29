import axios from 'axios';

const axiosPrivate = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://127.0.0.1:8000/api'  // For local development
    : 'https://yourproductionurl.com/api'  // Replace with your actual production URL
});

// Request interceptor: Add Authorization token
axiosPrivate.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('accessToken');
    if (access) {
      config.headers['Authorization'] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle responses and errors
axiosPrivate.interceptors.response.use(
  (response) => {
    if (response && response.status) {
      return response;
    }
    console.error('Invalid Response:', response);
    return Promise.reject(new Error('Response is undefined or malformed'));
  },
  async (error) => {
    console.error('Response Error:', error);

    const originalRequest = error.config;

    // Handle token refresh logic for 401 errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token available');
        return Promise.reject(error);
      }

      try {
        // Refresh the access token by calling the refresh endpoint
        const refreshResponse = await axios.post('/auth/jwt/refresh/', {
          refresh: refreshToken,
        });
        const { access } = refreshResponse.data;

        // Save new access token in localStorage
        localStorage.setItem('accessToken', access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;

        // Retry the original request
        console.log('🔁 Retrying original request after token refresh');
        return axiosPrivate(originalRequest);
      } catch (err) {
        console.error('Error refreshing token:', err.response || err.message);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosPrivate;
