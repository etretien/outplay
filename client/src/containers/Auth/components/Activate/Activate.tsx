import { useEffect, useState } from 'react';

import $api from '../../../../api';

import { setPopup } from '../../../../stores/popup';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';

import styles from './Activate.module.scss';
import authStyles from '../../Auth.module.scss';

const Activate = (props: { onActivate: (() => void) | undefined }) => {
  const [value, setValue] = useState<string>('');
  /*useEffect(() => {
    if (!location.search.length) {
      setPopup({
        title: 'Activation error',
        message: 'Activation link is missing',
        details: [],
        from: 'activation-error',
      });
    } else {
      const link = location.search.slice(1);
      $api
        .post('/auth/activate', { link })
        .then(() => {
          if (props.onActivate) props.onActivate();
        })
        .catch(() => {
          setPopup({
            title: 'API error',
            message: 'Activation link is not valid',
            details: [],
            from: 'activation-error',
          });
        });
    }
    console.log(location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);*/

  const handleValueChange = (newValue: string) => setValue(newValue);

  const handleActivate = () => {
    if (!value.length) {
      setPopup({
        title: 'Activation error',
        message: 'Activation link is missing',
        details: [],
      });
    } else {
      $api
        .post('/auth/activate', { link: value })
        .then(() => {
          if (props.onActivate) props.onActivate();
        })
        .catch(() => {
          setPopup({
            title: 'API error',
            message: 'Activation link is not valid',
            details: [],
          });
        });
    }
  };

  return (
    <div className={authStyles.authContainer}>
      <Input
        id='activate'
        label='Activation code'
        value={value}
        type='text'
        onChange={handleValueChange}
      />
      <Button text='Activate' onClick={handleActivate} size='l' />
    </div>
  );
};

export default Activate;
