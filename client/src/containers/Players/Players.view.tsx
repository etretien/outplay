import { FunctionComponent, useMemo } from 'react';
import cn from 'classnames';
import { IoIosClose } from 'react-icons/io';

import withInnerView from '../../hocs/withInnerView';

import Select from '../../components/Select/Select';
import Avatar from '../../components/Avatar/Avatar';
import Menu from '../../components/Menu/Menu';
import Input from '../../components/Input/Input';

import { setRoute } from '../../stores/route';

import { TUser } from '../../types/app-types';
type TProps = {
  onClickBack: () => void;
  filterOption: {
    value: string | number;
    text: string;
  } | null;
  onFilterChange: (option: { value: string | number; text: string } | null) => void;
  isLoadedUsers: boolean;
  users: TUser[];
  countries: { [field: string]: string };
  menuItems: { to: string; text: string; isActive: boolean; icon: JSX.Element }[];
  searchQuery: string;
  onSearch: (value: string) => void;
};

import styles from './Players.module.scss';
import appStyles from '../../App.module.scss';

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
  const countries: { value: string; text: string }[] = useMemo(() => {
    return Object.entries(props.countries).map((item) => ({
      value: item[0],
      text: item[1],
    }));
  }, [props.countries]);

  return (
    <div className={styles.players}>
      <div className={appStyles.container}>
        <h1>Rating</h1>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <Select
              selected={props.filterOption}
              placeholder='Filter'
              options={countries}
              onChange={props.onFilterChange}
            />
            {!!props.filterOption && (
              <button className={appStyles.link} onClick={() => props.onFilterChange(null)}>
                <IoIosClose />
              </button>
            )}
          </div>
          <div className={styles.filter}>
            <Input
              id='search-player'
              value={props.searchQuery}
              type='text'
              placeholder='Search'
              onChange={props.onSearch}
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
                  <div className={styles.rating}>{user.rating}</div>
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
