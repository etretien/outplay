import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';

import Input from '../Input/Input';
import Button from '../Button/Button';

import { setPopup } from '../../stores/popup';

import user from '../../static/icons/user.svg';

import styles from './Avatar.module.scss';
import appStyles from '../../App.module.scss';

import { TAvatar } from '../../types/app-types';

type TProps = {
  countryCode: string;
  countryName: string | undefined;
  avatar: TAvatar | undefined;
  canUpload?: boolean;
  onUpload?: (data: File | string, type: string) => void;
};

const isValidFileSize = (fileItem: File, maxSize: number) => {
  const fileSize = fileItem?.size / 10e2;

  return maxSize ? fileSize <= maxSize : true;
};

const Avatar = (props: TProps) => {
  const [uploadMode, setUploadMode] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');

  const disableApplyUpload = useMemo(() => {
    if (file) return !isValidFileSize(file, 100);
    return !url;
  }, [url, file]);

  const handleCancelUpload = () => {
    setFile(null);
    setUrl('');
    setUploadMode(false);
  };

  useEffect(() => {
    handleCancelUpload();
  }, [props.avatar]);

  const handleUpload = () => {
    setUploadMode(true);
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const fileItem = event.target.files![0];

    if (!isValidFileSize(fileItem, 100)) {
      setPopup({
        title: 'File error',
        message: "File is too large and can't be more than 100Kb",
        description: [],
      });
    } else {
      setFile(fileItem);
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
  };

  const handleApplyUpload = () => {
    if (props.onUpload) props.onUpload(url! || file!, url.length ? 'URL' : 'IMAGE');
  };

  if (uploadMode) {
    return (
      <div className={styles.upload}>
        <div className={appStyles.container}>
          <div className={styles.uploadInput}>
            <label htmlFor='upload'>Choose file</label>
            <input type='file' id='upload' accept='.jpg, .jpeg, .png' onChange={handleFileUpload} />
          </div>
          <p>OR</p>
          <Input
            id='upload-url'
            label='Insert file url'
            value={url}
            type='text'
            onChange={handleUrlChange}
          />
          <div className={styles.actions}>
            <Button
              text='Submit'
              onClick={handleApplyUpload}
              size='m'
              disabled={disableApplyUpload}
            />
            <Button text='Cancel' color='gray' onClick={handleCancelUpload} size='m' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(styles.avatar, { [styles.avatarClickable]: props.canUpload })}
      role='presentation'
      onClick={props.canUpload ? handleUpload : undefined}
    >
      {props.avatar ? (
        <div
          className={styles.userAvatar}
          style={{
            backgroundImage: `url(${props.avatar.value})`,
          }}
        />
      ) : (
        <img src={user} alt='avatar' className={styles.avatarImage} />
      )}
      <div className={`${styles.flag} avatar__flag`}>
        <img
          src={`https://flagcdn.com/w320/${props.countryCode}.png`}
          srcSet={`https://flagcdn.com/w640/${props.countryCode}.png 2x`}
          width='100%'
          height='100%'
          alt={props.countryName}
        />
      </div>
    </div>
  );
};

export default Avatar;
