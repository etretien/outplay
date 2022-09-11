import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';

import $api from '../../api';

import { INNER_MENU_PROFILE, REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from '../../helpers/consts';

import { profile as profileStore, setProfile } from '../../stores/profile';
import { setRoute } from '../../stores/route';
import { countries as countriesStore } from '../../stores/countries';
import { challenges as challengesStore } from '../../stores/challenges';

import { toBase64 } from '../../helpers/converters';

import ProfileView from './Profile.view';

import { TUser } from '../../types/app-types';
import { setPopup } from '../../stores/popup';

type TProps = {
  isOwner?: boolean;
  isSmall?: boolean;
  user?: TUser;
};

const Profile = (props: TProps) => {
  const { isOwner = true, isSmall = false, user: propUser } = props;

  const { profile, isLoaded } = useStore(profileStore);
  const countries = useStore(countriesStore);
  const challenges = useStore(challengesStore);

  const [currentUser, setCurrentUser] = useState<TUser | null>(propUser || profile || null);
  const [challengeMode, setChallengeMode] = useState<boolean>(false);

  useEffect(() => {
    setCurrentUser(propUser || profile);
  }, [propUser, profile]);

  const menuItems = useMemo(
    () =>
      INNER_MENU_PROFILE.map((item) => ({
        ...item,
        isActive: isOwner ? item.to === 'profile' : item.to === 'players',
        badge: item.to === 'challenges' ? challenges.list.length : null,
      })),
    [challenges.list.length, isOwner],
  );

  const handleClick = () => {
    setRoute({ event: null, link: 'profile' });
  };

  const handleBalance = () => {
    setRoute({ event: null, link: 'balance' });
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

  const handleModeChange = () => setChallengeMode((prevState) => !prevState);

  const handleChallenge = (id: number) => {
    $api
      .post('challenges', {
        creatorId: profile!.id,
        userIds: [id],
        eventName: 'PVP Challenge',
      })
      .then((response) => {
        if (response.data.success) {
          setPopup({
            title: 'Challenge created',
            message: 'Challenge was successfully created',
            description: [],
          });
        } else {
          setPopup({
            title: 'Error',
            message: 'There was an error during challenge creation. Please, try again',
            description: [],
          });
        }
      })
      .catch((e) => console.log('Creating challenge error: ', e));
  };

  return (
    <ProfileView
      isSmall={isSmall}
      onClick={handleClick}
      currentUser={currentUser}
      countries={countries}
      isOwner={isOwner || currentUser?.id === profile?.id}
      onUploadAvatar={handleUploadAvatar}
      isLoaded={isLoaded}
      onFieldChange={handleFieldChange}
      isChallengeMode={challengeMode}
      onModeChange={handleModeChange}
      onLogout={handleLogout}
      menuItems={menuItems}
      onChallengePlayer={handleChallenge}
      onBalance={handleBalance}
    />
  );
};

export default Profile;
