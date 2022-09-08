import { useState } from 'react';

import styles from '../../Auth.module.scss';

import FormWrapper from '../../../../components/FormWrapper/FormWrapper';
import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';

const RestorePassword = (props: { onApply: (pass: string) => void }) => {
  const [pass, setPass] = useState<{ value: string; error: string }>({ value: '', error: '' });
  const [repeatPass, setRepeatPass] = useState<{ value: string; error: string }>({
    value: '',
    error: '',
  });

  const handleRepeatPassChange = (value: string) => {
    setRepeatPass({ value, error: '' });
  };

  const handlePassChange = (value: string) => {
    setPass({ value, error: '' });
  };

  const handleApply = () => {
    let error = false;
    if (!pass.value.trim().length) {
      setPass((prevState) => ({ ...prevState, error: 'Password cannot be empty' }));
      error = true;
    }
    if (!repeatPass.value.trim().length || pass.value !== repeatPass.value) {
      setRepeatPass((prevState) => ({ ...prevState, error: 'Password does not match' }));
      error = true;
    }
    if (error) return;

    props.onApply(pass.value);
  };

  return (
    <div className={styles.authContainer}>
      <FormWrapper onSubmit={handleApply}>
        <fieldset>
          <Input
            id='pass'
            label='New password'
            {...pass}
            type='password'
            onChange={handlePassChange}
          />
          <Input
            id='repeat-pass'
            label='Repeat new password'
            {...repeatPass}
            type='password'
            onChange={handleRepeatPassChange}
          />
          <Button text='Submit' size='l' type='submit' onClick={() => {}} />
        </fieldset>
      </FormWrapper>
    </div>
  );
};

export default RestorePassword;
