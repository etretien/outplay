import { action, atom } from 'nanostores';
import axios from "axios";


export const countries = atom<{ [field: string]: string }>({});

export const getCountries = action(countries, 'getCountries', async (store) => {
    const response = await axios.get<null, { data: string }>('/data/countries.json');
    store.set(JSON.parse(response.data));
    return store.get();
});
