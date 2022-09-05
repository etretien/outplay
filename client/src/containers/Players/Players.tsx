import { useMemo, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';

import { users as usersStore, getUsers } from '../../stores/users';
import { countries as countriesStore } from '../../stores/countries';
import { setRoute } from '../../stores/route';

import { INNER_MENU } from '../../helpers/consts';

import PlayersView from './Players.view';

const Players = () => {
  const { list: users, isLoaded: isLoadedUsers } = useStore(usersStore);
  const countries = useStore(countriesStore);

  const [filter1Option, setFilter1Option] = useState<{
    value: string | number;
    text: string;
  } | null>(null);
  const [filter2Option, setFilter2Option] = useState<{
    value: string | number;
    text: string;
  } | null>(null);

  const menuItems = useMemo(
    () =>
      INNER_MENU.map((item) => ({
        ...item,
        isActive: item.to === 'players',
      })),
    [],
  );

  useEffect(() => {
    getUsers().catch((e) => console.log('Getting users error: ', e));
  }, []);

  const handleBack = () => setRoute({ event: null, link: 'profile' });

  const handleFilter1Change = (option: { value: string | number; text: string }) => {
    setFilter1Option(option);
  };

  const handleFilter2Change = (option: { value: string | number; text: string }) => {
    setFilter2Option(option);
  };

  return (
    <PlayersView
      onClickBack={handleBack}
      filter1Option={filter1Option}
      filter2Option={filter2Option}
      onFilter1Change={handleFilter1Change}
      onFilter2Change={handleFilter2Change}
      isLoadedUsers={isLoadedUsers}
      users={users}
      countries={countries}
      menuItems={menuItems}
    />
  );
};

export default Players;
