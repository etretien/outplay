import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Menu from '../../components/Menu/Menu';
import Avatar from '../../components/Avatar/Avatar';
import Logo from '../../components/Logo/Logo';

import { INNER_MENU } from '../../helpers/consts';

import { profile as profileStore } from '../../stores/profile';
import { setRoute } from '../../stores/route';
import { countries as countriesStore } from '../../stores/countries';

import { toBase64 } from '../../helpers/converters';

import styles from '../../App.module.scss';
import currentStyles from './Profile.module.scss';

import { TUser } from '../../types/app-types';

type TProps = {
  isOwner?: boolean;
  isSmall?: boolean;
  user?: TUser;
  onUploadAvatar?: (data: string, type: string) => void;
};

const Profile = (props: TProps) => {
  const { isOwner = true, isSmall = false, user: propUser } = props;

  const { profile, isLoaded } = useStore(profileStore);
  const countries = useStore(countriesStore);

  const [currentUser, setCurrentUser] = useState<TUser | null>(propUser || profile || null);

  useEffect(() => {
    setCurrentUser(propUser || profile);
  }, [propUser, profile]);

  const alertHeader = useMemo(
    () => (
      <span className={currentStyles.alertHeader}>
        Challenge from <a href='players'>Night King</a>
      </span>
    ),
    [],
  );

  const menuItems = useMemo(
    () =>
      INNER_MENU.map((item) => ({
        ...item,
        isActive: isOwner ? item.to === 'profile' : item.to === 'players',
      })),
    [isOwner],
  );

  const handleClick = () => {
    setRoute({ event: null, link: 'profile' });
  };

  const handleUploadAvatar = async (data: string | File, type: string) => {
    if (props.onUploadAvatar) {
      const img = type === 'IMAGE' ? await toBase64(data as File) : data;
      props.onUploadAvatar(img as string, type);
    }
  };

  return (
    <div
      className={cn(currentStyles.profile, { [currentStyles.profileSmall]: isSmall })}
      role='presentation'
      onClick={isSmall ? handleClick : undefined}
    >
      <div className={styles.container}>
        <div className={currentStyles.avatar}>
          <Avatar
            countryCode={currentUser?.countryCode || ''}
            countryName={countries[currentUser?.countryCode || '']}
            avatar={currentUser?.avatar}
            canUpload={isOwner && !isSmall}
            onUpload={handleUploadAvatar}
          />
        </div>
        {!isSmall && (
          <>
            <h2>{isOwner && currentUser && `Token balance: ${currentUser.balance}`}</h2>
            {isLoaded && currentUser ? (
              <>
                <h1>{`${currentUser.firstName} ${currentUser.lastName}`}</h1>
                <div className={currentStyles.info}>
                  <div className={currentStyles.infoRow}>
                    <p>{`About ${currentUser.firstName}: ${currentUser.about || ''}`}</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <p>{`Rating: ${currentUser.rating}`}</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <p>{`Game level: ${currentUser.gameLevel || ''}`}</p>
                  </div>
                </div>
                <Button
                  className={currentStyles.newChallenge}
                  text='New challenge'
                  onClick={() => {}}
                  size='l'
                />
                {/*<Alert
                  header={alertHeader}
                  cancelText='Dismiss'
                  applyText='Accept'
                  onCancel={() => {}}
                  onApply={() => {}}
                />*/}
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
