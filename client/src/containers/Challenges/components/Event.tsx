import { MouseEvent, useMemo, useState } from 'react';

import Button from '../../../components/Button/Button';
import Results from './Results';

import styles from '../Challenges.module.scss';
import appStyles from '../../../App.module.scss';

const setDate = (string: string) => {
  const date = new Date(string);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${day < 10 ? `0${day}` : day}.${month < 10 ? `0${month}` : month}.${year}`;
};

const setStatus = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Waiting for the reply';
    case 'DECLINED':
      return 'User declined the challenge';
    case 'ACCEPTED':
      return 'User accepted the challenge';
    default:
      return '';
  }
};

import { TEvent } from '../../../types/app-types';

type TAdditionalProps = {
  setRoute: (params: { event: MouseEvent | null; link: string }) => void;
  isOwn: boolean;
  disableResults?: boolean;
  onSave?: (id: number, data: Record<string, any>) => void;
};

const Event = (props: TEvent & TAdditionalProps) => {
  const showResultButton = useMemo(
    () =>
      props.participants.every((item) => item.challenge.status === 'ACCEPTED') &&
      props.status === 'PENDING',
    [props.participants, props.status],
  );
  const [resultView, setResultView] = useState<boolean>(false);

  return (
    <div className={styles.event}>
      <div className={styles.block}>
        <div className={styles.blockRow}>
          <span className={styles.rowTitle}>Date:</span>
          <span className={styles.rowValue}>{setDate(props.timestamp)}</span>
        </div>
        {!props.isOwn && (
          <div className={styles.blockRow}>
            <span className={styles.rowTitle}>Challenge from:</span>
            <span className={styles.rowValue}>
              <button
                className={appStyles.link}
                onClick={(e) =>
                  props.setRoute({ event: null, link: `players/${props.creator.id}` })
                }
              >
                {`${props.creator.firstName} ${props.creator.lastName}`}
              </button>
            </span>
          </div>
        )}
        <div className={styles.blockRow}>
          <span className={styles.rowTitle}>Name:</span>
          <span className={styles.rowValue}>{props.name}</span>
        </div>
        <div className={styles.blockRow}>
          <span className={styles.rowTitle}>Status:</span>
          <span className={styles.rowValue}>{props.status}</span>
        </div>
        <div className={`${styles.blockRow} ${styles.blockRowParticipants}`}>
          <span className={styles.rowTitle}>Participants:</span>
          <div className={styles.participants}>
            {props.participants.map((user) => (
              <div className={styles.participant} key={user.id}>
                <button
                  className={appStyles.link}
                  onClick={(e) => props.setRoute({ event: null, link: `players/${user.id}` })}
                >
                  {`${user.firstName} ${user.lastName}`}
                </button>
                <div className={styles.blockRow}>
                  <span className={styles.rowValue}>{setStatus(user.challenge.status)}</span>
                </div>
              </div>
            ))}
          </div>
          {!resultView && showResultButton && (
            <Button
              text='Set Result'
              className={styles.result}
              disabled={props.disableResults}
              onClick={() => setResultView(true)}
              color='green'
            />
          )}
        </div>
        {props.status === 'FINISHED' && (
          <div className={`${styles.blockRow} ${styles.blockRowParticipants}`}>
            <span className={styles.rowTitle}>Winners:</span>
            <div className={styles.participants}>
              {props.winners.length > 0 &&
                props.winners.map((user) => (
                  <div className={styles.participant} key={user.id}>
                    <button
                      className={appStyles.link}
                      onClick={(e) => props.setRoute({ event: e, link: `players/${user.id}` })}
                    >
                      {`${user.firstName} ${user.lastName}`}
                    </button>
                  </div>
                ))}
              {props.winners.length === 0 && <i>There was a draw</i>}
            </div>
          </div>
        )}
      </div>
      {resultView && (
        <Results event={props} onCancel={() => setResultView(false)} onSave={props.onSave} />
      )}
    </div>
  );
};

export default Event;
