import { action, atom } from 'nanostores';
import axios from 'axios';

export const countries = atom<{ [field: string]: string }>({});

export const getCountries = action(countries, 'getCountries', async (store) => {
  const { pathname } = document.location;
  const path = pathname.length > 1 ? pathname.split('/')[1] : '';
  const response = await axios.get<null, { data: string }>(`${path}/data/countries.json`);
  store.set(JSON.parse(response.data));
  return store.get();
});
