import { action, atom } from 'nanostores';

export const popup = atom<{ [field: string]: string }>({});

export const setPopup = action(popup, 'setPopup', async (store, payload) => {
  store.set(payload);
  return store.get();
});
