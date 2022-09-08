import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useStore } from '@nanostores/react';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';

import { profile as profileStore } from '../../../stores/profile';

import Button from '../../../components/Button/Button';
import Select from '../../../components/Select/Select';

import styles from '../Challenges.module.scss';

import { TEvent } from '../../../types/app-types';

type TProps = {
  event: TEvent;
  onCancel: () => void;
  onSave?: (id: number, data: Record<string, any>) => void;
};

const Results = (props: TProps) => {
  const { event } = props;
  const { profile } = useStore(profileStore);

  const [team1, setTeam1] = useState<{ value: number; text: string }[]>([]);
  const [team2, setTeam2] = useState<{ value: number; text: string }[]>([]);
  const options = useMemo(() => {
    return [profile, ...event.participants]
      .filter(
        (item) =>
          !team1.some((p) => p.value === item!.id) && !team2.some((p) => p.value === item!.id),
      )
      .map((item) => ({
        value: item!.id,
        text: `${item!.firstName} ${item!.lastName}`,
      }));
  }, [event.participants, profile, team1, team2]);
  const [sets, setSets] = useState<{ team1: number; team2: number; id: number }[]>([
    {
      team1: 0,
      team2: 0,
      id: 1,
    },
  ]);

  const disableSave = useMemo(() => {
    if (event.participants.length === 1) return false;
    return options.length > 0;
  }, [event.participants.length, options.length]);

  useEffect(() => {
    if (event.participants.length === 1) {
      setTeam1([{ value: profile!.id, text: `${profile!.firstName} ${profile!.lastName}` }]);
      setTeam2([
        {
          value: event.participants[0].id,
          text: `${event.participants[0].firstName} ${event.participants[0].lastName}`,
        },
      ]);
    }
  }, [event.participants, profile]);

  const handleAddPlayer = () => {
    const player1 = options[0] || '';
    const player2 = options[1] || '';
    setTeam1((prevState) => [...prevState, player1]);
    setTeam2((prevState) => [...prevState, player2]);
  };

  const handleRemovePlayer = (id: number, team: string) => {
    if (team === 'team1') setTeam1((prevState) => prevState.filter((item) => item.value !== id));
    else setTeam2((prevState) => prevState.filter((item) => item.value !== id));
  };

  const handleTeam1Change = (option: { value: string | number }, prevValue = '') => {
    setTeam1((prevState) => {
      const filtered = prevState.filter((item) => item.value !== +prevValue);
      return [...filtered, option as { value: number; text: string }];
    });
  };

  const handleTeam2Change = (option: { value: string | number }, prevValue = '') => {
    setTeam2((prevState) => {
      const filtered = prevState.filter((item) => item.value !== +prevValue);
      return [...filtered, option as { value: number; text: string }];
    });
  };

  const handleAddSet = () => {
    setSets((prevState) => [...prevState, { id: Math.random(), team1: 0, team2: 0 }]);
  };

  const handleSetChange = (e: ChangeEvent<HTMLInputElement>, id: number, team: string) => {
    setSets((prevState) =>
      prevState.map((item) => {
        if (item.id === id) return { ...item, [team]: +e.target.value };
        return item;
      }),
    );
  };

  const handleRemoveSet = (id: number) => {
    setSets((prevState) => prevState.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (props.onSave) {
      props.onSave(event.id, {
        team1: team1.map(({ value }) => value).filter((item) => !!item),
        team2: team2.map(({ value }) => value).filter((item) => !!item),
        sets,
      });
    }
  };

  const renderTeams = () => {
    return (
      <div className={styles.teams}>
        <div className={styles.team}>
          <p className={styles.teamName}>Team 1</p>
          {team1.map((item) => (
            <div className={styles.player} key={item.value}>
              <Select
                selected={item}
                options={options}
                param={item?.value?.toString()}
                onChange={handleTeam1Change}
              />
              <button onClick={() => handleRemovePlayer(item.value, 'team1')}>
                <FaMinusCircle />
              </button>
            </div>
          ))}
          {options.length > 0 && (
            <div className={styles.addPlayer}>
              <button onClick={handleAddPlayer}>
                <FaPlusCircle />
              </button>
            </div>
          )}
        </div>
        <div className={styles.team}>
          <p className={styles.teamName}>Team 2</p>
          {team2.map((item) => (
            <div className={styles.player} key={item.value}>
              <Select
                selected={item}
                options={options}
                param={item?.value?.toString()}
                onChange={handleTeam2Change}
              />
              <button onClick={() => handleRemovePlayer(item.value, 'team2')}>
                <FaMinusCircle />
              </button>
            </div>
          ))}
          {options.length > 0 && (
            <div className={styles.addPlayer}>
              <button onClick={handleAddPlayer}>
                <FaPlusCircle />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTable = () => {
    const player1 =
      event.participants.length > 1 ? 'Team 1' : `${profile!.firstName} ${profile!.lastName}`;
    const player2 =
      event.participants.length > 1
        ? 'Team 2'
        : `${event.participants[0].firstName} ${event.participants[0].lastName}`;
    return (
      <div className={styles.table}>
        <div className={styles.tableRow}>
          <div className={styles.tableHeader} />
          <div className={styles.tableHeader}>{player1}</div>
          <div className={styles.tableHeader}>{player2}</div>
        </div>
        {sets.map((set, index) => (
          <div className={styles.tableRow} key={set.id}>
            <div className={styles.set}>{`Set ${index + 1}`}</div>
            <div className={styles.setResult}>
              <input
                type='number'
                value={set.team1}
                min={0}
                onChange={(e) => handleSetChange(e, set.id, 'team1')}
              />
            </div>
            <div className={styles.setResult}>
              <input
                type='number'
                value={set.team2}
                min={0}
                onChange={(e) => handleSetChange(e, set.id, 'team2')}
              />
            </div>
            {set.id !== 1 && (
              <div className={styles.removeSet}>
                <button onClick={() => handleRemoveSet(set.id)}>
                  <FaMinusCircle />
                </button>
              </div>
            )}
          </div>
        ))}
        <div className={styles.tableRow}>
          <div className={styles.addSet}>
            <button onClick={handleAddSet}>
              <FaPlusCircle />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.results}>
      <h4>Results</h4>
      {event.participants.length > 1 && renderTeams()}
      {renderTable()}
      <div className={styles.actions}>
        <Button text='Save' disabled={disableSave} onClick={handleSave} color='green' />
        <Button text='Cancel' onClick={props.onCancel} color='gray' />
      </div>
    </div>
  );
};

export default Results;
