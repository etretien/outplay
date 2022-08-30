import user from '../../static/icons/user.svg';

import styles from './Avatar.module.scss';

const Avatar = () => (
  <div className={styles.avatar}>
    <img src={user} alt='avatar' />
    <div className={`${styles.flag} avatar__flag`} />
  </div>
);

export default Avatar;
