import { useState, useEffect } from 'react';
import cn from 'classnames';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';

import Auth from './containers/Auth/Auth';
import Profile from './containers/Profile/Profile';
import Player from './containers/Player/Player';
import Players from './containers/Players/Players';
import NotFound from './containers/NotFound/NotFound';

import Popup from './components/Popup/Popup';
import Logo from './components/Logo/Logo';

import { getCountries } from './stores/countries';
import { popup as popupStore, setPopup } from './stores/popup';

import './common-styles/fonts.scss';
import styles from './App.module.scss';

const AUTH_URLS = ['/sign-in', '/sign-up', '/forgot-password', '/activate-account'];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const popup = useStore(popupStore);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('outplay_token'));

  useEffect(() => {
    getCountries().catch((e) => console.log('Getting countries error: ', e));
    // TODO when api added
    setTimeout(() => {
      if (!token && !AUTH_URLS.includes(location.pathname)) {
        navigate('sign-in');
      } else if (token && location.pathname === '/') {
        navigate('profile');
      }
      setIsLoading(false);
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token && AUTH_URLS.includes(location.pathname)) {
      navigate('profile');
    }
  }, [location.pathname, navigate, token]);

  const handleLogin = (token: string) => {
    localStorage.setItem('outplay_token', token);
    setToken(token);
  };

  const handleClosePopup = () => {
    const isSignup = popup.from === 'signup';
    const activationError = popup.from === 'activation-error';
    setPopup({});
    if (isSignup || activationError) navigate('sign-in');
  };

  return (
    <div className={cn(styles.app, { [styles['app--loading']]: isLoading })}>
      {isLoading && <Logo style='max' />}
      {!isLoading && (
        <Routes>
          <Route path='sign-in' element={<Auth onLogin={handleLogin} />} />
          <Route path='sign-up' element={<Auth />} />
          <Route path='forgot-password' element={<Auth />} />
          <Route
            path='activate-account'
            element={<Auth onActivate={() => navigate('sign-in')} />}
          />
          <Route path='profile' element={<Profile />} />
          <Route path='players' element={<Players />} />
          <Route path='players/:id' element={<Player />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      )}
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
