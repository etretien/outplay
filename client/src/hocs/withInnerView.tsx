import { FunctionComponent } from 'react';

import { setRoute } from '../stores/route';

import Button from '../components/Button/Button';
import Profile from '../containers/Profile/Profile';

import styles from '../App.module.scss';

// eslint-disable-next-line react/display-name
const withInnerView = (Component: FunctionComponent<any>) => (props: any) => {
  return (
    <div className={styles.innerContainer}>
      <Button
        text='Back'
        className={styles.back}
        onClick={() => setRoute({ event: null, link: props.link })}
        size='s'
        color='transparent'
      />
      <Profile isOwner isSmall />
      <Component {...props} />
    </div>
  );
};

export default withInnerView;
