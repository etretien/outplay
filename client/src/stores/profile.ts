import { action, atom } from 'nanostores';

import { TUser } from '../types/app-types';

export const profile = atom<{ profile: TUser | null; isLoaded: boolean }>({
  profile: null,
  isLoaded: false,
});

export const getProfile = action(profile, 'getProfile', async (store) => {
  /*const response: TUser = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: 1, firstName: 'Jon', lastName: 'Snow' });
    }, 1000);
  });
  store.set({ profile: response, isLoaded: true });*/
  return store.get();
});

export const setProfile = action(profile, 'setProfile', (store, payload) => {
  store.set(payload);
  return store.get();
});
