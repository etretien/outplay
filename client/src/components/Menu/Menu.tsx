import cn from 'classnames';

import styles from './Menu.module.scss';
import { setRoute } from '../../stores/route';

type TProps = {
  items: { text: string; to: string; isActive: boolean; badge?: number | null }[];
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
            <button onClick={(e) => setRoute({ event: e, link: item.to })}>{item.text}</button>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
