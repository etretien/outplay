import { useState, useRef } from 'react';
import cn from 'classnames';

import useOutsideClick from '../../hooks/useOutsideClick';

import arrow from '../../static/icons/arrow.svg';

import styles from './Select.module.scss';

type Option = {
  value: string | number;
  text: string;
};

type TProps = {
  placeholder?: string;
  selected: Option | null;
  options: Option[];
  onChange: (value: Option) => void;
};

const Select = (props: TProps) => {
  const selectRef = useRef<HTMLDivElement | null>(null);
  const [optionsActive, setOptionsActive] = useState<boolean>(false);

  useOutsideClick(
    () => optionsActive && setOptionsActive(false),
    [selectRef.current as React.ReactNode],
  );

  const handleClick = () => setOptionsActive((prevState) => !prevState);

  const handleOptionClick = (option: Option) => {
    setOptionsActive(false);
    props.onChange(option);
  };

  return (
    <div className={styles.select} ref={selectRef}>
      <div className={styles.result}>
        <button type='button' onClick={handleClick}>
          {props.selected?.text ?? props.placeholder ?? 'Select'}
        </button>
        <img className={styles.arrow} src={arrow} alt='arrow' onClick={handleClick} />
      </div>
      <div className={cn(styles.options, { [styles.optionsActive]: optionsActive })}>
        {props.options.map((option) => (
          <button key={option.value} type='button' onClick={() => handleOptionClick(option)}>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Select;
