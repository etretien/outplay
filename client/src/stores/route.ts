import { MouseEvent } from 'react';
import { action, atom } from 'nanostores';

export const route = atom<string>('index');

export const setRoute = action(
  route,
  'setRoute',
  (store, payload: { event: MouseEvent | null; link: string }) => {
    if (payload.event) payload.event.preventDefault();
    store.set(payload.link);
    return store.get();
  },
);
