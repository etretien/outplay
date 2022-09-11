import { action, atom } from 'nanostores';

export const minima = atom<{
  minimaBalance: null | number;
  outplayBalance: null | number;
  error: boolean;
}>({
  minimaBalance: null,
  outplayBalance: null,
  error: false,
});

export const getMinima = action(minima, 'getMinima', async (store) => {
  try {
    window.MDS.cmd('balance', function (balanceReturn) {
      if (balanceReturn.response) {
        const minimaToken = balanceReturn.response.find(
          (item: { token: string }) => item.token === 'Minima',
        );
        const outplayToken = balanceReturn.response.find(
          (item: { token: { name: string } }) => item.token.name === 'Outplay',
        );
        setMinima({
          minimaBalance: Math.round(minimaToken.sendable),
          outplayBalance: Math.round(outplayToken.sendable),
          error: false,
        });

        // properly we should look for tokenid (0x00 for Minima and 0x.... for Outplay)
      } else {
        setMinima({
          minimaBalance: null,
          outplayBalance: null,
          error: true,
        });
      }
    });
  } catch (e) {
    console.log('Minima error: ', e);
    setMinima({
      minimaBalance: null,
      outplayBalance: null,
      error: true,
    });
  }

  return store.get();
});

export const setMinima = action(minima, 'setMinima', async (store, payload) => {
  store.set(payload);
  return store.get();
});
