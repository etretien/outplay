import cn from 'classnames';

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
  menuItems: { to: string; text: string; isActive: boolean }[];
};

const ProfileView = (props: TProps) => {
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
              {props.isOwner && props.currentUser && `Token balance: ${props.currentUser.balance}`}
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
                      onChange={props.onFieldChange}
                    />
                  </div>
                  <div className={currentStyles.infoRow}>
                    <EditableContent
                      value={props.currentUser.gameLevel || ''}
                      label='Game level'
                      maxLength={100}
                      param='gameLevel'
                      onChange={props.onFieldChange}
                    />
                  </div>
                </div>
                {props.isChallengeMode ? (
                  <NewChallenge onCancel={props.onModeChange} />
                ) : (
                  <Button
                    className={currentStyles.newChallenge}
                    text='New challenge'
                    onClick={props.onModeChange}
                    size='l'
                  />
                )}
                {/*<Alert
                  header={alertHeader}
                  cancelText='Dismiss'
                  applyText='Accept'
                  onCancel={() => {}}
                  onApply={() => {}}
                />*/}
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
