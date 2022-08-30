import { useState, useEffect } from 'react';
import cn from 'classnames';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Auth from './containers/Auth/Auth';
import Profile from './containers/Profile/Profile';
import Player from './containers/Player/Player';
import Players from './containers/Players/Players';
import NotFound from './containers/NotFound/NotFound';

import Logo from './components/Logo/Logo';

import './common-styles/fonts.scss';
import styles from './App.module.scss';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('outplay_token'));

  useEffect(() => {
    // TODO when api added
    setTimeout(() => {
      if (!token) {
        navigate('sign-in');
      } else if (token && location.pathname === '/') {
        navigate('profile');
      }
      setIsLoading(false);
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      token &&
      (location.pathname.indexOf('sign') !== -1 || location.pathname.indexOf('forgot') !== -1)
    ) {
      navigate('profile');
    }
  }, [location.pathname, navigate, token]);

  const handleLogin = (token: string) => {
    localStorage.setItem('outplay_token', token);
    setToken(token);
  };

  return (
    <div className={cn(styles.app, { [styles['app--loading']]: isLoading })}>
      {isLoading && <Logo style='max' />}
      {!isLoading && (
        <Routes>
          <Route path='sign-in' element={<Auth onLogin={handleLogin} />} />
          <Route path='sign-up' element={<Auth onLogin={handleLogin} />} />
          <Route path='forgot-password' element={<Auth onLogin={handleLogin} />} />
          <Route path='profile' element={<Profile />} />
          <Route path='players' element={<Players />} />
          <Route path='players/:id' element={<Player />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      )}
    </div>
  );
}

export default App;
