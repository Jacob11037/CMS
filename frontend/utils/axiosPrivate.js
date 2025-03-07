import axios from "axios";

const axiosPrivate = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", // Django API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
  });
  

export default axiosPrivate;
