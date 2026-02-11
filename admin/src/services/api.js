import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // needed for cookies/sessions and CORS
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const requestUrl = error.config?.url || '';
        const isLoginOrRegister = requestUrl === '/auth/login' || requestUrl === '/auth/register';
        if (!isLoginOrRegister && error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
        }

        if (!error.response) {
            console.error('Network error:', error.message);
            error.message = 'Cannot connect to server. Please check your connection.';
        }

        return Promise.reject(error);
    }
);

export default api;
