import { useState, useEffect, useRef } from 'react';
import cn from 'classnames';
import { useStore } from '@nanostores/react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

import Auth from './containers/Auth/Auth';
import Profile from './containers/Profile/Profile';
import Player from './containers/Player/Player';
import Players from './containers/Players/Players';
import NotFound from './containers/NotFound/NotFound';
import Challenges from './containers/Challenges/Challenges';
import Balance from './containers/Balance/Balance';

import Popup from './components/Popup/Popup';
import Logo from './components/Logo/Logo';

import { getCountries } from './stores/countries';
import { setAccessToken } from './stores/accessToken';

import { popup as popupStore, setPopup } from './stores/popup';
import { route as routeStore, setRoute } from './stores/route';
import { profile as profileStore, setProfile } from './stores/profile';
import { getChallenges } from './stores/challenges';

import { REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from './helpers/consts';
import { hashEmail } from './helpers/hash';

import $api from './api';

import './common-styles/fonts.scss';
import styles from './App.module.scss';

function App() {
  const popup = useStore(popupStore);
  const route = useStore(routeStore);
  const user = useStore(profileStore);

  const interval = useRef<NodeJS.Timer>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshToken] = useState<string | null>(localStorage.getItem(REFRESH_TOKEN_NAME));
  const [userEmail] = useState<string | null>(localStorage.getItem(USER_EMAIL_NAME));
  const [visitorId, setVisitorId] = useState<string>('');

  useEffect(() => {
    if (user.profile) {
      interval.current = setInterval(getChallenges.bind(null, user.profile.id), 30 * 1000);
      return () => {
        clearInterval(interval.current);
      };
    }
  }, [user.profile]);

  useEffect(() => {
    const fpPromise = FingerprintJS.load();

    (async () => {
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();
      setVisitorId(result.visitorId);
    })();
  }, []);

  useEffect(() => {
    getCountries().catch((e) => console.log('Getting countries error: ', e));
  }, []);

  useEffect(() => {
    if (!refreshToken) {
      setRoute({ event: null, link: 'sign-in' });
      setIsLoading(false);
    } else {
      if (userEmail) {
        hashEmail(userEmail).then((userHash) => {
          $api
            .post('auth/refresh', { refreshToken, userHash })
            .then((response) => {
              localStorage.setItem(REFRESH_TOKEN_NAME, response.data.refreshToken);
              setAccessToken(response.data.accessToken);
              setProfile({ profile: response.data.user, isLoaded: true });
              setRoute({ event: null, link: 'profile' });
            })
            .catch(() => setRoute({ event: null, link: 'sign-in' }))
            .finally(() => setIsLoading(false));
        });
      } else {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClosePopup = () => {
    const isSignup = popup.from === 'signup';
    const activationError = popup.from === 'activation-error';
    const expired = popup.from === 'expired';
    setPopup({});
    if (isSignup || activationError || expired) setRoute({ event: null, link: 'sign-in' });
    if (popup.from === 'restore-email') setRoute({ event: null, link: 'forgot-password' });
  };

  const renderComponent = () => {
    if (route.indexOf('players/') !== -1) return <Player link='players' />;
    switch (route) {
      case 'sign-in':
      case 'sign-up':
      case 'forgot-password':
      case 'activate':
      case 'restore-password':
        return <Auth visitorId={visitorId} />;
      case 'profile':
        return <Profile />;
      case 'players':
        return <Players />;
      case 'challenges':
        return <Challenges link='profile' />;
      case 'balance':
        return <Balance link='profile' />;
      default:
        return <NotFound />;
    }
  };

  return (
    <div className={cn(styles.app, { [styles['app--loading']]: isLoading })}>
      {isLoading ? <Logo style='max' /> : renderComponent()}
      {popup.title && (
        <Popup
          title={popup.title}
          message={popup.message}
          description={popup.description as unknown as string[]}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}

export default App;
