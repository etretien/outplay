import cn from 'classnames';

import { Link } from 'react-router-dom';

import styles from './Menu.module.scss';

type TProps = {
  items: { text: string; to: string; isActive: boolean }[];
};

const Menu = (props: TProps) => {
  return (
    <nav className={styles.menu}>
      <ul className={styles.list}>
        {props.items.map((item) => (
          <li
            key={item.to}
            className={cn(styles.listItem, { [styles.listItemActive]: item.isActive })}
          >
            <Link to={item.to}>{item.text}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
