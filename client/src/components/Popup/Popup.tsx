import Button from '../Button/Button';

import styles from './Popup.module.scss';

const Popup = (props: {
  title: string;
  message: string;
  description: string[];
  onClose: () => void;
}) => {
  return (
    <div className={styles.popup}>
      <h3>{props.title}</h3>
      <p>{props.message}</p>
      {(props.description || []).map((desc, index) => (
        <p key={index}>{desc}</p>
      ))}
      <Button text='Close' className={styles.close} onClick={props.onClose} size='s' />
    </div>
  );
};

export default Popup;
