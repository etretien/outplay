import cn from 'classnames';
import { FaWallet } from 'react-icons/fa';

import Avatar from '../../components/Avatar/Avatar';
import EditableContent from '../../components/EditableContent/EditableContent';
import NewChallenge from '../NewChallenge/NewChallenge';
import Button from '../../components/Button/Button';
import Logo from '../../components/Logo/Logo';
import Menu from '../../components/Menu/Menu';

import currentStyles from './Profile.module.scss';
import styles from '../../App.module.scss';

import { TUser } from '../../types/app-types';

type TProps = {
  isSmall: boolean;
  onClick: () => void;
  currentUser: TUser | null;
  countries: { [field: string]: string };
  isOwner: boolean;
  onUploadAvatar: (data: string | File, type: string) => void;
  isLoaded: boolean;
  onFieldChange: (value: string, field: string | undefined) => void;
  isChallengeMode: boolean;
  onModeChange: () => void;
  onLogout: () => void;
  onBalance: () => void;
  menuItems: { to: string; text: string; isActive: boolean; icon: JSX.Element }[];
  disableActions: boolean;
  onChallengePlayer: (id: number) => void;
};

const ProfileView = (props: TProps) => {
  const renderMyChallenge = () => {
    if (props.isChallengeMode) return <NewChallenge onCancel={props.onModeChange} />;
    return (
      <Button
        className={currentStyles.newChallenge}
        text='New challenge'
        onClick={props.onModeChange}
        disabled={props.disableActions}
        size='l'
      />
    );
  };

  const renderChallenge = () => {
    return (
      <Button
        className={currentStyles.newChallenge}
        text='Challenge player'
        disabled={props.disableActions}
        onClick={() => props.onChallengePlayer(props.currentUser!.id)}
        size='l'
      />
    );
  };

  return (
    <div
      className={cn(currentStyles.profile, { [currentStyles.profileSmall]: props.isSmall })}
      role='presentation'
      onClick={props.isSmall ? props.onClick : undefined}
    >
      <div className={styles.container}>
        <div className={currentStyles.avatar}>
          <Avatar
            countryCode={props.currentUser?.countryCode || ''}
            countryName={props.countries[props.currentUser?.countryCode || '']}
            avatar={props.currentUser?.avatar || null}
            canUpload={props.isOwner && !props.isSmall}
            onUpload={props.onUploadAvatar}
          />
        </div>
        {!props.isSmall && (
          <>
            <h2>
              {props.isOwner && props.currentUser && (
                <button
                  className={styles.link}
                  onClick={props.onBalance}
                  disabled={props.disableActions}
                >
                  Token Balance
                  <FaWallet />
                </button>
              )}
            </h2>
            {props.isLoaded && props.currentUser ? (
              <>
                <h1>{`${props.currentUser.firstName} ${props.currentUser.lastName}`}</h1>
                <div className={currentStyles.info}>
                  <div className={currentStyles.infoRow}>
                    <p>{`Rating: ${props.currentUser.rating}`}</p>
                  </div>
                  <div className={currentStyles.infoRow}>
                    <EditableContent
                      value={props.currentUser.about || ''}
                      label={`About ${props.currentUser.firstName}`}
                      maxLength={100}
                      param='about'
                      canEdit={props.isOwner}
                      onChange={props.onFieldChange}
                    />
                  </div>
                  <div className={currentStyles.infoRow}>
                    <EditableContent
                      value={props.currentUser.gameLevel || ''}
                      label='Game level'
                      maxLength={100}
                      param='gameLevel'
                      canEdit={props.isOwner}
                      onChange={props.onFieldChange}
                    />
                  </div>
                </div>
                {props.isOwner ? renderMyChallenge() : renderChallenge()}
                {props.isOwner && (
                  <button className={currentStyles.logout} onClick={props.onLogout}>
                    Logout
                  </button>
                )}
              </>
            ) : (
              <Logo style='min' />
            )}
            <Menu items={props.menuItems} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
