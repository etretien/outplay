import { action, atom } from 'nanostores';

import { TUser } from '../types/app-types';

export const users = atom<{ list: TUser[]; isLoaded: boolean }>({ list: [], isLoaded: false });

export const getUsers = action(users, 'getUsers', async (store) => {
  const response: TUser[] = await new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, firstName: 'Jon', lastName: 'Snow' },
        { id: 123, firstName: 'Night King', lastName: '' },
        { id: 2, firstName: 'Jaime', lastName: 'Lannister' },
        { id: 3, firstName: 'Arya', lastName: 'Stark' },
        { id: 4, firstName: 'Jorah', lastName: 'Mormont' },
      ]);
    }, 1000);
  });
  store.set({ list: response, isLoaded: true });
  return store.get();
});
