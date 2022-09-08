import { action, atom } from 'nanostores';

import { TChallenge } from '../types/app-types';

import $api from '../api';

export const challenges = atom<{ list: TChallenge[]; isLoaded: boolean }>({
  list: [],
  isLoaded: false,
});

export const getChallenges = action(challenges, 'getChallenges', async (store, userId: number) => {
  const response = await $api.get(`challenges?userId=${userId}`);
  store.set({ list: response.data, isLoaded: true });
  return store.get();
});
