import { IoMdCheckmarkCircle } from 'react-icons/io';
import cn from 'classnames';

import Avatar from '../../components/Avatar/Avatar';
import Button from '../../components/Button/Button';
import Input from '../../components/Input/Input';

import styles from './NewChallenge.module.scss';

import { TUser } from '../../types/app-types';

type TProps = {
  users: TUser[];
  selected: number[];
  onUserClick: (id: number) => void;
  countries: { [field: string]: string };
  nameValue: string;
  startDate: string;
  endDate: string;
  onChangeName: (value: string) => void;
  onChangeDate: (value: string, param: string) => void;
  onCancel: () => void;
};

const NewChallengeView = (props: TProps) => {
  return (
    <div className={styles.newChallenge}>
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
          onChange={props.onChangeName}
        />
        <div className={styles.dates}>
          <Input
            id='challenge-start'
            label='Start date'
            value={props.startDate}
            type='date'
            param='startDate'
            onChange={props.onChangeDate}
          />
          <Input
            id='challenge-end'
            label='End date'
            value={props.endDate}
            type='date'
            param='endDate'
            onChange={props.onChangeDate}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <Button text='Accept' color='green' onClick={() => {}} size='m' />
        <Button text='Cancel' color='gray' onClick={props.onCancel} size='m' />
      </div>
    </div>
  );
};

export default NewChallengeView;
