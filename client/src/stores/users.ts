import { action, atom } from 'nanostores';

import { TUser } from '../types/app-types';

import $api from '../api';

const setUrl = (params: Record<string, string>) => {
  return Object.entries(params).reduce<string>((result, item) => {
    return `${result}&${item[0]}=${item[1]}`;
  }, 'users?');
};

export const users = atom<{ list: TUser[]; isLoaded: boolean }>({ list: [], isLoaded: false });

export const getUsers = action(users, 'getUsers', async (store, query?: Record<string, string>) => {
  const url = query ? setUrl(query) : 'users';
  const response = await $api.get(url);
  store.set({ list: response.data.users, isLoaded: true });
  return store.get();
});
