import spinner from '../../static/icons/spinner.svg';

import styles from './Logo.module.scss';

type TProps = {
  style: 'min' | 'max';
};

const Logo = (props: TProps) => {
  return (
    <div className={styles.logo}>
      <img src={spinner} alt='loading' />
      {props.style === 'max' && <span>Outplay</span>}
    </div>
  );
};

export default Logo;
