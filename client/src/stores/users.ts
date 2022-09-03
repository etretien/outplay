import { action, atom } from 'nanostores';

import { TUser } from '../types/app-types';

import $api from '../api';

export const users = atom<{ list: TUser[]; isLoaded: boolean }>({ list: [], isLoaded: false });

export const getUsers = action(users, 'getUsers', async (store) => {
  const response = await $api.get('users');
  store.set({ list: response.data.users, isLoaded: true });
  return store.get();
});
