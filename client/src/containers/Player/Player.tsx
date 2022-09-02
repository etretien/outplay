import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import { users as usersStore, getUsers } from '../../stores/users';
import { route as routeStore } from '../../stores/route';

import Profile from '../Profile/Profile';
import Logo from '../../components/Logo/Logo';

import styles from './Player.module.scss';

import { TUser } from '../../types/app-types';

const Player = () => {
  const route = useStore(routeStore);
  const { list: users, isLoaded: isLoadedUsers } = useStore(usersStore);

  const [currentUser, setCurrentUser] = useState<TUser | undefined>(
    users.find(({ id }) => id === Number(route.split('/')[1])),
  );

  useEffect(() => {
    if (!currentUser && !isLoadedUsers) {
      getUsers()
        .then((result) => {
          setCurrentUser(result.list.find(({ id }) => id === Number(route.split('/')[1])));
        })
        .catch((e) => console.log('Getting users error: ', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoadedUsers) {
    return (
      <div className={cn(styles.player, styles.playerLoading)}>
        <Logo style='min' />
      </div>
    );
  }

  return (
    <div className={styles.player}>
      {currentUser ? (
        <Profile isOwner={false} user={currentUser} />
      ) : (
        <h1 className={styles.notFound}>Sorry, no user found</h1>
      )}
      <Profile isOwner isSmall />
    </div>
  );
};

export default Player;
