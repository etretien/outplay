import { action, atom } from 'nanostores';

export const accessToken = atom<string>('');

export const setAccessToken = action(accessToken, 'setAccessToken', (store, payload) => {
  store.set(payload);
  return store.get();
});

export const getAccessToken = action(accessToken, 'setAccessToken', (store) => store.get());
