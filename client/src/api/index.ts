import axios from 'axios';

import { setPopup } from '../stores/popup';

const $api = axios.create({
  baseURL: `${import.meta.env.VITE_APP_SERVER_HOST}`,
});

$api.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

$api.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;
    if (error.response.status === 401) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/refresh`, {
          withCredentials: true,
        });
        localStorage.setItem('token', response.data.accessToken);
        return $api.request(originalRequest);
      } catch (e) {
        return Promise.reject(error.response.data);
      }
    } else {
      const message = JSON.parse(error.request.responseText).message;
      setPopup({
        title: 'API Error',
        message: error.message,
        description: Array.isArray(message) ? message : [message],
      });
      return Promise.reject(error.response.data);
    }
  },
);

export default $api;
