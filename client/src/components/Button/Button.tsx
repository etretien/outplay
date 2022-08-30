import cn from 'classnames';

import styles from './Button.module.scss';

type TProps = {
  size?: 's' | 'm' | 'l';
  color?: 'blue' | 'gray' | 'green' | 'transparent';
  text: string;
  className?: string;
  type?: 'submit' | 'button';
  onClick: () => void;
};

const Button = (props: TProps) => {
  const { size = 's', color = 'blue', text, className, type = 'button', onClick } = props;

  const handleClick = () => onClick();

  return (
    <button
      type={type}
      className={cn(styles.button, styles[size], styles[color], className)}
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default Button;
