import { useMemo, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import Profile from '../Profile/Profile';
import Button from '../../components/Button/Button';
import Select from '../../components/Select/Select';
import Avatar from '../../components/Avatar/Avatar';
import Menu from '../../components/Menu/Menu';

import { users as usersStore, getUsers } from '../../stores/users';
import { setRoute } from '../../stores/route';

import appStyles from '../../App.module.scss';
import styles from './Players.module.scss';

import { INNER_MENU } from '../../helpers/consts';

import { TUser } from '../../types/app-types';

const UsersSkeleton = () => {
  return (
    <>
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <div className={cn(styles.player, styles.playerLoading)} key={index}>
            <div className={styles.avatar} />
            <div className={styles.info}></div>
          </div>
        ))}
    </>
  );
};

const Players = () => {
  const { list: users, isLoaded: isLoadedUsers } = useStore(usersStore);

  const [filter1Option, setFilter1Option] = useState<{
    value: string | number;
    text: string;
  } | null>(null);
  const [filter2Option, setFilter2Option] = useState<{
    value: string | number;
    text: string;
  } | null>(null);

  const menuItems = useMemo(
    () =>
      INNER_MENU.map((item) => ({
        ...item,
        isActive: item.to === 'players',
      })),
    [],
  );

  useEffect(() => {
    getUsers().catch((e) => console.log('Getting users error: ', e));
  }, []);

  const handleBack = () => setRoute({ event: null, link: 'profile' });

  const handleFilter1Change = (option: { value: string | number; text: string }) => {
    setFilter1Option(option);
  };

  const handleFilter2Change = (option: { value: string | number; text: string }) => {
    setFilter2Option(option);
  };

  return (
    <div className={styles.players}>
      <Button
        text='Back'
        className={appStyles.back}
        onClick={handleBack}
        size='s'
        color='transparent'
      />
      <Profile isOwner isSmall />
      <div className={appStyles.container}>
        <h1>Rating</h1>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <Select
              selected={filter1Option}
              placeholder='Filter'
              options={[
                { value: 'opt1', text: 'Option 1' },
                { value: 'opt2', text: 'Option 2' },
              ]}
              onChange={handleFilter1Change}
            />
          </div>
          <div className={styles.filter}>
            <Select
              selected={filter2Option}
              placeholder='Filter'
              options={[
                { value: 'opt1', text: 'Option 1' },
                { value: 'opt2', text: 'Option 2' },
              ]}
              onChange={handleFilter2Change}
            />
          </div>
        </div>
        <div className={styles.list}>
          {isLoadedUsers ? (
            users.map((user: TUser) => (
              <button
                className={styles.player}
                onClick={(e) => setRoute({ event: e, link: `players/${user.id}` })}
                key={user.id}
              >
                <div className={styles.avatar}>
                  <Avatar />
                </div>
                <div className={styles.info}></div>
              </button>
            ))
          ) : (
            <UsersSkeleton />
          )}
        </div>
        <Menu items={menuItems} />
      </div>
    </div>
  );
};

export default Players;
