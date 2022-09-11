import { useStore } from '@nanostores/react';
import { BsArrowLeftRight, BsFillArrowUpRightSquareFill } from 'react-icons/bs';
import { FaRegCopy, FaQrcode, FaSync, FaGhost } from 'react-icons/fa';

import { minima as minimaStore } from '../../stores/minima';

import withInnerView from '../../hocs/withInnerView';

import styles from './Balance.module.scss';
import appStyles from '../../App.module.scss';

const Balance = () => {
  const minima = useStore(minimaStore);

  if (minima.minimaBalance === null || minima.outplayBalance === null) {
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
        <div className={styles.balanceBlock}>
          <div className={styles.block}>
            <h3>Outplay</h3>
            <p className={styles.value}>
              1234 <span className={styles.currency}>pl</span>
            </p>
            <div className={styles.token}>
              <p>My Outplay wallet</p>
              <div>
                <p>fjdisfuidsjffjdsijfdsifjdisjfdisfjdijfidjf</p>
                <button className={appStyles.link}>
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
              50 <span className={styles.currency}>mini</span>
            </p>
            <div className={styles.actions}>
              <button className={appStyles.link}>
                <BsFillArrowUpRightSquareFill />
              </button>
              <button className={appStyles.link}>
                <BsFillArrowUpRightSquareFill />
              </button>
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
