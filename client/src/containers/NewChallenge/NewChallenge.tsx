import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';

import $api from '../../api';

import { users as usersStore, getUsers } from '../../stores/users';
import { countries as countriesStore } from '../../stores/countries';
import { profile as profileStore } from '../../stores/profile';
import { setPopup } from '../../stores/popup';

import NewChallengeView from './NewChallenge.view';

type TProps = {
  onCancel: () => void;
};

const NewChallenge = (props: TProps) => {
  const users = useStore(usersStore);
  const countries = useStore(countriesStore);
  const user = useStore(profileStore);

  const [selected, setSelected] = useState<number[]>([]);
  const [name, setName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUsers = useMemo(
    () => users.list.filter((item) => item.id !== user.profile!.id),
    [users, user],
  );

  useEffect(() => {
    if (!users.isLoaded) getUsers().catch((e) => console.log('Getting users error: ', e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserClick = (id: number) => {
    setSelected((prevState) =>
      prevState.includes(id) ? prevState.filter((item) => item !== id) : [...prevState, id],
    );
    setErrors((prevState) => ({ ...prevState, selected: '' }));
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setErrors((prevState) => ({ ...prevState, nameValue: '' }));
  };

  const handleDateChange = (value: string, field: string) => {
    if (field === 'startDate') setStartDate(value);
    else setEndDate(value);
    setErrors((prevState) => ({ ...prevState, [field]: '' }));
  };

  const handleApply = async () => {
    const errors: Record<string, string> = {};
    if (!name.length) errors.nameValue = 'Name cannot be empty';
    if (!selected.length) errors.selected = 'Please, select at least one player';
    // if (!startDate.length) errors.startDate = 'Date cannot be empty';
    // if (!endDate.length) errors.endDate = 'Date cannot be empty';

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    $api
      .post('challenges', {
        creatorId: user.profile!.id,
        userIds: selected,
        eventName: name,
      })
      .then((response) => {
        if (response.data.success) {
          setPopup({
            title: 'Challenge created',
            message: 'Challenge was successfully created',
            description: [],
          });
          props.onCancel();
        } else {
          setPopup({
            title: 'Error',
            message: 'There was an error during challenge creation. Please, try again',
            description: [],
          });
        }
      })
      .catch((e) => console.log('Creating challenge error: ', e));
  };

  return (
    <NewChallengeView
      users={currentUsers}
      selected={selected}
      onUserClick={handleUserClick}
      countries={countries}
      nameValue={name}
      startDate={startDate}
      endDate={endDate}
      errors={errors}
      onChangeDate={handleDateChange}
      onChangeName={handleNameChange}
      onCancel={props.onCancel}
      onApply={handleApply}
    />
  );
};

export default NewChallenge;
