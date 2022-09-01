import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import cn from 'classnames';

import $api from '../../api/index';

import Button from '../../components/Button/Button';

import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Activate from './components/Activate/Activate';

import { setPopup } from '../../stores/popup';

import styles from './Auth.module.scss';

type TProps = {
  onLogin?: (token: string) => void;
  onActivate?: () => void;
};

const Auth = (props: TProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
  }, [location]);

  const handleReactivateAccount = () => {};

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    $api
      .post('/auth/login', { email, password })
      .catch((e) => {
        //TODO reactivation link
        if (e.statusCode === 403) {
          setPopup({
            title: 'API Error',
            message: 'Request failed with status code 403',
            description: [
              'Account is not active',
              <Button
                key='reactivate'
                text='Send activation link'
                size='s'
                onClick={handleReactivateAccount}
              />,
            ],
          });
        }
      })
      .finally(() => setIsLoading(false));
    //props.onLogin(String(Math.random()));
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
    await $api.post('/auth/register', data).catch(() => setIsLoading(false));
    setPopup({
      title: 'You were successfully registered',
      message: 'Activation link was send to your email',
      details: [],
      from: 'signup',
    });
  };

  const renderActions = () => {
    return (
      <div className={cn(styles.actions)}>
        <Link to='/forgot-password'>Forgot password</Link>
        <Link to='/sign-up'>Sign up</Link>
      </div>
    );
  };

  return (
    <div className={styles.auth}>
      {location.pathname === '/sign-in' && <SignIn isLoading={isLoading} onSingIn={handleSignIn} />}
      {location.pathname === '/sign-up' && <SignUp onSingUp={handleSignUp} isLoading={isLoading} />}
      {location.pathname === '/forgot-password' && (
        <ForgotPassword onForgotPassword={handleForgotPassword} />
      )}
      {location.pathname.indexOf('/activate') !== -1 && <Activate onActivate={props.onActivate} />}
      {location.pathname === '/sign-in' && renderActions()}
    </div>
  );
};

export default Auth;
