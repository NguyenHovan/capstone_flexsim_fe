import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://logisimeduprojectbe-byejdhh9gqcsd5a0.southeastasia-01.azurewebsites.net',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
