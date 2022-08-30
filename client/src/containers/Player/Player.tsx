import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import { users as usersStore, getUsers } from '../../stores/users';

import Profile from '../Profile/Profile';

import styles from './Player.module.scss';

import { TUser } from '../../types/app-types';
import Logo from '../../components/Logo/Logo';

const Player = () => {
  const params = useParams();
  const { list: users, isLoaded: isLoadedUsers } = useStore(usersStore);
  const [currentUser, setCurrentUser] = useState<TUser | undefined>(
    users.find(({ id }) => id === Number(params.id)),
  );

  useEffect(() => {
    if (!currentUser && !isLoadedUsers) {
      getUsers()
        .then((result) => {
          setCurrentUser(result.list.find(({ id }) => id === Number(params.id)));
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
