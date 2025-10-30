import axios from 'axios';

const url = import.meta.env.VITE_APP_SERVER_URL;

export const authAxios = axios.create({
    baseURL: url,
    withCredentials: true,
});