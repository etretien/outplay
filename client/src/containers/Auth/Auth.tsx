import { useLocation, Link } from 'react-router-dom';
import cn from 'classnames';

import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';

import styles from './Auth.module.scss';

type TProps = {
  onLogin: (token: string) => void;
};

const Auth = (props: TProps) => {
  const location = useLocation();

  const handleSignIn = (email: string, password: string) => {
    props.onLogin(String(Math.random()));
  };
  const handleForgotPassword = (email: string) => {};
  const handleSignUp = (form: { [field: string]: { value: string; error: string } }) => {};

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
      {location.pathname === '/sign-in' && <SignIn onSingIn={handleSignIn} />}
      {location.pathname === '/sign-up' && <SignUp onSingUp={handleSignUp} />}
      {location.pathname === '/forgot-password' && (
        <ForgotPassword onForgotPassword={handleForgotPassword} />
      )}
      {location.pathname === '/sign-in' && renderActions()}
    </div>
  );
};

export default Auth;
