import { ChangeEvent, useEffect, useState } from 'react';
import { BsArrowLeftRight, BsFillArrowUpRightSquareFill } from 'react-icons/bs';
import { FaRegCopy, FaQrcode, FaSync, FaGhost } from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import { useStore } from '@nanostores/react';

import { setPopup } from '../../stores/popup';
import { minimaSettings as minimaSettingsStore } from '../../stores/minima';

import MinimaHelper from '../../helpers/minima';

import Logo from '../../components/Logo/Logo';

import withInnerView from '../../hocs/withInnerView';

import styles from './Balance.module.scss';
import appStyles from '../../App.module.scss';

const Balance = () => {
  const [balance, setBalance] = useState<{
    minima: null | number;
    outplay: null | number;
    isLoading: boolean;
  }>({ minima: null, outplay: null, isLoading: true });
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<boolean>(false);
  const [importAmount, setImportAmount] = useState<number>(1);

  const minimaSettings = useStore(minimaSettingsStore);

  const getBalance = async () => {
    try {
      const balance = (await MinimaHelper.getData('balance')) as Record<string, any>[];
      const minimaToken = balance.find((item) => item.token === 'Minima');
      const outplayToken = balance.find((item) => item.token.name === 'Outplay');
      setBalance({
        minima: Math.round(minimaToken?.sendable),
        outplay: Math.round(outplayToken?.sendable),
        isLoading: false,
      });
    } catch {
      setBalance((prevState) => ({ ...prevState, isLoading: false }));
      setPopup({
        title: 'Minima error',
        message: 'Could not retrieve balance',
        description: [],
      });
    }
  };

  useEffect(() => {
    getBalance().catch((e) => console.log('Getting balance error: ', e));
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(minimaSettings.address || '');
  };

  const handleCancelImport = () => {
    setImportMode(false);
    setImportAmount(1);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportAmount(+e.target.value);
  };

  const handleStartImport = async () => {
    setIsImporting(true);
    const amount = importAmount + 0.000001;
    const splitCoinCommand = `send amount:${amount} address:${minimaSettings.address}`;
    const exchangeCoinCommand = `coins address:${minimaSettings.scriptAddress}`;
    try {
      const splitCoin = (await MinimaHelper.getData(splitCoinCommand)) as Record<string, any>; //body.txn.outputs[0].coinid
      const exchangeCoin = (await MinimaHelper.getData(exchangeCoinCommand)) as Record<
        string,
        any
      >[];
      const outplayCoin = exchangeCoin.find(
        (item) => item.tokenid === import.meta.env.VITE_OUTPLAY_TOKEN_ID,
      );
      const result = await MinimaHelper.exchange(
        minimaSettings,
        splitCoin.body.txn.outputs[0].coinid,
        outplayCoin!.coinid,
        amount,
        outplayCoin!.tokenamount - amount,
      );
      if (result.success) {
        setPopup({
          title: 'Coins exchanged successfully',
          message: 'If the balance is not updated, please, refresh the app',
          description: [],
        });
        getBalance().catch((e) => console.log('Getting balance error: ', e));
      }
    } catch {
      setPopup({
        title: 'Minima error',
        message: 'Exchange failed',
        description: [],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const renderImport = () => {
    return (
      <div className={styles.importBlock}>
        <input
          id='import'
          value={importAmount.toString()}
          type='number'
          min={1}
          max={(balance.minima || 1) - 1 || 1}
          onChange={handleAmountChange}
        />
        <button onClick={handleStartImport}>
          <IoMdCheckmarkCircle />
        </button>
        <button onClick={handleCancelImport}>
          <IoMdCloseCircle />
        </button>
      </div>
    );
  };

  if (balance.isLoading) {
    return <Logo style='min' />;
  }

  if (balance.minima === null || balance.outplay === null) {
    return (
      <div className={styles.balance}>
        <div className={appStyles.container}>
          <div className={`${styles.balanceBlock} ${styles.balanceBlockError}`}>
            <FaGhost />
            <h3>Could not retrieve balance</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.balance}>
      <div className={appStyles.container}>
        {isImporting && (
          <div className={appStyles.import}>
            <Logo style='min' />
          </div>
        )}
        <div className={styles.balanceBlock}>
          <div className={styles.block}>
            <h3>Outplay</h3>
            <p className={styles.value}>
              {balance.outplay} <span className={styles.currency}>pl</span>
            </p>
            <div className={styles.token}>
              <p>My Outplay wallet</p>
              <div>
                <p>{minimaSettings.address}</p>
                <button className={appStyles.link} onClick={handleCopy}>
                  <FaRegCopy />
                </button>
                <button className={appStyles.link}>
                  <FaQrcode />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.iconBlock}>
            <button className={appStyles.link}>
              <BsArrowLeftRight />
            </button>
          </div>
          <div className={styles.block}>
            <h3>Minima</h3>
            <p className={styles.value}>
              {balance.minima} <span className={styles.currency}>mini</span>
            </p>
            <div className={styles.actions}>
              {!importMode && (
                <button className={appStyles.link} onClick={() => setImportMode(true)}>
                  <BsFillArrowUpRightSquareFill />
                </button>
              )}
              {importMode && renderImport()}
            </div>
          </div>
        </div>
        <div className={styles.history}>
          <h3>
            ... <FaSync />
          </h3>
        </div>
      </div>
    </div>
  );
};

export default withInnerView(Balance);
