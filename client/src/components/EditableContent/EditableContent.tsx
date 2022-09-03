import { ChangeEvent, useState } from 'react';

import { FaPen } from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';

import styles from './EditableContent.module.scss';

type TProps = {
  value: string;
  label: string;
  maxLength: number;
  param?: string;
  onChange: (value: string, param: string | undefined) => void;
};

const EditableContent = (props: TProps) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [value, setValue] = useState<string>(props.value);

  const handleValueChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > props.maxLength) return;
    setValue(e.target.value);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setValue(props.value);
  };

  const handleApply = () => {
    props.onChange(value, props.param);
    setIsEditMode(false);
  };

  if (isEditMode) {
    return (
      <div className={styles.editMode}>
        <label>{props.label}</label>
        <textarea value={value} onChange={handleValueChange}></textarea>
        <div className={styles.actions}>
          <button onClick={handleApply}>
            <IoMdCheckmarkCircle />
          </button>
          <button onClick={handleCancel}>
            <IoMdCloseCircle />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editable}>
      <button onClick={() => setIsEditMode(true)}>
        <FaPen />
      </button>
      <p>{`${props.label}: ${props.value}`}</p>
    </div>
  );
};

export default EditableContent;
