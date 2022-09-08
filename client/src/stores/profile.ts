import { action, atom } from 'nanostores';

import { getChallenges } from './challenges';

import { TUser } from '../types/app-types';

export const profile = atom<{ profile: TUser | null; isLoaded: boolean }>({
  profile: null,
  isLoaded: false,
});

export const getProfile = action(profile, 'getProfile', async (store) => {
  return store.get();
});

export const setProfile = action(profile, 'setProfile', async (store, payload) => {
  if (payload.profile && payload.profile.id) {
    await getChallenges(payload.profile.id);
  }
  store.set(payload);
  return store.get();
});
