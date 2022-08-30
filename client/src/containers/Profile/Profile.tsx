import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Menu from '../../components/Menu/Menu';
import Avatar from '../../components/Avatar/Avatar';
import Logo from '../../components/Logo/Logo';

import { innerMenu } from '../../helpers/consts';

import { profile as profileStore, getProfile } from '../../stores/profile';

import styles from '../../App.module.scss';
import currentStyles from './Profile.module.scss';

import { TUser } from '../../types/app-types';

type TProps = {
  isOwner?: boolean;
  isSmall?: boolean;
  user?: TUser;
};

const Profile = (props: TProps) => {
  const { isOwner = true, isSmall = false, user: propUser } = props;
  const { profile, isLoaded } = useStore(profileStore);
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);

  const navigate = useNavigate();

  const alertHeader = useMemo(
    () => (
      <span className={currentStyles.alertHeader}>
        Challenge from <Link to='/players/123'>Night King</Link>
      </span>
    ),
    [],
  );

  const menuItems = useMemo(
    () =>
      innerMenu.map((item) => ({
        ...item,
        isActive: isOwner ? item.to === '/profile' : item.to === '/players',
      })),
    [isOwner],
  );

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else if (!propUser && isOwner && !profile) {
      getProfile()
        .then((result) => setCurrentUser(result.profile))
        .catch((e) => console.log('Profile error: ', e));
    } else if (isOwner && profile) {
      setCurrentUser(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <div
      className={cn(currentStyles.profile, { [currentStyles.profileSmall]: isSmall })}
      role='presentation'
      onClick={isSmall ? handleClick : undefined}
    >
      <div className={styles.container}>
        <div className={currentStyles.avatar}>
          <Avatar />
        </div>
        {!isSmall && (
          <>
            <h2>{isOwner && 'Token balance'}</h2>
            {isLoaded && currentUser ? (
              <>
                <h1>{`${currentUser.firstName} ${currentUser.lastName}`}</h1>
                <div className={currentStyles.info}>
                  <div className={currentStyles.infoRow}>
                    <p>{`About ${currentUser.firstName}`}</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <p>Rating</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <p>Game level</p>
                  </div>
                </div>
                <Button
                  className={currentStyles.newChallenge}
                  text='New challenge'
                  onClick={() => {}}
                  size='l'
                />
                <Alert
                  header={alertHeader}
                  cancelText='Dismiss'
                  applyText='Accept'
                  onCancel={() => {}}
                  onApply={() => {}}
                />
              </>
            ) : (
              <Logo style='min' />
            )}
            <Menu items={menuItems} />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
