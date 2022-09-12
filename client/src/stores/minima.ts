import { action, atom } from 'nanostores';

import MinimaHelper from '../helpers/minima';

export const minimaSettings = atom<{
  scriptAddress: null | string;
  address: null | string;
  publicKey: null | string;
}>({
  scriptAddress: null,
  address: null,
  publicKey: null,
});

export const getMinimaSettings = action(minimaSettings, 'getMinimaSettings', async (store) => {
  try {
    const scriptAddress = (await MinimaHelper.getScriptAddress()) as Record<string, string>;
    const address = (await MinimaHelper.getAddress()) as Record<string, string>;
    await MinimaHelper.importCoin();
    store.set({
      scriptAddress: scriptAddress.address,
      address: address.address,
      publicKey: address.publicKey,
    });
  } catch {
    throw new Error('Minima Error');
  }
});
