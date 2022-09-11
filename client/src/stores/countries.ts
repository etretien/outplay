import { action, atom } from 'nanostores';

import json from '../static/countries.json';

export const countries = atom<{ [field: string]: string }>({});

export const getCountries = action(countries, 'getCountries', async (store) => {
  store.set(JSON.parse(json));
  return store.get();
});
