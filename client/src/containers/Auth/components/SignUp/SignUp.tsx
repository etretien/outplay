import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';

import Input from '../../../../components/Input/Input';
import Button from '../../../../components/Button/Button';
import FormWrapper from '../../../../components/FormWrapper/FormWrapper';
import Select from '../../../../components/Select/Select';
import { isValidEmail } from '../../../../helpers/validation';

import { countries as countriesStore } from '../../../../stores/countries';

import styles from '../../Auth.module.scss';
import appStyles from '../../../../App.module.scss';

type TProps = {
  onSingUp: (form: { [field: string]: { value: string; error: string } }) => void;
  isLoading: boolean;
};

const initialForm = {
  firstName: {
    value: '',
    error: '',
  },
  lastName: {
    value: '',
    error: '',
  },
  email: {
    value: '',
    error: '',
  },
  countryCode: {
    value: '',
    error: '',
  },
  password: {
    value: '',
    error: '',
  },
  repeatPassword: {
    value: '',
    error: '',
  },
};

const setError = (field: string): string => {
  switch (field) {
    case 'firstName':
    case 'lastName':
    case 'password':
    case 'countryCode':
      return 'Field cannot be empty';
    case 'email':
      return 'Email is not valid';
    case 'repeatPassword':
      return "Passwords don't match";
    default:
      return '';
  }
};

const SignUp = (props: TProps) => {
  const navigate = useNavigate();
  const countries = useStore(countriesStore);

  const [form, setForm] = useState<{ [field: string]: { value: string; error: string } }>(
    initialForm,
  );

  const countryCodes = useMemo(() => {
    return Object.entries(countries).map(([value, text]) => {
      return { value, text };
    });
  }, [countries]);

  const countryCode = useMemo(() => {
    return countryCodes.find((item) => item.value === form.countryCode.value) ?? null;
  }, [countryCodes, form.countryCode]);

  const handleFieldChange = (value: string, field: string) => {
    setForm((prevState) => ({ ...prevState, [field]: { value, error: '' } }));
  };

  const handleSelectCountry = (country: { value: string | number; text: string }) => {
    setForm((prevState) => ({
      ...prevState,
      countryCode: { value: country.value as string, error: '' },
    }));
  };

  const handleApply = () => {
    const invalidFields: string[] = [];
    if (!form.firstName.value.trim().length) invalidFields.push('firstName');
    if (!form.lastName.value.trim().length) invalidFields.push('lastName');
    if (!isValidEmail(form.email.value)) invalidFields.push('email');
    if (!form.password.value.trim().length) invalidFields.push('password');
    if (!form.countryCode.value.length) invalidFields.push('countryCode');
    if (
      !form.repeatPassword.value.trim().length ||
      form.password.value !== form.repeatPassword.value
    )
      invalidFields.push('repeatPassword');

    if (invalidFields.length) {
      setForm((prevState) => {
        const newState = { ...prevState };
        invalidFields.forEach((field) => {
          newState[field].error = setError(field);
        });
        return newState;
      });
      return;
    }
    props.onSingUp(form);
  };

  const handleBack = () => navigate(-1);

  return (
    <>
      <Button
        text='Back'
        className={appStyles.back}
        onClick={handleBack}
        size='s'
        color='transparent'
      />
      <div className={styles.authContainer} style={{ marginTop: 100 }}>
        <FormWrapper onSubmit={handleApply}>
          <fieldset disabled={props.isLoading}>
            <Input
              id='firstName'
              label='First Name'
              value={form.firstName.value}
              error={form.firstName.error}
              type='text'
              onChange={handleFieldChange}
              param='firstName'
            />
            <Input
              id='lastName'
              label='Last Name'
              value={form.lastName.value}
              error={form.lastName.error}
              type='text'
              onChange={handleFieldChange}
              param='lastName'
            />
            <Input
              id='email'
              label='Email'
              value={form.email.value}
              error={form.email.error}
              type='email'
              onChange={handleFieldChange}
              param='email'
            />
            <label className={styles.selectLabel}>Select country</label>
            <Select
              selected={countryCode}
              options={countryCodes}
              error={form.countryCode.error}
              className={styles.select}
              onChange={handleSelectCountry}
            />
            <Input
              id='password'
              label='Password'
              value={form.password.value}
              error={form.password.error}
              type='password'
              onChange={handleFieldChange}
              param='password'
            />
            <Input
              id='repeatPassword'
              label='Re enter password'
              value={form.repeatPassword.value}
              error={form.repeatPassword.error}
              type='password'
              onChange={handleFieldChange}
              param='repeatPassword'
            />
            <Button text='Sign up' size='l' type='submit' onClick={() => {}} />
          </fieldset>
        </FormWrapper>
      </div>
    </>
  );
};

export default SignUp;
