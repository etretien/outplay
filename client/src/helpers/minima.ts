export default class Minima {
  private static GET_ADDRESS_COMMAND = `newscript script:"RETURN SIGNEDBY ('${
    import.meta.env.VITE_CREATOR_PUBLIC_KEY
  }') OR ((GETINTOK(0) EQ 0x00) AND (GETOUTTOK(0) EQ 0x00) AND (GETINTOK(1) EQ GETOUTTOK(1)) AND (GETOUTTOK(1) EQ GETOUTTOK(2)) AND (GETOUTADDR(0) EQ @ADDRESS) AND (GETOUTADDR(2) EQ @ADDRESS) AND (GETOUTAMT(0) EQ GETOUTAMT(1)) AND (GETOUTAMT(2) EQ GETINAMT(1) - GETOUTAMT(1)))" trackall:true`;

  private static IMPORT_COIN = `coinimport data:${import.meta.env.VITE_COIN_DATA}`;

  static getData(command: string) {
    return new Promise((resolve, reject) => {
      window.MDS.cmd(command, function (mdsResponse) {
        if (mdsResponse.response) resolve(mdsResponse.response);
        else reject({ error: true });
      });
    });
  }

  static getScriptAddress() {
    return this.getData(this.GET_ADDRESS_COMMAND);
  }

  static getAddress() {
    return this.getData('getaddress');
  }

  static async importCoin() {
    const coins = (await this.getData(this.IMPORT_COIN)) as Record<string, any>;
    if (coins.coin.coinid) return coins;
    throw new Error('Minima Error while importing coins');
  }

  static async exchange(
    minimaSettings: {
      scriptAddress: null | string;
      address: null | string;
      publicKey: null | string;
    },
    minimaCoinId: string,
    outplayCoinId: string,
    amount: number,
    exchangeBalanceAfter: number,
  ) {
    const transitionId = 'outplayexchange';

    const command1 = 'txncreate id:' + transitionId;
    const command2 = 'txnbasics id:' + transitionId;
    const command3 = 'txninput id:' + transitionId + ' coinid:' + minimaCoinId + ' scriptmmr:true';
    const command4 = 'txninput id:' + transitionId + ' coinid:' + outplayCoinId + ' scriptmmr:true';
    const command5 =
      'txnoutput id:' +
      transitionId +
      ' address:' +
      minimaSettings.scriptAddress +
      ' amount:' +
      amount;
    const command6 =
      'txnoutput id:' +
      transitionId +
      ' address:' +
      minimaSettings.address +
      ' tokenid:' +
      import.meta.env.VITE_OUTPLAY_TOKEN_ID +
      ' amount:' +
      amount;
    const command7 =
      'txnoutput id:' +
      transitionId +
      ' address:' +
      minimaSettings.scriptAddress +
      ' tokenid:' +
      import.meta.env.VITE_OUTPLAY_TOKEN_ID +
      ' amount:' +
      exchangeBalanceAfter;
    const command8 = 'txnsign id:' + transitionId + ' publickey:' + minimaSettings.publicKey;
    const command9 = 'txnpost id:' + transitionId;
    const command10 = 'txndelete id:' + transitionId;

    await this.getData(command1);
    await this.getData(command2);
    await this.getData(command3);
    await this.getData(command4);
    await this.getData(command5);
    await this.getData(command6);
    await this.getData(command7);
    await this.getData(command8);
    await this.getData(command9);
    await this.getData(command10);
    return { success: true };
  }

  static async sendChallenge(amount: number) {
    const command =
      'send amount:' +
      amount +
      ' tokenid:' +
      import.meta.env.VITE_OUTPLAY_TOKEN_ID +
      ' address:' +
      import.meta.env.VITE_CREATOR_ADDRESS;
    return this.getData(command);
  }
}
