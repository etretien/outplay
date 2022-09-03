import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import $api from '../../api';

import Button from '../../components/Button/Button';
import Alert from '../../components/Alert/Alert';
import Menu from '../../components/Menu/Menu';
import Avatar from '../../components/Avatar/Avatar';
import Logo from '../../components/Logo/Logo';
import EditableContent from '../../components/EditableContent/EditableContent';

import { INNER_MENU_PROFILE, REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from '../../helpers/consts';

import { profile as profileStore, setProfile } from '../../stores/profile';
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
      INNER_MENU_PROFILE.map((item) => ({
        ...item,
        isActive: isOwner ? item.to === 'profile' : item.to === 'players',
        badge: item.to === 'my-challenges' ? 5 : null,
      })),
    [isOwner],
  );

  const handleClick = () => {
    setRoute({ event: null, link: 'profile' });
  };

  const handleUploadAvatar = async (data: string | File, type: string) => {
    const img = type === 'IMAGE' ? await toBase64(data as File) : data;
    $api.patch(`users/${currentUser!.id}`, { avatar: img, avatarType: type }).then((response) => {
      if (response) {
        setProfile({ profile: { ...currentUser, avatar: response.data }, isLoaded: true });
      }
    });
  };

  const handleLogout = () => {
    $api
      .post('auth/logout', { refreshToken: localStorage.getItem(REFRESH_TOKEN_NAME) })
      .then((response) => {
        if (response) {
          setProfile({
            profile: null,
            isLoaded: false,
          });
          setRoute({ event: null, link: 'sign-in' });
          localStorage.setItem(REFRESH_TOKEN_NAME, '');
          localStorage.setItem(USER_EMAIL_NAME, '');
        }
      });
  };

  const handleFieldChange = (value: string, field: string | undefined) => {
    setProfile({ profile: { ...currentUser, [field as string]: value }, isLoaded: true });
    $api
      .patch(`users/${currentUser!.id}`, { [field as string]: value })
      .catch((e) => console.log('Updating profile error: ', e));
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
            avatar={currentUser?.avatar || null}
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
                    <p>{`Rating: ${currentUser.rating}`}</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <EditableContent
                      value={currentUser.about || ''}
                      label={`About ${currentUser.firstName}`}
                      maxLength={100}
                      param='about'
                      onChange={handleFieldChange}
                    />
                  </div>
                  <div className={currentStyles.infoRow}>
                    <EditableContent
                      value={currentUser.gameLevel || ''}
                      label='Game level'
                      maxLength={100}
                      param='gameLevel'
                      onChange={handleFieldChange}
                    />
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
                {isOwner && (
                  <button className={currentStyles.logout} onClick={handleLogout}>
                    Logout
                  </button>
                )}
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
