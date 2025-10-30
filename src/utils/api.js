import axios from 'axios';
import { refreshTokenThunk } from '../redux/refresh';
import { clearAuth } from '../redux/refresh';


const url = import.meta.env.VITE_APP_SERVER_URL;

let isGettingNewToken = false;
let waitingRequests = [];

// Add token from Redux store to every request

let store;
export const injectStore = _store => {
    store = _store;
};

export const authAxios = axios.create({
    baseURL: url,
    withCredentials: true,
});

authAxios.interceptors.request.use((config) => {
    if (store) {
        const state = store.getState();
        console.log(state)
        const token = state.accessToken.accessToken;
        console.log(token)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});


// Response interceptor - UPDATED to work with Redux
authAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log(error)

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._alreadyRetried) {
            if (isGettingNewToken) {
                return new Promise((success, fail) => {
                    waitingRequests.push({ success, fail });
                }).then(() => {
                    return authAxios(originalRequest);
                });
            }

            originalRequest._alreadyRetried = true;
            isGettingNewToken = true;

            try {
                console.log('Token expired, getting new token...');

                // Use your existing refreshTokenThunk from Redux!
                await store.dispatch(refreshTokenThunk()).unwrap();

                // The token is now automatically in Redux store
                // The request interceptor will pick it up

                waitingRequests.forEach(waiting => waiting.success());
                waitingRequests = [];

                // Retry the original request
                return authAxios(originalRequest);

            } catch (refreshError) {
                // Refresh failed - clear auth state
                store.dispatch(clearAuth());
                waitingRequests.forEach(waiting => waiting.fail(refreshError));
                waitingRequests = [];

                console.log('Refresh failed, logging out...');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isGettingNewToken = false;
            }
        }

        return Promise.reject(error);
    }
);