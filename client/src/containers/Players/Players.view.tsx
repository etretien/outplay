import cn from 'classnames';

import withInnerView from '../../hocs/withInnerView';

import Select from '../../components/Select/Select';
import Avatar from '../../components/Avatar/Avatar';
import Menu from '../../components/Menu/Menu';

import { setRoute } from '../../stores/route';

import { TUser } from '../../types/app-types';
type TProps = {
  onClickBack: () => void;
  filter1Option: {
    value: string | number;
    text: string;
  } | null;
  filter2Option: {
    value: string | number;
    text: string;
  } | null;
  onFilter1Change: (option: { value: string | number; text: string }) => void;
  onFilter2Change: (option: { value: string | number; text: string }) => void;
  isLoadedUsers: boolean;
  users: TUser[];
  countries: { [field: string]: string };
  menuItems: { to: string; text: string; isActive: boolean }[];
};

import styles from './Players.module.scss';
import appStyles from '../../App.module.scss';
import { FunctionComponent } from 'react';

const UsersSkeleton = () => {
  return (
    <>
      {Array(4)
        .fill(0)
        .map((_, index) => (
          <div className={cn(styles.player, styles.playerLoading)} key={index}>
            <div className={styles.avatar} />
            <div className={styles.info}></div>
          </div>
        ))}
    </>
  );
};

const PlayersView: FunctionComponent<TProps> = (props: TProps) => {
  return (
    <div className={styles.players}>
      <div className={appStyles.container}>
        <h1>Rating</h1>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <Select
              selected={props.filter1Option}
              placeholder='Filter'
              options={[
                { value: 'opt1', text: 'Option 1' },
                { value: 'opt2', text: 'Option 2' },
              ]}
              onChange={props.onFilter1Change}
            />
          </div>
          <div className={styles.filter}>
            <Select
              selected={props.filter2Option}
              placeholder='Filter'
              options={[
                { value: 'opt1', text: 'Option 1' },
                { value: 'opt2', text: 'Option 2' },
              ]}
              onChange={props.onFilter2Change}
            />
          </div>
        </div>
        <div className={styles.list}>
          {props.isLoadedUsers ? (
            props.users.map((user: TUser) => (
              <button
                className={styles.player}
                onClick={(e) => setRoute({ event: e, link: `players/${user.id}` })}
                key={user.id}
              >
                <div className={styles.avatar}>
                  <Avatar
                    countryCode={user.countryCode}
                    countryName={props.countries[user.countryCode]}
                    avatar={user.avatar}
                  />
                </div>
                <div className={styles.info}>
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                </div>
              </button>
            ))
          ) : (
            <UsersSkeleton />
          )}
        </div>
        <Menu items={props.menuItems} />
      </div>
    </div>
  );
};

export default withInnerView(PlayersView);
