import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';

import $api from '../../api/index';

import Button from '../../components/Button/Button';

import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Activate from './components/Activate/Activate';
import RestorePassword from './components/RestorePassword/RestorePassword';

import { setPopup } from '../../stores/popup';
import { route as routeStore, setRoute } from '../../stores/route';
import { setAccessToken } from '../../stores/accessToken';
import { setProfile } from '../../stores/profile';

import { REFRESH_TOKEN_NAME, USER_EMAIL_NAME } from '../../helpers/consts';

import styles from './Auth.module.scss';
import { getMinimaSettings } from '../../stores/minima';

const Auth = (props: { visitorId: string; onMinimaError: () => void }) => {
  const route = useStore(routeStore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const restoreCode = useRef<null | { code: string; id: number }>(null);

  useEffect(() => {
    setIsLoading(false);
  }, [route]);

  const handleReactivateAccount = async (email: string) => {
    await $api
      .post('auth/reactivate', { email })
      .then(() => {
        setPopup({
          title: 'A code successfully generated',
          message: 'Activation code was send to your email',
          details: [],
          from: 'signup',
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    $api
      .post('/auth/login', { email, password })
      .then((response) => {
        localStorage.setItem(REFRESH_TOKEN_NAME, response.data.refreshToken);
        localStorage.setItem(USER_EMAIL_NAME, email);
        setAccessToken(response.data.accessToken);
        setProfile({ profile: response.data.user, isLoaded: true });
        getMinimaSettings()
          .catch(() => {
            setPopup({
              title: 'Minima Error',
              message: 'Could not retrieve data',
              description: [],
            });
            props.onMinimaError();
          })
          .finally(() => setRoute({ event: null, link: 'profile' }));
      })
      .catch((e) => {
        if (e.statusCode === 403) {
          const description =
            e.message === 'Account is not active'
              ? [
                  e.message,
                  <Button
                    key='reactivate'
                    text='Send activation link'
                    size='s'
                    onClick={() => handleReactivateAccount(email)}
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

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    await $api
      .post('auth/restore-password', { email })
      .then(() => {
        setPopup({
          title: 'Restore code successfully generated',
          message: 'Restore code was send to your email',
          details: [],
          from: 'signup',
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleRestorePass = async (code: string) => {
    setIsLoading(true);
    await $api
      .post('auth/validate-restore-code', { code })
      .then((response) => {
        setRoute({ event: null, link: 'restore-password' });
        restoreCode.current = response.data;
      })
      .finally(() => setIsLoading(false));
  };

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

  const handleChangePass = async (password: string) => {
    setIsLoading(true);
    await $api
      .post('auth/update-password', {
        password,
        restoreCode: restoreCode.current?.code,
        userId: restoreCode.current?.id,
      })
      .then(() => {
        setRoute({ event: null, link: 'sign-in' });
      })
      .finally(() => setIsLoading(false));
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
      {route === 'forgot-password' && (
        <ForgotPassword onForgotPassword={handleForgotPassword} onRestore={handleRestorePass} />
      )}
      {route === 'activate' && <Activate onActivate={handleActivate} />}
      {route === 'restore-password' && <RestorePassword onApply={handleChangePass} />}
      {route === 'sign-in' && renderActions()}
    </div>
  );
};

export default Auth;
