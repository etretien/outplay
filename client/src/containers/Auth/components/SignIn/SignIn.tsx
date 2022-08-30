import { useState } from 'react';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import FormWrapper from '../../../../components/FormWrapper/FormWrapper';

import { isValidEmail } from '../../../../helpers/validation';

import currentStyles from './SignIn.module.scss';
import styles from '../../Auth.module.scss';

type TProps = {
  onSingIn: (email: string, password: string) => void;
};

const SignIn = (props: TProps) => {
  const [email, setEmail] = useState<{ value: string; error: string }>({ value: '', error: '' });
  const [password, setPassword] = useState<{ value: string; error: string }>({
    value: '',
    error: '',
  });

  const handleEmailChange = (value: string) => setEmail({ value, error: '' });

  const handlePasswordChange = (value: string) => setPassword({ value, error: '' });

  const handleApply = () => {
    let isValid = true;
    if (!isValidEmail(email.value)) {
      setEmail((prevState) => ({ ...prevState, error: 'Email is not valid' }));
      isValid = false;
    }
    if (!password.value.length) {
      setPassword((prevState) => ({ ...prevState, error: 'Password cannot be empty' }));
      isValid = false;
    }
    if (!isValid) return;

    props.onSingIn(email.value, password.value);
  };

  return (
    <div className={styles.authContainer}>
      <div className={currentStyles.avatar} />
      <h1>Sign In</h1>
      <FormWrapper onSubmit={handleApply}>
        <Input id='email' label='Email' {...email} type='email' onChange={handleEmailChange} />
        <Input
          id='password'
          label='Password'
          {...password}
          type='password'
          onChange={handlePasswordChange}
        />
        <Button text='Sign in' size='l' type='submit' onClick={handleApply} />
      </FormWrapper>
    </div>
  );
};

export default SignIn;
