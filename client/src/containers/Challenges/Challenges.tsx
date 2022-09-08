import { useStore } from '@nanostores/react';
import { useState } from 'react';

import withInnerView from '../../hocs/withInnerView';

import Button from '../../components/Button/Button';

import { challenges as challengesStore, getChallenges } from '../../stores/challenges';
import { profile as profileStore } from '../../stores/profile';
import { setRoute } from '../../stores/route';

import styles from './Challenges.module.scss';
import appStyles from '../../App.module.scss';

import $api from '../../api';

import Logo from '../../components/Logo/Logo';
import Event from './components/Event';

import { TEvent } from '../../types/app-types';

const Challenges = () => {
  const challenges = useStore(challengesStore);
  const { profile } = useStore(profileStore);

  const [history, setHistory] = useState<{
    isLoaded: boolean;
    isPending: boolean;
    list: { ownEvents: TEvent[]; participant: TEvent[] };
  }>({
    isLoaded: false,
    isPending: false,
    list: { ownEvents: [], participant: [] },
  });

  const handleViewHistory = () => {
    setHistory((prevState) => ({ ...prevState, isPending: true }));
    $api
      .get(`events?userId=${profile!.id}`)
      .then((result) => {
        setHistory({
          isLoaded: true,
          isPending: false,
          list: result.data,
        });
      })
      .catch((e) => {
        console.log('Getting events error: ', e);
        setHistory((prevState) => ({ ...prevState, isPending: false, isLoaded: false }));
      });
  };

  const handleReact = (id: number, status: string) => {
    $api
      .patch(`challenges/${id}`, { status })
      .then(() => {
        getChallenges(profile!.id).catch();
      })
      .catch((e) => console.log('Updating challenge error: ', e));
  };

  const handleSaveResult = (id: number, data: Record<string, any>) => {
    $api
      .patch(`events/${id}`, data)
      .then(() => {
        handleViewHistory();
      })
      .catch((e) => console.log('Setting result error: ', e));
  };
  console.log(history);

  const renderHistory = () => {
    return (
      <>
        <h2>Challenges from me</h2>
        {history.list.ownEvents.length === 0 && <i>There are no challenges</i>}
        {history.list.ownEvents.length > 0 &&
          history.list.ownEvents.map((event) => (
            <Event key={event.id} isOwn {...event} setRoute={setRoute} onSave={handleSaveResult} />
          ))}
        <h2>Challenges to me</h2>
        {history.list.participant.length === 0 && <i>There are no challenges</i>}
        {history.list.participant.length > 0 &&
          history.list.participant.map((event) => (
            <Event key={event.id} isOwn={false} {...event} setRoute={setRoute} />
          ))}
      </>
    );
  };

  return (
    <div className={styles.challenges}>
      <div className={appStyles.container}>
        <div className={styles.list}>
          <h2>Pending challenges</h2>
          {challenges.list.map((item) => (
            <div key={item.id} className={styles.challenge}>
              <p>
                {`Challenge "${item.event.name}" from `}
                <button
                  className={appStyles.link}
                  type='button'
                  onClick={(event) => setRoute({ event, link: `players/${item.creator.id}` })}
                >{`${item.creator.firstName} ${item.creator.lastName}`}</button>
              </p>
              <div className={styles.actions}>
                <Button
                  text='Dismiss'
                  color='gray'
                  onClick={() => handleReact(item.id, 'DECLINED')}
                />
                <Button
                  text='Accept'
                  color='green'
                  onClick={() => handleReact(item.id, 'ACCEPTED')}
                />
              </div>
            </div>
          ))}
          {!challenges.list.length && <i>There are no pending challenges</i>}
        </div>
        {!history.isLoaded && (
          <div className={styles.menu}>
            <button className={appStyles.link} onClick={handleViewHistory}>
              View History
            </button>
          </div>
        )}
        <div className={styles.list}>
          {history.isPending && <Logo style='min' />}
          {history.isLoaded && renderHistory()}
        </div>
      </div>
    </div>
  );
};

export default withInnerView(Challenges);
