import { useState } from 'react';

import Button from '../../../../components/Button/Button';
import Input from '../../../../components/Input/Input';
import FormWrapper from '../../../../components/FormWrapper/FormWrapper';

import { isValidEmail } from '../../../../helpers/validation';

import { setRoute } from '../../../../stores/route';

import styles from '../../Auth.module.scss';
import appStyles from '../../../../App.module.scss';

const ForgotPassword = (props: {
  onForgotPassword: (pass: string) => void;
  onRestore: (pass: string) => void;
}) => {
  const [email, setEmail] = useState<{ value: string; error: string }>({ value: '', error: '' });
  const [restoreCode, setRestoreCode] = useState<{ value: string; error: string }>({
    value: '',
    error: '',
  });
  const [restoreMode, setRestoreMode] = useState<boolean>(false);

  const handleBack = () => setRoute({ event: null, link: 'sign-in' });

  const handleEmailChange = (value: string) => setEmail({ value, error: '' });

  const handleRestoreCodeChange = (value: string) => setRestoreCode({ value, error: '' });

  const handleApply = () => {
    if (!isValidEmail(email.value)) {
      setEmail((prevState) => ({ ...prevState, error: 'Email is not valid' }));
    } else {
      props.onForgotPassword(email.value);
    }
  };

  const handleRestore = () => {
    if (!restoreCode.value.length) {
      setRestoreCode((prevState) => ({ ...prevState, error: 'Code cannot be empty' }));
    } else {
      props.onRestore(restoreCode.value);
    }
  };

  return (
    <>
      <Button
        text='Back'
        className={appStyles.back}
        onClick={handleBack}
        size='s'
        color='transparent'
      />
      <div className={styles.authContainer}>
        {!restoreMode && (
          <FormWrapper onSubmit={handleApply}>
            <Input id='email' label='Email' {...email} type='email' onChange={handleEmailChange} />
            <Button text='Submit' size='l' type='submit' onClick={() => {}} />
          </FormWrapper>
        )}
        {restoreMode && (
          <FormWrapper onSubmit={handleRestore}>
            <Input
              id='restore'
              label='Restore code'
              {...restoreCode}
              type='text'
              onChange={handleRestoreCodeChange}
            />
            <Button text='Submit' size='l' type='submit' onClick={() => {}} />
          </FormWrapper>
        )}
        <button
          className={appStyles.link}
          onClick={() => setRestoreMode((prevState) => !prevState)}
        >
          {restoreMode ? 'Insert email' : 'Insert restore code'}
        </button>
      </div>
    </>
  );
};

export default ForgotPassword;
