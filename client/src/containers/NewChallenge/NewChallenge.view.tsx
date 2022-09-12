import { IoMdCheckmarkCircle } from 'react-icons/io';
import cn from 'classnames';

import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';
import Logo from '../../components/Logo/Logo';

import styles from './NewChallenge.module.scss';
import appStyles from '../../App.module.scss';

import { TUser } from '../../types/app-types';

type TProps = {
  users: TUser[];
  selected: number[];
  onUserClick: (id: number) => void;
  countries: { [field: string]: string };
  nameValue: string;
  startDate: string;
  endDate: string;
  errors: Record<string, string>;
  isLoading: boolean;
  onChangeName: (value: string) => void;
  onChangeDate: (value: string, param: string) => void;
  onCancel: () => void;
  onApply: () => void;
};

const NewChallengeView = (props: TProps) => {
  return (
    <div className={styles.newChallenge}>
      {props.isLoading && (
        <div className={appStyles.import}>
          <Logo style='min' />
        </div>
      )}
      <div className={styles.list}>
        {props.users.map((user: TUser) => {
          const isSelected = props.selected.includes(user.id);
          return (
            <button
              className={cn(styles.user, { [styles.selected]: isSelected })}
              onClick={() => props.onUserClick(user.id)}
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
              {isSelected && (
                <div className={styles.selectedIcon}>
                  <IoMdCheckmarkCircle />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className={styles.settings}>
        <Input
          id='challenge-name'
          label='Challenge name'
          value={props.nameValue}
          type='text'
          error={props.errors.nameValue}
          onChange={props.onChangeName}
        />
        {/*<div className={styles.dates}>
          <Input
            id='challenge-start'
            label='Start date'
            value={props.startDate}
            type='date'
            param='startDate'
            error={props.errors.startDate}
            onChange={props.onChangeDate}
          />
          <Input
            id='challenge-end'
            label='End date'
            value={props.endDate}
            type='date'
            param='endDate'
            error={props.errors.endDate}
            onChange={props.onChangeDate}
          />
        </div>*/}
      </div>
      <p className={styles.error}>{props.errors.selected}&nbsp;</p>
      <div className={styles.actions}>
        <Button text='Confirm' color='green' onClick={props.onApply} size='m' />
        <Button text='Cancel' color='gray' onClick={props.onCancel} size='m' />
      </div>
    </div>
  );
};

export default NewChallengeView;
