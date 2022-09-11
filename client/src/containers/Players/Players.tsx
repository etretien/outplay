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

  const [filterOption, setFilterOption] = useState<{
    value: string | number;
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const menuItems = useMemo(
    () =>
      INNER_MENU.map((item) => ({
        ...item,
        isActive: item.to === 'players',
      })),
    [],
  );

  useEffect(() => {
    const params = {
      country: (filterOption?.value as string) || '',
      searchQuery,
    };
    getUsers(params).catch((e) => console.log('Getting users error: ', e));
  }, [filterOption, searchQuery]);

  const handleBack = () => setRoute({ event: null, link: 'profile' });

  const handleFilterChange = (option: { value: string | number; text: string } | null) => {
    setFilterOption(option);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <PlayersView
      onClickBack={handleBack}
      filterOption={filterOption}
      onFilterChange={handleFilterChange}
      isLoadedUsers={isLoadedUsers}
      users={users}
      countries={countries}
      menuItems={menuItems}
      searchQuery={searchQuery}
      onSearch={handleSearch}
    />
  );
};

export default Players;
