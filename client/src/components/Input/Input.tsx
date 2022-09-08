import cn from 'classnames';

import styles from './Input.module.scss';
import { ChangeEvent } from 'react';

type TProps = {
  id: string;
  label?: string;
  value: string;
  type: string;
  error?: string;
  className?: string;
  onChange: (value: string, param: string) => void;
  param?: string;
};

const Input = (props: TProps) => {
  const { id, label, type, value, error, className, param, onChange } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, param || '');
  };

  return (
    <div className={cn(styles.input, className, { [styles.error]: !!error?.length })}>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} type={type} value={value} onChange={handleChange} />
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
};

export default Input;
