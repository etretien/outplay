import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import $api from '../../api/index';

import Button from '../../components/Button/Button';

import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Activate from './components/Activate/Activate';

import { setPopup } from '../../stores/popup';
import { route as routeStore, setRoute } from '../../stores/route';
import { setAccessToken } from '../../stores/accessToken';
import { setProfile } from '../../stores/profile';

import { REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from '../../helpers/consts';

import styles from './Auth.module.scss';

const Auth = (props: { visitorId: string }) => {
  const route = useStore(routeStore);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
  }, [route]);

  const handleReactivateAccount = () => {};

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    $api
      .post('/auth/login', { email, password })
      .then((response) => {
        localStorage.setItem(REFRESH_TOKEN_NAME, response.data.refreshToken);
        localStorage.setItem(USER_EMAIL_NAME, email);
        setAccessToken(response.data.accessToken);
        setRoute({ event: null, link: 'profile' });
        setProfile({ profile: response.data.user, isLoaded: true });
      })
      .catch((e) => {
        //TODO reactivation link
        if (e.statusCode === 403) {
          const description =
            e.message === 'Account is not active'
              ? [
                  e.message,
                  <Button
                    key='reactivate'
                    text='Send activation link'
                    size='s'
                    onClick={handleReactivateAccount}
                  />,
                ]
              : [e.message];
          setPopup({
            title: 'API Error',
            message: 'Request failed with status code 403',
            description,
          });
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleForgotPassword = (email: string) => {};
  const handleSignUp = async (form: { [field: string]: { value: string; error: string } }) => {
    setIsLoading(true);
    const data = Object.keys(form).reduce((result, key) => {
      if (key === 'repeatPassword') return result;
      return {
        ...result,
        [key]: form[key].value.trim(),
      };
    }, {});
    await $api
      .post('/users', { ...data, visitorId: props.visitorId })
      .then(() => {
        setPopup({
          title: 'You were successfully registered',
          message: 'Activation code was send to your email',
          details: [],
          from: 'signup',
        });
      })
      .catch(() => setIsLoading(false));
  };

  const handleActivate = () => {
    setRoute({ event: null, link: 'sign-in' });
  };

  const renderActions = () => {
    return (
      <div className={cn(styles.actions)}>
        <button onClick={(e) => setRoute({ event: e, link: 'forgot-password' })}>
          Forgot password
        </button>
        <button onClick={(e) => setRoute({ event: e, link: 'activate' })}>Activate</button>
        <button onClick={(e) => setRoute({ event: e, link: 'sign-up' })}>Sign up</button>
      </div>
    );
  };

  return (
    <div className={styles.auth}>
      {route === 'sign-in' && <SignIn isLoading={isLoading} onSingIn={handleSignIn} />}
      {route === 'sign-up' && <SignUp onSingUp={handleSignUp} isLoading={isLoading} />}
      {route === 'forgot-password' && <ForgotPassword onForgotPassword={handleForgotPassword} />}
      {route === 'activate' && <Activate onActivate={handleActivate} />}
      {route === 'sign-in' && renderActions()}
    </div>
  );
};

export default Auth;
