import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_BASE_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Track refresh token request to avoid multiple simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    isRefreshing = false;
    failedQueue = [];
};

// Response interceptor - handle token refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only retry on 401 and not already retried, and not a login request
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh token endpoint
                const { data } = await axios.post(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                if (data.success) {
                    processQueue(null);
                    // Retry original request
                    return axiosClient(originalRequest);
                } else {
                    throw new Error(data.message || 'Refresh token failed');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Redirect to appropriate login page based on current URL
                const currentPath = window.location.pathname;
                const pathSegments = currentPath.split('/').filter(Boolean);
                const companySlug = pathSegments[0];

                if(pathSegments[1] === 'login') {
                    // Already on login page, just reject
                    return;
                }

                // Check if we're in admin area or company area
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                } else if (companySlug && companySlug !== 'admin') {
                    window.location.href = `/${companySlug}/login`;
                } else {
                    window.location.href = '/admin/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;