import axios from 'axios';

const axiosPrivate = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  
});

// Add a request interceptor to include the JWT token in every request
axiosPrivate.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('accessToken');
    if (access) {
      config.headers['Authorization'] = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry and refresh
axiosPrivate.interceptors.response.use(
  (response) => response, // Return the response directly if no errors
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to unauthorized (401) and the request hasn't been retried yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post('http://127.0.0.1:8000/auth/jwt/refresh/', {
          refresh: refreshToken,
        });
        const { access } = refreshResponse.data;

        // Store the new access token and retry the original request
        localStorage.setItem('accessToken', access);
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        return axiosPrivate(originalRequest); // Retry the request with the new token
      } catch (err) {
        // Handle error if refreshing the token fails
        console.error('Error refreshing token:', err.response || err.message);
        
        return Promise.reject(err);
      }
    }
    
    // If not a 401 error or if we couldn't refresh the token, reject the error
    return Promise.reject(error);
  }
);

export default axiosPrivate;
