import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import cn from 'classnames';
import { IoMdCheckmarkCircle } from 'react-icons/io';

import Button from '../../components/Button/Button';
import Avatar from '../../components/Avatar/Avatar';

import { users as usersStore, getUsers } from '../../stores/users';
import { countries as countriesStore } from '../../stores/countries';

import styles from './NewChallenge.module.scss';

import { TUser } from '../../types/app-types';
import NewChallengeView from './NewChallenge.view';

type TProps = {
  onCancel: () => void;
};

const NewChallenge = (props: TProps) => {
  const users = useStore(usersStore);
  const countries = useStore(countriesStore);

  const [selected, setSelected] = useState<number[]>([]);
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    if (!users.isLoaded) getUsers().catch((e) => console.log('Getting users error: ', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserClick = (id: number) => {
    setSelected((prevState) =>
      prevState.includes(id) ? prevState.filter((item) => item !== id) : [...prevState, id],
    );
  };

  const handleNameChange = (value: string) => setName(value);

  const handleDateChange = (value: string, field: string) => {
    if (field === 'startDate') setStartDate(value);
    else setEndDate(value);
  };

  return (
    <NewChallengeView
      users={users.list}
      selected={selected}
      onUserClick={handleUserClick}
      countries={countries}
      nameValue={name}
      startDate={startDate}
      endDate={endDate}
      onChangeDate={handleDateChange}
      onChangeName={handleNameChange}
      onCancel={props.onCancel}
    />
  );
};

export default NewChallenge;
