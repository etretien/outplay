import { ReactNode } from 'react';

import Button from '../Button/Button';
import styles from './Alert.module.scss';

type TProps = {
  header: ReactNode;
  cancelText: string;
  applyText: string;
  onCancel: () => void;
  onApply: () => void;
};

const Alert = (props: TProps) => {
  return (
    <div className={styles.alert}>
      {props.header}
      <div className={styles.actions}>
        <Button text={props.cancelText} onClick={props.onCancel} size='m' color='gray' />
        <Button text={props.applyText} onClick={props.onApply} size='m' color='green' />
      </div>
    </div>
  );
};

export default Alert;
