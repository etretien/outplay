import axios from 'axios';

import { setPopup } from '../stores/popup';
import { getAccessToken, setAccessToken } from '../stores/accessToken';

import { REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from '../helpers/consts';
import { hashEmail } from '../helpers/hash';

const isDev = import.meta.env.MODE === 'development';

const $api = axios.create({
  baseURL: `${
    isDev ? import.meta.env.VITE_APP_SERVER_DEV_HOST : import.meta.env.VITE_APP_SERVER_HOST
  }`,
});

$api.interceptors.request.use(
  (config) => {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${getAccessToken()}`;
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
        if (!localStorage.getItem(USER_EMAIL_NAME) || !localStorage.getItem(REFRESH_TOKEN_NAME))
          return Promise.reject(error.response.data);

        const userHash = await hashEmail(localStorage.getItem(USER_EMAIL_NAME) as string);
        const response = await $api.post('/auth/refresh', {
          refreshToken: localStorage.getItem(REFRESH_TOKEN_NAME),
          userHash,
        });
        localStorage.setItem(REFRESH_TOKEN_NAME, response.data.refreshToken);
        setAccessToken(response.data.accessToken);
        return $api.request(originalRequest);
      } catch (e) {
        setPopup({
          title: 'Session expired',
          message: 'Your session has expired. Please, login again',
          description: [],
          from: 'expired',
        });
        return Promise.reject(error.response.data);
      }
    }

    const message = JSON.parse(error.request.responseText).message;
    const isException = error.config.url.indexOf('auth/refresh') !== -1;
    if (!isException) {
      setPopup({
        title: 'API Error',
        message: error.message,
        description: Array.isArray(message) ? message : [message],
      });
    }
    return Promise.reject(error.response.data);
  },
);

export default $api;
