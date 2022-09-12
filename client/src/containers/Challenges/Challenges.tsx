/* eslint-disable react-hooks/exhaustive-deps */
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import withInnerView from '../../hocs/withInnerView';

import Button from '../../components/Button/Button';

import { challenges as challengesStore, getChallenges } from '../../stores/challenges';
import { profile as profileStore } from '../../stores/profile';
import { setRoute } from '../../stores/route';
import { minimaSettings as minimaSettingsStore } from '../../stores/minima';

import styles from './Challenges.module.scss';
import appStyles from '../../App.module.scss';

import $api from '../../api';

import Logo from '../../components/Logo/Logo';
import Event from './components/Event';

const transformEvents = (data: {
  ownEvents: TEvent[];
  participant: TEvent[];
}): { ownEvents: TEvent[]; ownPendingEvents: TEvent[]; participant: TEvent[] } => {
  const own = data.ownEvents.reduce<{ ownEvents: TEvent[]; ownPendingEvents: TEvent[] }>(
    (result, item) => {
      if (
        item.participants.every((item) => item.challenge.status === 'ACCEPTED') &&
        item.status === 'PENDING'
      ) {
        return { ...result, ownPendingEvents: [...result.ownPendingEvents, item] };
      }
      return { ...result, ownEvents: [...result.ownEvents, item] };
    },
    { ownEvents: [], ownPendingEvents: [] },
  );
  return {
    ...own,
    participant: data.participant,
  };
};

import { TEvent } from '../../types/app-types';

const Challenges = () => {
  const challenges = useStore(challengesStore);
  const { profile } = useStore(profileStore);
  const minimaSettings = useStore(minimaSettingsStore);

  const [history, setHistory] = useState<{
    isShown: boolean;
    isPending: boolean;
    list: { ownEvents: TEvent[]; ownPendingEvents: TEvent[]; participant: TEvent[] };
  }>({
    isShown: false,
    isPending: true,
    list: { ownEvents: [], ownPendingEvents: [], participant: [] },
  });

  const handleViewHistory = () => {
    setHistory((prevState) => ({ ...prevState, isPending: true }));
    $api
      .get(`events?userId=${profile!.id}`)
      .then((result) => {
        setHistory((prevState) => ({
          isShown: prevState.isShown,
          isPending: false,
          list: transformEvents(result.data),
        }));
      })
      .catch((e) => {
        console.log('Getting events error: ', e);
        setHistory((prevState) => ({ ...prevState, isPending: false }));
      });
  };

  useEffect(() => {
    getChallenges(profile!.id).catch((e) => console.log('Getting events error: ', e));
    handleViewHistory();
  }, []);

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

  const renderHistory = () => {
    return (
      <>
        <h2>Challenges from me</h2>
        {history.list.ownEvents.length === 0 && <i>There are no challenges</i>}
        {history.list.ownEvents.length > 0 &&
          history.list.ownEvents.map((event) => (
            <Event
              key={event.id}
              isOwn
              {...event}
              setRoute={setRoute}
              disableResults={!minimaSettings.scriptAddress}
              onSave={handleSaveResult}
            />
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
          {history.list.ownPendingEvents.map((event) => (
            <Event
              key={event.id}
              isOwn
              {...event}
              disableResults={!minimaSettings.scriptAddress}
              setRoute={setRoute}
              onSave={handleSaveResult}
            />
          ))}
          {!challenges.list.length && !history.list.ownPendingEvents.length && (
            <i>There are no pending challenges</i>
          )}
        </div>
        {!history.isShown && (
          <div className={styles.menu}>
            <button
              className={appStyles.link}
              onClick={() => setHistory((prevState) => ({ ...prevState, isShown: true }))}
            >
              View History
            </button>
          </div>
        )}
        <div className={styles.list}>
          {history.isPending && <Logo style='min' />}
          {history.isShown && !history.isPending && renderHistory()}
        </div>
      </div>
    </div>
  );
};

export default withInnerView(Challenges);
